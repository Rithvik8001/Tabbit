export const EXPENSE_RECEIPT_BUCKET = "expense-receipts";
export const EXPENSE_RECEIPT_MAX_SERVER_BYTES = 5_000_000;
export const EXPENSE_RECEIPT_MAX_CLIENT_BYTES = 4_000_000;
export const EXPENSE_RECEIPT_MAX_DIMENSION = 1600;

export const EXPENSE_RECEIPT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type ExpenseReceiptMimeType =
  (typeof EXPENSE_RECEIPT_ALLOWED_MIME_TYPES)[number];

export type ExpenseReceiptMetadata = {
  receiptBucket: string | null;
  receiptObjectPath: string | null;
  receiptMimeType: string | null;
  receiptSizeBytes: number | null;
  receiptUploadedBy: string | null;
  receiptUploadedAt: string | null;
};

export type PreparedExpenseReceiptUpload = {
  localUri: string;
  mimeType: ExpenseReceiptMimeType;
  sizeBytes: number;
  width: number;
  height: number;
  fileExtension: "jpg" | "jpeg" | "png" | "webp" | "heic" | "heif";
};

export type AttachExpenseReceiptInput = {
  bucket: string;
  objectPath: string;
  mimeType: ExpenseReceiptMimeType;
  sizeBytes: number;
};
