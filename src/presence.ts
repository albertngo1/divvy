// Realtime presence client: connects to /api/room (WebSocket → PresenceRoom DO), streams
// this browser's cursor, and receives peers' cursors + instant vote broadcasts. Degrades
// silently if the realtime Worker isn't deployed (the app just won't show other cursors).

export interface Peer { id: string; name: string; color: string; x: number; y: number; }
export interface Self { id: string; name: string; color: string; }

interface Handlers {
  onPeer: (p: Peer) => void;       // join or cursor move
  onLeave: (id: string) => void;
  onVote: (slug: string, count: number) => void;
}

export interface PresenceHandle {
  self: Self;
  sendCursor: (x: number, y: number) => void;
  sendVote: (slug: string, count: number) => void;
  close: () => void;
}

const NAMES = ["Comet", "Nova", "Quasar", "Pulsar", "Nebula", "Orbit", "Vega", "Rigel", "Lyra", "Atlas", "Halley", "Draco"];
const COLORS = ["#7dd3fc", "#a78bfa", "#f472b6", "#fbbf24", "#4ade80", "#fb923c", "#38bdf8", "#e879f9"];

function stored(key: string, make: () => string): string {
  try {
    let v = localStorage.getItem(key);
    if (!v) { v = make(); localStorage.setItem(key, v); }
    return v;
  } catch { return make(); }
}

function identity(): Self {
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  return {
    id: stored("divvy_pid", () => Math.random().toString(36).slice(2, 10)),
    name: stored("divvy_pname", () => pick(NAMES)),
    color: stored("divvy_pcolor", () => pick(COLORS)),
  };
}

export function connectPresence(handlers: Handlers): PresenceHandle {
  const self = identity();
  let ws: WebSocket | null = null;
  let closed = false;
  let backoff = 1000;

  const url = () => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const q = new URLSearchParams({ id: self.id, name: self.name, color: self.color });
    return `${proto}://${location.host}/api/room?${q}`;
  };

  const connect = () => {
    if (closed) return;
    let sock: WebSocket;
    try { sock = new WebSocket(url()); } catch { return; }
    ws = sock;
    sock.onopen = () => { backoff = 1000; };
    sock.onmessage = (ev) => {
      let m: { t?: string; peers?: Peer[]; peer?: Peer; id?: string; x?: number; y?: number; slug?: string; count?: number };
      try { m = JSON.parse(ev.data); } catch { return; }
      if (m.t === "welcome") (m.peers || []).forEach((p) => handlers.onPeer(p));
      else if (m.t === "join" && m.peer) handlers.onPeer(m.peer);
      else if (m.t === "cursor" && m.id) handlers.onPeer({ id: m.id, name: "", color: "", x: m.x || 0, y: m.y || 0 });
      else if (m.t === "bye" && m.id) handlers.onLeave(m.id);
      else if (m.t === "vote" && m.slug) handlers.onVote(m.slug, m.count || 0);
    };
    sock.onclose = () => {
      if (closed) return;
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, 15000);
    };
    sock.onerror = () => { try { sock.close(); } catch { /* ignore */ } };
  };
  connect();

  const send = (obj: unknown) => { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); };

  return {
    self,
    sendCursor: (x, y) => send({ t: "cursor", x, y }),
    sendVote: (slug, count) => send({ t: "vote", slug, count }),
    close: () => { closed = true; try { ws?.close(); } catch { /* ignore */ } },
  };
}
