// GET /api/votes -> { "<slug>": <count>, ... } for the whole board.
interface Env { DB: D1Database }

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS votes (slug TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)").run();
    const { results } = await env.DB.prepare("SELECT slug, count FROM votes").all<{ slug: string; count: number }>();
    const map: Record<string, number> = {};
    for (const r of results ?? []) map[r.slug] = r.count;
    return Response.json(map, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({}, { headers: { "Cache-Control": "no-store" } });
  }
};
