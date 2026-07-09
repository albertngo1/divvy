## Overview
Beaters is a hidden-movement party game for 3–6 players that inverts Scotland Yard: the hunted can see the whole board, and the hunters are blind. One player is the **Quarry** — their phone is the map, showing the grid and their own position. Everyone else is a **Beater**, seeing no board at all, who must corner the Quarry by committing secret sweeps they can't visually confirm. It's a Jackbox-shaped standalone: host TV for theatre, phones for private commitment.

## Problem
Hidden-movement games usually blind the fugitive and let the hunters conspire over a shared board — solved by table talk. Beaters flips it: the fun is **coordinating a pincer you cannot see**, from a shared mental model built out of near-misses. The Quarry, meanwhile, gets the delicious power of watching the net form and slithering through the one gap.

## How it works
The host TV shows a fog-covered grid — swept lines light up after each round, but the Quarry's cell never appears. It's a shared memory aid, not a solution.

**Quarry's phone (private):** the full 6×6 grid and their exact cell. They commit their one-cell move first each round, blind to the beaters' picks, then watch the sweeps land.

**Each Beater's phone (private):** no grid. Just two dials — pick a **row (1–6)** or a **column (A–F)** to sweep this round — plus a private log of your own past sweeps and their result (`EMPTY`, or `WARM` if the Quarry was in an adjacent line). Beaters can talk out loud, but nobody sees the board, so they argue from feelings, not coordinates.

Each round: Quarry commits a move → all Beaters simultaneously commit one line each → server resolves. If the Quarry's cell lies on any swept line, it's flushed to a random safe cell (a "close call," with fanfare). If beaters sweep lines that fully box the Quarry with no legal escape, they win. Survive N rounds and the Quarry wins. The private, simultaneous, blind commitment is load-bearing: reveal any beater's pick early and the whole tension deflates.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO behind Tailscale Serve). One Durable Object per room owns the grid, Quarry position, round number, and pending commits.

Data model: `Room { code, round, grid: 6x6, quarry: {cell}, quarryId, commits: {beaterId -> {axis, index}}, quarryMove }`. Server authoritative; the Quarry client gets full state, Beater clients get only their own commit + result history. Never ship the Quarry's cell to a Beater socket.

Sync strategy: strict round barrier. `ROUND_OPEN` → collect Quarry move + all Beater commits (timer auto-passes stragglers) → server resolves flush/box → `ROUND_RESULT` broadcasts swept lines to everyone but the cell only to the Quarry. The genuinely hard part is **anti-leak plus fair simultaneity**: commits stay hidden until the barrier closes, and "boxed with no escape" is computed deterministically server-side.

## v1 scope
- 1 Quarry + 3 Beaters, fixed 6×6 grid, one game of 6 rounds.
- One sweep per beater per round; WARM/EMPTY feedback only.
- Host shows swept-line memory + round counter; win/lose screen.
- 4-letter room code, no accounts.

## Out of scope
- Beater roles/powers, multiple quarries, variable grid sizes, reconnect polish, cosmetics.

## Risks & unknowns
- Do blind beaters converge or flail? WARM feedback is the tuning knob.
- Quarry may be too slippery on 6×6 — tune grid size vs. round count.
- Does out-loud talk without coordinates stay fun or frustrating? Playtest the vocabulary that emerges.

## Done means
1 Quarry + 3 Beater phones + host finish a 6-round game on a LAN: beater commits stay hidden until the round barrier closes, swept lines appear on the host while the Quarry cell never leaks to a beater socket, a flush relocates the Quarry, and a genuine box-in ends the game with the beaters winning. Two cold groups play back-to-back swapping the Quarry seat.
