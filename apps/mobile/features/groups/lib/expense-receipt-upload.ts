import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/features/auth/lib/supabase-client";
import {
  attachExpenseReceipt,
  clearExpenseReceipt,
} from "@/features/groups/lib/expenses-repository";
import type {
  AttachExpenseReceiptInput,
  ExpenseReceiptMetadata,
  PreparedExpenseReceiptUpload,
} from "@/features/groups/types/expense-receipt.types";
import {
  EXPENSE_RECEIPT_BUCKET,
  EXPENSE_RECEIPT_MAX_CLIENT_BYTES,
  EXPENSE_RECEIPT_MAX_DIMENSION,
} from "@/features/groups/types/expense-receipt.types";

type ReceiptResult<T> = { ok: true; data: T } | { ok: false; message: string };

const DEFAULT_JPEG_QUALITY = 0.78;

export function areExpenseReceiptsEnabled(): boolean {
  return process.env.EXPO_PUBLIC_EXPENSE_RECEIPTS_ENABLED === "true";
}

function toJpegUpload(
  uri: string,
  width: number | null | undefined,
  height: number | null | undefined,
): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  const safeWidth = Number.isFinite(width) ? Number(width) : 0;
  const safeHeight = Number.isFinite(height) ? Number(height) : 0;
  const longestEdge = Math.max(safeWidth, safeHeight);

  const resizeAction =
    longestEdge > EXPENSE_RECEIPT_MAX_DIMENSION
      ? safeWidth >= safeHeight
        ? [{ resize: { width: EXPENSE_RECEIPT_MAX_DIMENSION } }]
        : [{ resize: { height: EXPENSE_RECEIPT_MAX_DIMENSION } }]
      : [];

  return ImageManipulator.manipulateAsync(uri, resizeAction, {
    compress: DEFAULT_JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: false,
  });
}

async function readFileAsArrayBuffer(uri: string): Promise<ReceiptResult<ArrayBuffer>> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      return {
        ok: false,
        message: "Could not read selected image.",
      };
    }

    const fileBuffer = await response.arrayBuffer();
    return { ok: true, data: fileBuffer };
  } catch {
    return {
      ok: false,
      message: "Could not process selected image.",
    };
  }
}

export async function pickAndPrepareExpenseReceipt(): Promise<
  ReceiptResult<PreparedExpenseReceiptUpload | null>
> {
  if (!areExpenseReceiptsEnabled()) {
    return {
      ok: false,
      message: "Receipt uploads are disabled in this build.",
    };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      message: "Photo library permission is required to attach a receipt.",
    };
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
    exif: false,
    allowsMultipleSelection: false,
  });

  if (pickerResult.canceled) {
    return { ok: true, data: null };
  }

  const selectedAsset = pickerResult.assets[0];
  if (!selectedAsset?.uri) {
    return {
      ok: false,
      message: "No image was selected.",
    };
  }

  const transformedImage = await toJpegUpload(
    selectedAsset.uri,
    selectedAsset.width,
    selectedAsset.height,
  );

  const fileBufferResult = await readFileAsArrayBuffer(transformedImage.uri);
  if (!fileBufferResult.ok) {
    return fileBufferResult;
  }

  const sizeBytes = fileBufferResult.data.byteLength;
  if (sizeBytes <= 0 || sizeBytes > EXPENSE_RECEIPT_MAX_CLIENT_BYTES) {
    return {
      ok: false,
      message: "Receipt image must be 4 MB or smaller after compression.",
    };
  }

  return {
    ok: true,
    data: {
      localUri: transformedImage.uri,
      mimeType: "image/jpeg",
      sizeBytes,
      width: transformedImage.width,
      height: transformedImage.height,
      fileExtension: "jpg",
    },
  };
}

function randomObjectId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildObjectPath(
  expenseId: string,
  uploaderId: string,
  extension: string,
): string {
  return `expenses/${expenseId}/${uploaderId}/${randomObjectId()}.${extension}`;
}

export async function uploadAndAttachExpenseReceipt(input: {
  expenseId: string;
  uploaderId: string;
  preparedReceipt: PreparedExpenseReceiptUpload;
}): Promise<ReceiptResult<ExpenseReceiptMetadata>> {
  if (!areExpenseReceiptsEnabled()) {
    return {
      ok: false,
      message: "Receipt uploads are disabled in this build.",
    };
  }

  const fileBufferResult = await readFileAsArrayBuffer(input.preparedReceipt.localUri);
  if (!fileBufferResult.ok) {
    return fileBufferResult;
  }

  if (fileBufferResult.data.byteLength !== input.preparedReceipt.sizeBytes) {
    return {
      ok: false,
      message: "Receipt file changed before upload. Please reselect the image.",
    };
  }

  const objectPath = buildObjectPath(
    input.expenseId,
    input.uploaderId,
    input.preparedReceipt.fileExtension,
  );

  const { error: uploadError } = await supabase.storage
    .from(EXPENSE_RECEIPT_BUCKET)
    .upload(objectPath, fileBufferResult.data, {
      contentType: input.preparedReceipt.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: uploadError.message || "Receipt upload failed.",
    };
  }

  const attachPayload: AttachExpenseReceiptInput = {
    bucket: EXPENSE_RECEIPT_BUCKET,
    objectPath,
    mimeType: input.preparedReceipt.mimeType,
    sizeBytes: input.preparedReceipt.sizeBytes,
  };
  const attachResult = await attachExpenseReceipt(input.expenseId, attachPayload);

  if (!attachResult.ok) {
    await supabase.storage.from(EXPENSE_RECEIPT_BUCKET).remove([objectPath]);
    return {
      ok: false,
      message: attachResult.message,
    };
  }

  return {
    ok: true,
    data: attachResult.data,
  };
}

export async function clearExpenseReceiptAttachment(
  expenseId: string,
): Promise<ReceiptResult<ExpenseReceiptMetadata>> {
  if (!areExpenseReceiptsEnabled()) {
    return {
      ok: false,
      message: "Receipt uploads are disabled in this build.",
    };
  }

  const result = await clearExpenseReceipt(expenseId);
  if (!result.ok) {
    return result;
  }

  return { ok: true, data: result.data };
}
