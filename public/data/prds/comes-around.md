## Overview

A 3–5 player pick-and-pass drafting game where the point isn't what you take — it's what you correctly leave behind. For groups who like Sushi Go or booster drafts but hate the memory bookkeeping that makes the best moment invisible.

## Problem

The best moment in any draft is *the wheel*: a pack comes back around and the card you wanted is still in it. In person that moment is unverifiable. Nobody can remember which nine cards were in a pack three seats ago, so the read never gets confirmed, never gets celebrated, and never gets argued about. Physical drafting also stalls on the slowest picker and leaks information — people watch your hands, your pauses, the pile you're building. The tedium is bookkeeping; the drama is prediction. A phone per player does all the bookkeeping and stages the drama.

## How it works

One pack per player, each holding 9 absurd lots with a visible 1–5 star value: *a functioning leaf blower (4★)*, *half a wedding cake (2★)*, *an alpaca, briefly (5★)*.

Each phone privately shows only the pack currently in front of it. Two taps per pack, both secret, all players simultaneously:

1. **KEEP** — one card goes to your private pool.
2. **CALL** — secretly mark one *other* card in that pack as your Wheel Call: your bet it will still be there when this pack returns to you.

Packs rotate when everyone locks in, or when a 20-second timer auto-picks. When a pack returns to you — after every other player has picked from it once — the server checks your call. Survived: you take that card too and it scores double stars. Sniped: you lose 2 stars and the TV names the sniper.

Talking is loud and legal. "Nobody touch the alpaca, I'm not even going for it" is a legitimate move, and lying is the game.

**Private on phone:** pack contents, your keep, your call, your pool, your running score.
**Public on TV:** which pack is at which seat, the pick timer, lock-in dots, and — at the wheel — a theatrical reveal of every call, survived or sniped, sniper named.

## Technical approach

PartyKit Durable Object per room. State: `{players:[{id,name,pool[],call,score}], packs:[{id,cards[],holderIdx}], phase, deadline}`. The server is the only thing that ever knows full pack contents; each client receives only its own filtered pack view.

Sync is barrier-phased: server broadcasts `PICK_OPEN` with a deadline, clients POST `{keep, call}`, server waits for all submissions or the deadline (auto-picking the highest-star remaining card with no call), applies, rotates holders, emits fresh private views plus a public delta to the host.

The genuinely hard part is information hygiene across reconnects. A phone reload must restore exactly the prior private view without any pack list ever having crossed a broadcast channel — solved by per-player filtered snapshots keyed to a session token, and by never placing pack contents on the host channel. Second hard part is the barrier itself: one AFK player stalls the table, so the deadline plus server-side rejection of late submissions (not client-side) keeps rotation honest.

## v1 scope

- 3 players, 1 round, 3 packs of 9 cards, wheel resolves exactly once
- One hand-authored 27-card content deck with fixed star values
- 20s pick timer with auto-pick fallback
- TV shows pack positions, lock-in dots, and the final reveal
- Score = pool stars + call bonuses − call penalties; nothing persists

## Out of scope

Multiple rounds or packs, set collection and card synergies, custom decks, spectator mode, rejoin after room close, any animation beyond a card sliding.

## Risks & unknowns

- At 3 players the wheel is only two picks deep, so calls may survive too easily; may need calls restricted to 4–5★ cards.
- Table talk carries the round. A quiet room makes it a solitaire spreadsheet.
- Visible star values may make correct picks obvious and kill the read; hidden per-player taste multipliers are the fallback, but they add rules.

## Done means

Three phones join via a QR code on the TV; all three see different 9-card packs; each locks a keep and a call; packs rotate three times; the TV then reports per player whether the called card wheeled and, if not, who took it; final stars display; whole round under 4 minutes, and a WebSocket transcript check confirms no phone ever received another player's pack.
