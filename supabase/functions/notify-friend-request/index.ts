import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";
import { getProfile, shouldNotify } from "../_shared/supabase-admin.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record || record.status !== "pending") {
      return new Response("Skipped: not a pending request", { status: 200 });
    }

    const requesterId: string = record.requester_id;
    const addresseeId: string = record.addressee_id;

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

    await sendEmail(
      addressee.email,
      `${requesterName} sent you a friend request`,
      `<p><strong>${requesterName}</strong> sent you a friend request on Tabbit.</p>
       <p>Open the app to accept or decline.</p>`,
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notify-friend-request error:", err);
    return new Response("Error", { status: 200 });
  }
});
