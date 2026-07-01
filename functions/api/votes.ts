// GET /api/votes  ->  { counts: { "<slug>": <netVotes>, ... }, mine: { "<slug>": 1 | -1 } }
// counts = SUM(val) per idea (can be negative); mine = this browser's own up/down votes.
// Sets the anonymous id cookie on first visit so voting is stable.
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
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS views (slug TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)"
  ).run();
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  let uid = readUid(request);
  if (!uid) {
    uid = crypto.randomUUID();
    headers["Set-Cookie"] = `${COOKIE}=${uid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`;
  }
  try {
    await ensureTable(env);
    const counts: Record<string, number> = {};
    const all = await env.DB.prepare("SELECT slug, SUM(val) AS count FROM vote_rows GROUP BY slug").all<{ slug: string; count: number }>();
    for (const r of all.results ?? []) counts[r.slug] = r.count;
    const mine: Record<string, number> = {};
    const rows = await env.DB.prepare("SELECT slug, val FROM vote_rows WHERE voter = ?").bind(uid).all<{ slug: string; val: number }>();
    for (const r of rows.results ?? []) mine[r.slug] = r.val;
    const views: Record<string, number> = {};
    const vrows = await env.DB.prepare("SELECT slug, count FROM views").all<{ slug: string; count: number }>();
    for (const r of vrows.results ?? []) views[r.slug] = r.count;
    return Response.json({ counts, mine, views }, { headers });
  } catch {
    return Response.json({ counts: {}, mine: {}, views: {} }, { headers });
  }
};
