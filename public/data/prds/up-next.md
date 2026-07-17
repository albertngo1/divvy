## Overview
Up Next is a 3-6 player party game that weaponizes the universal ritual of scrolling a streaming home screen and arguing about what to watch. The host TV shows a shelf of candidate titles; each player's phone is a private betting slip. For groups who reliably spend longer picking a movie than watching one.

## Problem
Choosing what to watch is dead time — decision paralysis nobody enjoys, usually steamrolled by the loudest person and then forgotten. Yet there's already a hidden game of group psychology buried in it (who caves, who steamrolls, whose taste secretly wins) that never gets to actually be a game.

## How it works
The host TV displays a shelf of N titles (v1: 4 posters from a preset). Play runs in two secret-then-open phases.

**Phase 1 — Line (private):** each phone secretly distributes 10 chips across the titles, betting on which one the group will *ultimately end up watching*. Nobody sees anyone's slip. The TV shows only "3/3 slips locked."

**Phase 2 — Cut (open, live):** the group runs a veto draft. Each tick, every phone privately taps one title to veto; the most-vetoed title is eliminated from the TV shelf (ties broken randomly). Repeat until one title remains — the Pick. Vetoes are revealed per round on the TV, so it's public warfare — but your chip slip stays hidden the whole time.

The tension: you want your bet to survive, so you veto its rivals — but if you too obviously shield one title, others read your money and gang-veto it out of spite. You must steer without tipping your position.

**Payout:** chips you placed on the surviving Pick × your share of the pot. Then you actually watch it.

Each phone privately shows: your chip slip (Phase 1), your veto button + remaining chips (Phase 2). The TV shows: the shelf, lock counts, per-round veto tallies, final payouts.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). One Durable Object per room, keyed by join code.

Data model: `Room { titles[], phase, players[] }`, `Player { id, name, chips: {titleId:n}, vetoThisRound }`. The server holds authoritative chip slips and never broadcasts them until resolution — only lock-counts reach the TV. In the veto phase the server collects one veto per player per tick, tallies, eliminates, and broadcasts the elimination + who-vetoed-what.

Sync strategy: request/response over WS, server is source of truth, TV is a pure subscriber, chip slips are write-once-locked. The genuinely hard part isn't real-time sync (it's turn-based-ish) — it's the veto-tick UX: making simultaneous private vetoes feel live and fair without a slow phone stalling the round (short per-tick countdown, auto-veto-none on timeout).

## v1 scope
- 3 players, one room, join by code.
- 4 preset title posters (hardcoded, no TMDB).
- 10 chips, one Phase-1 slip each.
- Veto draft down to 1 title (3 elimination ticks).
- Payout screen. No accounts, no persistence, one round then done.

## Out of scope
- Real streaming integration / TMDB / actually launching the title.
- Multi-round bankrolls, seasons, leaderboards.
- More than ~6 players; sophisticated tie-breaking.

## Risks & unknowns
- With 4 titles and 3 players the market may be too thin to bluff — needs playtest on the titles-to-players ratio.
- Public veto reveal might make hidden chips too easy to infer; may need to hide veto attribution until the end.
- Simultaneous-veto fairness and timeout tuning.

## Done means
Three phones join a room, each secretly allocates 10 chips across 4 posters, the group runs a live veto draft that eliminates 3 titles one at a time on the TV, and the TV shows a correct payout crediting chips on the surviving title — with no slip ever visible to another player before reveal.
