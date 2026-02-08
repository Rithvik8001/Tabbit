import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import {
  getProfile,
  shouldNotify,
  supabaseAdmin,
} from "../_shared/supabase-admin.ts";

function formatCents(cents: number): string {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response("Skipped: no record", { status: 200 });
    }

    const splitUserId: string = record.user_id;
    const expenseId: string = record.expense_id;
    const splitAmountCents: number = record.amount;

    // Look up the parent expense
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from("expenses")
      .select("description, paid_by, group_id, entry_type")
      .eq("id", expenseId)
      .maybeSingle();

    if (expenseError || !expense) {
      return new Response("Skipped: expense not found", { status: 200 });
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

      await sendEmail(
        recipient.email,
        `${payerName} settled ${formatCents(splitAmountCents)} with you`,
        `<p><strong>${payerName}</strong> settled <strong>${formatCents(splitAmountCents)}</strong> with you in ${groupLabel}.</p>
         <p>Open the app to see the details.</p>`,
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

      await sendEmail(
        participant.email,
        `${payerName} added ${formatCents(splitAmountCents)} in ${groupLabel}`,
        `<p><strong>${payerName}</strong> added <strong>"${description}"</strong> (${formatCents(splitAmountCents)}) in ${groupLabel}.</p>
         <p>Open the app to see the details.</p>`,
      );
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-expense error:", err);
    return new Response("Error", { status: 200 });
  }
});
