// POST /api/view  { slug: string }  ->  { slug, count }
// Increments an idea's global view count (total panel opens across everyone). Cheap
// upsert; the table auto-creates on first request.
interface Env { DB: D1Database }

async function ensureTable(env: Env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS views (slug TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)"
  ).run();
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: { slug?: string };
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") return new Response("missing slug", { status: 400 });
  try {
    await ensureTable(env);
    await env.DB.prepare("INSERT INTO views (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1").bind(slug).run();
    const row = await env.DB.prepare("SELECT count FROM views WHERE slug = ?").bind(slug).first<{ count: number }>();
    return Response.json({ slug, count: row?.count ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("db error", { status: 500 });
  }
};
