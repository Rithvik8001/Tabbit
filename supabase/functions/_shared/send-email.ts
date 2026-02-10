const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_ADDRESS = Deno.env.get("EMAIL_FROM") ?? "Tabbit <notifications@tabbit.sh>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return { ok: false, error: "Missing RESEND_API_KEY" };
  }

  try {
    const payload: Record<string, string> = {
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    };

    if (text && text.trim().length > 0) {
      payload.text = text;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error:", res.status, body);
      return { ok: false, error: body };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendEmail failed:", err);
    return { ok: false, error: String(err) };
  }
}
