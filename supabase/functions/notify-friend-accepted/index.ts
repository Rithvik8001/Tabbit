import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import { getProfile, shouldNotify } from "../_shared/supabase-admin.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    const oldRecord = payload.old_record;

    // Only trigger when status transitions to "accepted"
    if (
      !record ||
      !oldRecord ||
      oldRecord.status !== "pending" ||
      record.status !== "accepted"
    ) {
      return new Response("Skipped: not a pending→accepted transition", {
        status: 200,
      });
    }

    const requesterId: string = record.requester_id;
    const addresseeId: string = record.addressee_id;

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
      `<p><strong>${acceptorName}</strong> accepted your friend request on Tabbit.</p>
       <p>You can now split expenses together!</p>`,
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-friend-accepted error:", err);
    return new Response("Error", { status: 200 });
  }
});
