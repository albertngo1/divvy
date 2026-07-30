## Overview
Second Lap is a four-player, five-minute draft for a TV and four phones. It takes the one pleasure that only drafters know — *wheeling*, the gamble that a good card will survive a full lap of the table — and makes it the entire scored game. Aimed at people who like Sushi Go / 7 Wonders drafting but hate the downtime.

## Problem
Physical drafting is 80% waiting. One person agonizes while three stare at the ceiling; packs pass in lockstep at the speed of the slowest player. Worse, the best part of drafting — "I'm passing this because I think it wheels" — is invisible and unprovable. You either remember calling it or you don't, and nobody believes you.

## How it works
Four packs of 8 cards (each card: a shape, a color, a number 1–5) exist at once. Every 20 seconds the server ticks a **beat**: it applies each player's committed pick simultaneously and rotates all four packs one seat left. Nobody waits for anybody. Eight cards, four players, two laps: each player makes 2 picks per pack, 8 picks total, over 5 beats.

**Private on each phone:** the pack you are *currently holding* — nobody else has ever seen it or will see it until it reaches them; your secret valuation rule, dealt at start and different for everyone ("triangles score their number, everything else scores 1"); your growing pile; and, on beat 1 only, a **wheel call** — you tap one card you are *leaving in the pack* and are passing on purpose. If that exact card is still in the pack when it returns to you at beat 5, you bank a fat bonus. Taking the obviously strong card removes your own evidence, so the call pulls you toward the second-best pick.

**Public on the TV:** four anonymous pack silhouettes with remaining counts, the beat countdown, and after each beat one aggregate ticker line — "4 picks, 1 wheel call broken" — never who called what. At the end the TV unmasks every valuation rule, replays the 8 picks, and shows who got sniped by whom.

## Technical approach
One Cloudflare Durable Object per room is the sole authority. State: `{players[4], packs: [{cards[8], holder}], beat, commits: {pid: cardId}, wheelCalls: {pid: cardId}, valuations}`. Phones are PWAs on a WebSocket; the server pushes each phone **only** `heldPack` — the full pack table never crosses the wire to a non-holder, so there is no client to trust.

The hard part is the beat clock. Commits arrive late, twice, or never: the server timestamps the beat boundary itself, accepts the last commit received before the boundary, auto-picks the lowest-value card for idle phones, then rotates and broadcasts atomically. Phones render a locally-interpolated countdown reconciled to server `beatStartAt` so all four clocks agree within ~80ms.

## v1 scope
- Exactly 4 players, one 8-card pack each, 5 beats, one game.
- Four hardcoded valuation rules, dealt at random.
- One wheel call per player, resolved at beat 5.
- Room code, no accounts, no reconnect, no sound.

## Out of scope
Multiple rounds, hate-draft callouts, custom card sets, spectators, 5+ players (breaks the one-clean-lap math), rejoin after disconnect.

## Risks & unknowns
20s may be too long (dead air) or too short (panic) — needs tuning. Private valuations may be too opaque for players to reason about others' picks; the beat-5 reveal must do heavy narrative lifting. Auto-picks might feel like theft.

## Done means
Four phones and a TV run a full 8-pick draft with zero stalls; a network capture from any phone contains only packs it held; wheel calls resolve against a hand-computed expected result; and in playtest at least one player yells when the TV shows their called card was taken.
