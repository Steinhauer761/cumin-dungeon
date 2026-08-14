const ASSETS: Record<string, string> = {
  "grand-hall": "https://app-attachments-public.clickup.com/07b7448f-853c-48e6-82e8-435de3962bb1.png",
  "velvet-room": "https://app-attachments-public.clickup.com/88dc235b-b9f9-45e9-b104-1040db693e44.png",
  "tangled-throne": "https://app-attachments-public.clickup.com/8cd96905-8077-4696-90ac-1eb639996ada.png",
  "pink-silk": "https://app-attachments-public.clickup.com/d38a9f14-ea11-428a-a1dc-d78e4ab0c4b1.png",
  "devils-playground": "https://app-attachments-public.clickup.com/ddd616e1-7a9d-448d-ba9c-7e3e0b886c3b.png",
  "back-room": "https://app-attachments-public.clickup.com/9df03371-3953-469b-91db-7a2393cbb1d1.png",
  "the-dungeon": "https://app-attachments-public.clickup.com/c073943a-ddcc-4150-a58c-46b4dc0c514b.png",
  "haleys-halo": "https://app-attachments-public.clickup.com/084dd23b-f9b6-4d18-aed9-0d8c16f74e51.png",
  "trans-kinks": "https://app-attachments-public.clickup.com/8a1e6dee-2e01-4a2d-91b7-f25a13941de6.png"
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const key = url.pathname.split("/").pop() || "";
  const source = ASSETS[key];
  if (!source) return new Response("Not found", { status: 404 });

  try {
    const upstream = await fetch(source, { redirect: "follow" });
    if (!upstream.ok) return new Response("Asset unavailable", { status: 502 });

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "image/png");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response("Asset unavailable", { status: 502 });
  }
}
