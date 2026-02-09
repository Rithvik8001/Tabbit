const WEBHOOK_SECRET_HEADER = "x-tabbit-webhook-secret";
const textEncoder = new TextEncoder();

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);

  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    const leftByte = index < leftBytes.length ? leftBytes[index] : 0;
    const rightByte = index < rightBytes.length ? rightBytes[index] : 0;
    diff |= leftByte ^ rightByte;
  }

  return diff === 0;
}

export function validateWebhookRequest(req: Request): Response | null {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const expectedSecret = Deno.env.get("DB_WEBHOOK_SECRET");
  if (!expectedSecret) {
    console.error("DB_WEBHOOK_SECRET is not set");
    return new Response("Webhook auth is not configured", { status: 500 });
  }

  const providedSecret = req.headers.get(WEBHOOK_SECRET_HEADER);
  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}

export function isObjectRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function parseWebhookPayload(
  req: Request,
): Promise<
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; response: Response }
> {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return {
      ok: false,
      response: new Response("Invalid JSON payload", { status: 400 }),
    };
  }

  if (!isObjectRecord(payload)) {
    return {
      ok: false,
      response: new Response("Invalid webhook payload", { status: 400 }),
    };
  }

  return { ok: true, payload };
}
