import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import { addedToGroupEmail } from "../_shared/email-templates.ts";
import {
  getProfile,
  shouldNotify,
  supabaseAdmin,
} from "../_shared/supabase-admin.ts";
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

    const memberId = rawRecord.user_id;
    const groupId = rawRecord.group_id;

    if (typeof memberId !== "string" || typeof groupId !== "string") {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    // Look up group — skip direct_friendship groups
    const { data: group, error: groupError } = await supabaseAdmin
      .from("groups")
      .select("name, emoji, group_kind")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError || !group || group.group_kind === "direct_friendship") {
      return new Response("Skipped: no group or direct friendship", {
        status: 200,
      });
    }

    // Check member's notification preference
    if (!(await shouldNotify(memberId, "added_to_group"))) {
      return new Response("Skipped: notifications disabled", { status: 200 });
    }

    const member = await getProfile(memberId);
    if (!member || !member.email) {
      return new Response("Skipped: missing profile data", { status: 200 });
    }

    const groupLabel = `${group.emoji || ""} ${group.name}`.trim();

    await sendEmail(
      member.email,
      `You were added to ${groupLabel}`,
      addedToGroupEmail(groupLabel),
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-added-to-group error:", err);
    return new Response("Error", { status: 200 });
  }
});
