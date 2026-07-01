// GET /api/room (WebSocket upgrade) -> routed to the shared PresenceRoom Durable Object.
// One global room for the whole board. The DO lives in the divvy-realtime Worker and is
// bound here as ROOM (see wrangler.toml). Same-origin, so cookies/query params pass through.
interface Env {
  ROOM: {
    idFromName(name: string): unknown;
    get(id: unknown): { fetch(request: Request): Promise<Response> };
  };
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("expected websocket", { status: 426 });
  }
  const id = env.ROOM.idFromName("divvy-global");
  return env.ROOM.get(id).fetch(request);
};
