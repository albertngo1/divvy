// Divvy realtime room — a Durable Object that relays presence for the idea cloud:
// live cursors, join/leave, and instant vote broadcasts. Uses the WebSocket Hibernation
// API so idle rooms cost nothing. State is ephemeral (cursors), so nothing is persisted;
// the roster is reconstructed from each socket's serialized attachment.
//
// Deploy as its own Worker (`wrangler deploy` in this dir), then bind its PresenceRoom
// class to the Pages project (see divvy wrangler.toml [[durable_objects.bindings]]).

interface Meta { id: string; name: string; color: string; }

export class PresenceRoom {
  state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    const url = new URL(request.url);
    const meta: Meta = {
      id: (url.searchParams.get("id") || crypto.randomUUID()).slice(0, 32),
      name: (url.searchParams.get("name") || "someone").slice(0, 24),
      color: (url.searchParams.get("color") || "#8ab4ff").slice(0, 9),
    };

    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    this.state.acceptWebSocket(server);      // hibernation-aware accept
    server.serializeAttachment(meta);         // survives hibernation

    server.send(JSON.stringify({ t: "welcome", you: meta, peers: this.roster().filter((m) => m.id !== meta.id) }));
    this.broadcast(JSON.stringify({ t: "join", peer: meta }), server);

    return new Response(null, { status: 101, webSocket: client });
  }

  roster(): Meta[] {
    const out: Meta[] = [];
    for (const ws of this.state.getWebSockets()) {
      try { const m = ws.deserializeAttachment() as Meta; if (m) out.push(m); } catch { /* skip */ }
    }
    return out;
  }

  broadcast(msg: string, except?: WebSocket) {
    for (const ws of this.state.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(msg); } catch { /* dead socket */ }
    }
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    let m: { t?: string; x?: number; y?: number; slug?: string; count?: number };
    try { m = JSON.parse(raw as string); } catch { return; }
    const meta = ws.deserializeAttachment() as Meta;
    if (!meta) return;
    if (m.t === "cursor") {
      this.broadcast(JSON.stringify({ t: "cursor", id: meta.id, x: m.x, y: m.y }), ws);
    } else if (m.t === "vote") {
      this.broadcast(JSON.stringify({ t: "vote", slug: m.slug, count: m.count }), ws);
    }
  }

  async webSocketClose(ws: WebSocket) {
    const meta = this.metaOf(ws);
    if (meta) this.broadcast(JSON.stringify({ t: "bye", id: meta.id }));
  }
  async webSocketError(ws: WebSocket) {
    const meta = this.metaOf(ws);
    if (meta) this.broadcast(JSON.stringify({ t: "bye", id: meta.id }));
  }
  private metaOf(ws: WebSocket): Meta | null {
    try { return ws.deserializeAttachment() as Meta; } catch { return null; }
  }
}

// The Worker itself does nothing user-facing; the Pages Function routes upgrades to the DO.
export default {
  async fetch(): Promise<Response> {
    return new Response("divvy realtime worker — see /api/room on the Pages app");
  },
};
