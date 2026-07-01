// GET /api/votes  ->  { counts: { "<slug>": <n>, ... }, voted: ["<slug>", ...] }
// counts = distinct voters per idea; voted = the slugs THIS browser (cookie identity)
// has voted for. Sets the anonymous id cookie on first visit so voting is stable.
interface Env { DB: D1Database }

const COOKIE = "divvy_uid";

function readUid(request: Request): string | null {
  const raw = request.headers.get("Cookie") || "";
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : null;
}

async function ensureTable(env: Env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS votes_by_user (slug TEXT NOT NULL, voter TEXT NOT NULL, PRIMARY KEY (slug, voter))"
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
    const all = await env.DB.prepare("SELECT slug, COUNT(*) AS count FROM votes_by_user GROUP BY slug").all<{ slug: string; count: number }>();
    for (const r of all.results ?? []) counts[r.slug] = r.count;
    const mine = await env.DB.prepare("SELECT slug FROM votes_by_user WHERE voter = ?").bind(uid).all<{ slug: string }>();
    const voted = (mine.results ?? []).map((r) => r.slug);
    return Response.json({ counts, voted }, { headers });
  } catch {
    return Response.json({ counts: {}, voted: [] }, { headers });
  }
};
