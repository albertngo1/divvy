## Overview
A wordless 60-second co-op control problem for 3–5 people around a TV. A single needle drifts across a gauge on the host screen. Every player pushes it simultaneously from their phone. Each player privately holds a different narrow acceptance band, and the bands overlap in exactly one place. The room wins by parking the needle in that window and holding it — without a word, using only the felt push and pull of everyone else's thumbs.

## Problem
Wordless-cooperation party games are almost all *timing* games (clap together, stop together). Almost none are *continuous control* games. The itch: build a room-scale analog negotiation where the only communication channel is force on a shared object — where holding steady means "I'm happy here" and a short jab means "not yet," and everyone invents that vocabulary in the first twenty seconds.

## How it works
**Host screen (shared):** a horizontal gauge 0–100, the live needle, and a LOCK meter that fills only while *all* players are simultaneously satisfied and drains instantly when anyone isn't. No bands, no names, no per-player state.

**Phone (private):** the same needle, plus **your** band drawn on it (e.g. 41–52), a glow when the needle is inside it, and a touch pad that acts as a spring-loaded lever. Your lever's gain is privately different — one player nudges, one player shoves. You never learn whose band is where.

Needle velocity = sum of all lever inputs + a weak centering spring + noise. Because gains differ, the fair-looking move (everyone pushes toward their own band) overshoots wildly; the room has to discover that the strong player must go slack. Win: LOCK held 3 seconds. Talking is banned; pointing is allowed and useless.

## Technical approach
Host tab + phone PWAs against an authoritative PartyKit Durable Object (or Socket.IO over Tailscale Serve). State: `{needle, vel, bands: Map<id,[lo,hi]>, gains: Map<id,number>, inputs: Map<id,number>, lockMs}`.

The genuinely hard part is real-time sync. Server runs a fixed 30Hz timestep simulation; phones send only their analog lever value at 20Hz (last-write-wins, no queue); server broadcasts needle+lock at 20Hz. Clients **do not predict** — they render from a 100ms interpolation buffer, because a phone that mispredicts the needle shows you a lie about a shared object and destroys the negotiation. Band generation: pick a 4-unit window, then expand each player's band outward from it randomly so all overlap there and nowhere else. Levers never leave the client-side origin: `bands` and `gains` are per-socket projections, never broadcast.

## v1 scope
- 3 players, hardcoded, one room code
- One 60-second attempt, one generated band set
- Levers all push (differing gains), no inverted signs
- LOCK = 3s of unanimous in-band
- Win/lose card on host; no scoring, no rematch button

## Out of scope
Inverted or delayed levers, two-axis gauges, multiple rounds, difficulty tiers, reconnect, audio, spectators.

## Risks & unknowns
May feel unsolvable and turn into flailing — the fix lever is band width, tune live. Phone touch latency on cheap Android could make one player structurally worse. 20Hz may look chunky on the host; test 30Hz broadcast before adding smoothing.

## Done means
Three phones drive one needle with visibly different authority. Each phone shows only its own band; the host shows none. A room that has never seen it finds the overlap window and fills LOCK within three attempts, without speaking, and the moment it locks somebody yells.
