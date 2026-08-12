function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const configuredSecret = process.env.LOVENSE_CALLBACK_SECRET;
  if (!configuredSecret) {
    console.error("LOVENSE_CALLBACK_SECRET is not configured");
    return Response.json({ error: "Callback is not configured" }, { status: 500 });
  }

  const requestUrl = new URL(req.url);
  const querySecret = requestUrl.searchParams.get("secret") ?? "";
  const headerSecret = req.headers.get("x-lovense-callback-secret") ?? "";
  const suppliedSecret = querySecret || headerSecret;

  if (!suppliedSecret || !safeEqual(suppliedSecret, configuredSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const uid = typeof data.uid === "string" ? data.uid : null;
  const toys = data.toys && typeof data.toys === "object"
    ? data.toys as Record<string, unknown>
    : {};

  console.info("Lovense callback received", {
    uid,
    toyCount: Object.keys(toys).length,
  });

  return Response.json({ ok: true });
}
