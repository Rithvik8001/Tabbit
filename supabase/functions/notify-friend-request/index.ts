import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import { friendRequestEmail } from "../_shared/email-templates.ts";
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
    if (!isObjectRecord(rawRecord)) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    const status = rawRecord.status;
    const requesterId = rawRecord.requester_id;
    const addresseeId = rawRecord.addressee_id;

    if (
      typeof status !== "string" ||
      typeof requesterId !== "string" ||
      typeof addresseeId !== "string"
    ) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    if (status !== "pending") {
      return new Response("Skipped: not a pending request", { status: 200 });
    }

    // Check addressee's notification preference
    if (!(await shouldNotify(addresseeId, "friend_request_received"))) {
      return new Response("Skipped: notifications disabled", { status: 200 });
    }

    const [requester, addressee] = await Promise.all([
      getProfile(requesterId),
      getProfile(addresseeId),
    ]);

    if (!requester || !addressee || !addressee.email) {
      return new Response("Skipped: missing profile data", { status: 200 });
    }

    const requesterName = requester.display_name || "Someone";

    const template = friendRequestEmail(requesterName);

    await sendEmail(
      addressee.email,
      template.subject,
      template.html,
      template.text,
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-friend-request error:", err);
    return new Response("Error", { status: 200 });
  }
});
