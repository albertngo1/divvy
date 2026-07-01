// POST /api/vote  { slug: string, delta?: 1 | -1 }  -> { slug, count }
// Upserts the row and applies the delta (clamped at 0). Per-browser dedup is handled
// client-side via localStorage; this endpoint just applies the delta it's given.
interface Env { DB: D1Database }

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: { slug?: string; delta?: number };
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") return new Response("missing slug", { status: 400 });
  const delta = body?.delta === -1 ? -1 : 1;

  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS votes (slug TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)").run();
    await env.DB.prepare("INSERT OR IGNORE INTO votes (slug, count) VALUES (?, 0)").bind(slug).run();
    await env.DB.prepare("UPDATE votes SET count = MAX(0, count + ?) WHERE slug = ?").bind(delta, slug).run();
    const row = await env.DB.prepare("SELECT count FROM votes WHERE slug = ?").bind(slug).first<{ count: number }>();
    return Response.json({ slug, count: row?.count ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return new Response("db error", { status: 500 });
  }
};
