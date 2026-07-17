## Overview
Doorbuster is a fast, cruel little party game for 3 players (plus a host screen) about wanting the same thing as everyone else and being punished for it. The host TV is the sale floor: a shelf of six glossy "deals." Each phone is a private shopper who alone knows what each item is worth to *them*. On a countdown everyone lunges for one item at once — grab something no one else grabbed and it's yours; grab the same thing as a rival and it smashes on the floor, worth nothing to either of you.

## Problem
Most "pick a secret answer" party games reward matching (Herd Mentality) or reward pure uniqueness with no pull toward the crowd. The itch here is a *tension*: the item you most want to grab is exactly the item everyone else most wants to grab, because values are correlated but private. You have to talk yourself *off* the obvious prize — and hope your rivals didn't out-chicken you.

## How it works
The host shelf shows six items with names/pictures only — no prices. Each phone privately shows the same six items, each stamped with a **dollar value only that player sees** (e.g. the toaster is $90 to you, $30 to someone else). Values are drawn so one or two items are "hot" for most players and a couple are quietly great for exactly one person.

All three players get a synced 3-2-1 and each taps exactly one item within a 5-second window (locked, no take-backs). Then the host does the reveal:
- **Unique grab** → you keep that item's private value.
- **Collision** (2+ players tapped it) → the item *shatters* on the host screen with a smash animation; every colliding player scores 0 on it.

Host screen shows a live "hands reaching" animation during the grab (silhouettes, no identity), then the smash/keep reveal and a score bar. Highest kept value wins the round. The delicious moment is the reveal of everyone's private valuations: "you passed on the $85 lamp because you were SURE I'd take it — and I took the toaster."

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { items: [{id, label}], players: { pid: { valuations: {itemId: number}, pick: itemId|null } }, phase }`. The server generates each player's private valuation vector at round start and pushes only *that* player's vector to their socket — the host never receives valuations until reveal. Grabs collect on the server; a short authoritative lock window closes picks, then the server computes collisions and broadcasts the resolved result to everyone at once. The genuinely hard part is minimal here (no continuous sync) — the real design risk is *valuation generation*: tuning the number distribution so collisions are frequent-but-avoidable and the reveal feels fair, not random.

## v1 scope
- Exactly 3 players, 6 items, ONE grab round.
- Server-generated private valuations, one simultaneous locked pick.
- Collision → shatter → score, single winner, reveal-all screen.
- Room code join, no accounts.

## Out of scope
- Multiple rounds / running totals / bidding.
- More than 3 players (collision math scales but v1 stays tiny).
- Chat, taunts, animations beyond one smash effect.

## Risks & unknowns
- Valuation tuning: too correlated = everyone always collides; too independent = trivial. Needs playtest calibration.
- With 3 players and 6 items, avoidance may be too easy — may need to cut to 4 items or add a scarcity twist.
- One round may feel too thin; a best-of-3 is the obvious fallback.

## Done means
Three phones join a room code, each sees a *different* private price sheet the host never shows, all three lock one pick inside the window, the server correctly shatters any item picked by ≥2 players and awards unique picks, and the host renders a reveal that shows every player's hidden valuations plus a single winner.
