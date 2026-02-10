import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import {
  newExpenseEmail,
  settlementRecordedEmail,
} from "../_shared/email-templates.ts";
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

function formatCents(cents: number): string {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
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

    const rawRecord = parsedPayload.payload.record;
    if (!isObjectRecord(rawRecord)) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    const splitUserId = rawRecord.user_id;
    const expenseId = rawRecord.expense_id;
    const rawShareCents = rawRecord.share_cents;

    const splitAmountCents =
      typeof rawShareCents === "number"
        ? rawShareCents
        : typeof rawShareCents === "string"
          ? Number.parseInt(rawShareCents, 10)
          : Number.NaN;

    if (
      typeof splitUserId !== "string" ||
      typeof expenseId !== "string" ||
      !Number.isFinite(splitAmountCents)
    ) {
      return new Response("Invalid webhook payload", { status: 400 });
    }

    // Look up the parent expense
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from("expenses")
      .select("description, paid_by, group_id, entry_type, created_at, updated_at")
      .eq("id", expenseId)
      .maybeSingle();

    if (expenseError || !expense) {
      return new Response("Skipped: expense not found", { status: 200 });
    }

    // Skip notifications for edited expenses (splits were re-inserted after update)
    const createdAt = new Date(expense.created_at).getTime();
    const updatedAt = new Date(expense.updated_at).getTime();
    if (updatedAt - createdAt > 5000) {
      return new Response("Skipped: expense edit, not new", { status: 200 });
    }

    const payerId: string = expense.paid_by;
    const entryType: string = expense.entry_type || "expense";
    const groupId: string = expense.group_id;

    // Look up group name for email context
    const { data: group } = await supabaseAdmin
      .from("groups")
      .select("name, emoji")
      .eq("id", groupId)
      .maybeSingle();

    const groupLabel = group
      ? `${group.emoji || ""} ${group.name}`.trim()
      : "a group";

    if (entryType === "settlement") {
      // Settlement: notify the counterparty (the person who didn't record it)
      // The split user is the recipient of the settlement
      // Skip self-notification
      if (splitUserId === payerId) {
        return new Response("Skipped: self-notification", { status: 200 });
      }

      if (!(await shouldNotify(splitUserId, "settlement_recorded"))) {
        return new Response("Skipped: notifications disabled", { status: 200 });
      }

      const [payer, recipient] = await Promise.all([
        getProfile(payerId),
        getProfile(splitUserId),
      ]);

      if (!payer || !recipient || !recipient.email) {
        return new Response("Skipped: missing profile data", { status: 200 });
      }

      const payerName = payer.display_name || "Someone";

      const template = settlementRecordedEmail(
        payerName,
        formatCents(splitAmountCents),
        groupLabel,
      );

      await sendEmail(
        recipient.email,
        template.subject,
        template.html,
        template.text,
      );
    } else {
      // Regular expense: notify split participant (skip the payer / creator)
      if (splitUserId === payerId) {
        return new Response("Skipped: payer is split participant", {
          status: 200,
        });
      }

      if (!(await shouldNotify(splitUserId, "new_expense"))) {
        return new Response("Skipped: notifications disabled", { status: 200 });
      }

      const [payer, participant] = await Promise.all([
        getProfile(payerId),
        getProfile(splitUserId),
      ]);

      if (!payer || !participant || !participant.email) {
        return new Response("Skipped: missing profile data", { status: 200 });
      }

      const payerName = payer.display_name || "Someone";
      const description = expense.description || "an expense";

      const template = newExpenseEmail(
        payerName,
        description,
        formatCents(splitAmountCents),
        groupLabel,
      );

      await sendEmail(
        participant.email,
        template.subject,
        template.html,
        template.text,
      );
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-expense error:", err);
    return new Response("Error", { status: 200 });
  }
});
