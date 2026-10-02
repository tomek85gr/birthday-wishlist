import { query } from "@/lib/database";
import { slugSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) return new Response(null, { status: 404 });

  try {
    const { results } = await query<{ child_image_url: string | null }>(
      "SELECT child_image_url FROM birthdays WHERE slug = ? LIMIT 1",
      [slug],
    );
    const dataUrl = results[0]?.child_image_url;
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
