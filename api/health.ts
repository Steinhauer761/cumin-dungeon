export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: "GET" } },
    );
  }

  return Response.json({
    ok: true,
    service: "cumin-dungeon-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
