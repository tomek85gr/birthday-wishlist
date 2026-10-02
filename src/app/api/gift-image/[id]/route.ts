import { query } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });

  try {
    const { results } = await query<{ image_url: string | null }>("SELECT image_url FROM gifts WHERE id = ? LIMIT 1", [id]);
    const dataUrl = results[0]?.image_url;
    const match = typeof dataUrl === "string" ? /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl) : null;
    if (!match) return new Response(null, { status: 404 });

    const bytes = Buffer.from(match[1], "base64");
    if (bytes.byteLength > 320_000) return new Response(null, { status: 404 });
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
