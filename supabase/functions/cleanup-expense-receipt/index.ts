import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

import { supabaseAdmin } from "../_shared/supabase-admin.ts";
import {
  isObjectRecord,
  parseWebhookPayload,
  validateWebhookRequest,
} from "../_shared/webhook-auth.ts";

type CleanupRecord = {
  id: number;
  bucket_id: string;
  object_path: string;
  status: string;
};

function parseCleanupRecord(value: unknown): CleanupRecord | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const rawId = value.id;
  const rawBucketId = value.bucket_id;
  const rawObjectPath = value.object_path;
  const rawStatus = value.status;

  const id =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number.parseInt(rawId, 10)
        : Number.NaN;

  if (
    !Number.isFinite(id) ||
    typeof rawBucketId !== "string" ||
    typeof rawObjectPath !== "string" ||
    typeof rawStatus !== "string"
  ) {
    return null;
  }

  return {
    id,
    bucket_id: rawBucketId,
    object_path: rawObjectPath,
    status: rawStatus,
  };
}

function isNotFoundStorageError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("no such") ||
    normalized.includes("does not exist")
  );
}

async function markQueueRow(
  id: number,
  status: "success" | "error",
  error: string | null,
) {
  const { error: updateError } = await supabaseAdmin
    .from("expense_receipt_cleanup_queue")
    .update({
      status,
      error,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (updateError) {
    console.error("cleanup-expense-receipt: queue update failed", updateError);
  }
}

serve(async (req) => {
  const authError = validateWebhookRequest(req);
  if (authError) {
    return authError;
  }

  try {
    const parsedPayload = await parseWebhookPayload(req);
    if (!parsedPayload.ok) {
      return parsedPayload.response;
    }

    const cleanupRecord = parseCleanupRecord(parsedPayload.payload.record);
    if (!cleanupRecord) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    if (cleanupRecord.status !== "pending") {
      return new Response("Skipped: non-pending row", { status: 200 });
    }

    const { error: removeError } = await supabaseAdmin.storage
      .from(cleanupRecord.bucket_id)
      .remove([cleanupRecord.object_path]);

    if (removeError && !isNotFoundStorageError(removeError.message)) {
      await markQueueRow(cleanupRecord.id, "error", removeError.message);
      return new Response("Error", { status: 200 });
    }

    await markQueueRow(cleanupRecord.id, "success", null);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("cleanup-expense-receipt error:", error);
    return new Response("Error", { status: 200 });
  }
});
