// POST /api/vote  { slug: string }  ->  { slug, count, voted }
// Identity is an anonymous per-browser id in an httpOnly cookie. Voting is a toggle:
// one row per (slug, voter); a second POST for the same slug removes the vote. The
// returned count is COUNT(*) of distinct voters, so the client can't inflate it.
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

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: { slug?: string };
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") return new Response("missing slug", { status: 400 });

  let uid = readUid(request);
  let setCookie: string | null = null;
  if (!uid) {
    uid = crypto.randomUUID();
    setCookie = `${COOKIE}=${uid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`;
  }

  try {
    await ensureTable(env);
    const existing = await env.DB.prepare("SELECT 1 FROM votes_by_user WHERE slug = ? AND voter = ?").bind(slug, uid).first();
    let voted: boolean;
    if (existing) {
      await env.DB.prepare("DELETE FROM votes_by_user WHERE slug = ? AND voter = ?").bind(slug, uid).run();
      voted = false;
    } else {
      await env.DB.prepare("INSERT OR IGNORE INTO votes_by_user (slug, voter) VALUES (?, ?)").bind(slug, uid).run();
      voted = true;
    }
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM votes_by_user WHERE slug = ?").bind(slug).first<{ count: number }>();
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (setCookie) headers["Set-Cookie"] = setCookie;
    return Response.json({ slug, count: row?.count ?? 0, voted }, { headers });
  } catch {
    return new Response("db error", { status: 500 });
  }
};
