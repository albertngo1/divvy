// POST /api/vote  { slug: string, dir?: 1 | -1 }  ->  { slug, count, val }
// Signed votes: one row per (slug, voter) holding +1 (up) or -1 (down). Clicking the same
// direction again clears it (toggle off). count = SUM(val) across voters, so downvotes pull
// an idea's heat down. Identity is the anonymous httpOnly cookie; the client can't inflate it.
interface Env { DB: D1Database }

const COOKIE = "divvy_uid";

function readUid(request: Request): string | null {
  const raw = request.headers.get("Cookie") || "";
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : null;
}

async function ensureTable(env: Env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS vote_rows (slug TEXT NOT NULL, voter TEXT NOT NULL, val INTEGER NOT NULL, PRIMARY KEY (slug, voter))"
  ).run();
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: { slug?: string; dir?: number };
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") return new Response("missing slug", { status: 400 });
  const dir = body?.dir === -1 ? -1 : 1;

  let uid = readUid(request);
  let setCookie: string | null = null;
  if (!uid) {
    uid = crypto.randomUUID();
    setCookie = `${COOKIE}=${uid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`;
  }

  try {
    await ensureTable(env);
    const existing = await env.DB.prepare("SELECT val FROM vote_rows WHERE slug = ? AND voter = ?").bind(slug, uid).first<{ val: number }>();
    let val: number;
    if (existing && existing.val === dir) {
      await env.DB.prepare("DELETE FROM vote_rows WHERE slug = ? AND voter = ?").bind(slug, uid).run();
      val = 0; // same direction again → clear the vote
    } else {
      await env.DB.prepare("INSERT OR REPLACE INTO vote_rows (slug, voter, val) VALUES (?, ?, ?)").bind(slug, uid, dir).run();
      val = dir;
    }
    const row = await env.DB.prepare("SELECT COALESCE(SUM(val), 0) AS count FROM vote_rows WHERE slug = ?").bind(slug).first<{ count: number }>();
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (setCookie) headers["Set-Cookie"] = setCookie;
    return Response.json({ slug, count: row?.count ?? 0, val }, { headers });
  } catch {
    return new Response("db error", { status: 500 });
  }
};
