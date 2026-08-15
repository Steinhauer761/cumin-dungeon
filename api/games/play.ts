export const config = { runtime: 'edge' };

/** Legacy challenge endpoint disabled. It previously bypassed the token ledger. */
export default function handler(_req: Request): Response {
  return Response.json({
    error: 'Legacy game endpoint disabled',
    use: '/api/casino/play',
  }, { status: 410 });
}
