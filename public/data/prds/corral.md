## Overview
Corral is a 3-player cooperative convergence game for a room with a shared TV and one phone each. The host screen shows a scattered field of labeled dots; every player privately draws a lasso around the subset they believe *everyone else* will also enclose. No talking. The room wins only when all three selections are identical.

## Problem
Most 'match your friends' games converge on a single choice (one word, one card). The interesting Schelling-point tension lives in *grouping*: which dots obviously 'belong together'? Corral scratches the itch of silently agreeing on a boundary — the cluster everyone can see but no one can point at.

## How it works
The host TV shows ~12 dots scattered in a plane, each stamped with a tiny neutral label (a letter, or a small icon). The layout has one or two 'obvious' clusters plus deliberate ambiguity — a stray dot near the edge of a cluster, two clumps that might be one group.

Each phone shows the **identical** field. The player drags a freeform loop (finger path) to enclose a subset; the enclosed dots highlight on their phone only. They can redraw freely, then hit LOCK.

Privately per phone: your own current selection, live. Shared host screen: only a **per-dot heat count** — how many players (0–3) have currently enclosed each dot, rendered as ring thickness or tint. It never shows *who* enclosed what, nor anyone's actual loop. So you learn 'that edge dot is contested' without learning who disagrees.

Win = all three locked subsets are byte-identical. On win, the host reveals all three loops overlaid and the agreed corral. On mismatch, heat resets and the room re-draws (best-of-flexible, or a 90s timer).

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { dots: [{id,x,y,label}], players: {pid: {subset: Set<dotId>, locked: bool}} }`. Phones send `subset` deltas (debounced ~150ms); server recomputes per-dot heat = count of players whose subset contains it, broadcasts only the heat vector to the host. Point-in-polygon (ray casting) runs client-side to derive the subset from the finger path; only the resulting dot-id set crosses the wire, so loop shapes stay private. Hard part: nothing latency-critical — the genuinely tricky bit is authoring dot layouts with a *tunable* Schelling gradient (clean cluster vs. one deliberately ambiguous straggler) so rounds aren't trivially won or hopelessly forked.

## v1 scope
- Exactly 3 players, one hand-authored dot field, one round (retry until win or timeout).
- Freeform lasso + point-in-polygon selection on phone.
- Host heat-count display only; reveal-on-win overlay.
- No accounts, no lobby beyond a 4-letter room code.

## Out of scope
- Multiple rounds, scoring across rounds, more than 3 players.
- Procedural field generation.
- Rectangle/tap alternate selection modes.
- Spectators, replays.

## Risks & unknowns
- Fields may be too easy (one obvious blob → instant win) or too forked (two equal clusters → deadlock). Needs playtest tuning.
- Heat-count alone might give too little signal to break a tie, or too much (players just chase the heat). Tuning the reveal granularity is the core design risk.
- Freeform lassos on small phones can be fiddly around dense dots.

## Done means
3 phones join a room via code, each draws and locks a subset over one authored field; the host shows a live per-dot heat count and never reveals individual loops; when all three locked subsets are identical the host displays a win overlay; when they differ the room can redraw. Demonstrable end-to-end on a laptop TV plus three phones over the LAN.
