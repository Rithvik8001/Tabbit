import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import { friendAcceptedEmail } from "../_shared/email-templates.ts";
import { getProfile, shouldNotify } from "../_shared/supabase-admin.ts";
import {
  isObjectRecord,
  parseWebhookPayload,
  validateWebhookRequest,
} from "../_shared/webhook-auth.ts";

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

    const rawRecord = parsedPayload.payload.record;
    const rawOldRecord = parsedPayload.payload.old_record;

    if (!isObjectRecord(rawRecord) || !isObjectRecord(rawOldRecord)) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    const currentStatus = rawRecord.status;
    const previousStatus = rawOldRecord.status;
    const requesterId = rawRecord.requester_id;
    const addresseeId = rawRecord.addressee_id;

    if (
      typeof currentStatus !== "string" ||
      typeof previousStatus !== "string" ||
      typeof requesterId !== "string" ||
      typeof addresseeId !== "string"
    ) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    // Only trigger when status transitions to "accepted"
    if (
      previousStatus !== "pending" ||
      currentStatus !== "accepted"
    ) {
      return new Response("Skipped: not a pending→accepted transition", {
        status: 200,
      });
    }

    // Check original requester's notification preference
    if (!(await shouldNotify(requesterId, "friend_request_accepted"))) {
      return new Response("Skipped: notifications disabled", { status: 200 });
    }

    const [requester, acceptor] = await Promise.all([
      getProfile(requesterId),
      getProfile(addresseeId),
    ]);

    if (!requester || !requester.email || !acceptor) {
      return new Response("Skipped: missing profile data", { status: 200 });
    }

    const acceptorName = acceptor.display_name || "Someone";

    await sendEmail(
      requester.email,
      `${acceptorName} accepted your friend request`,
      friendAcceptedEmail(acceptorName),
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-friend-accepted error:", err);
    return new Response("Error", { status: 200 });
  }
});
