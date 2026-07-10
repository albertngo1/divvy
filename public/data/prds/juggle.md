## Overview
Juggle steals the *fighting-game combo* — the bread-and-butter chain of links and cancels that keeps an opponent airborne — and turns it into a cooperative relay where a combo is passed physically around a room of 3–5 players, each holding a private movelist.

## Problem
Combo systems are the most satisfying thing in fighting games and the most gatekept — you memorize inputs alone in training mode. The social fantasy of "we KEPT the juggle going" never happens because one player owns the whole combo. Split the movelist across phones and continuing a combo becomes a live negotiation under a timer.

## How it works
Each phone privately shows YOUR fighter's small movelist: 4 moves, each with a **starter tag** and an **ender tag** (e.g. LOW→HIGH, HIGH→AIR, AIR→LOW). A combo is a growing chain on the host screen; it carries a current "link state" (the last move's ender tag) and a rising damage meter.

On your turn the server highlights, on your phone only, which of your 4 moves are *legal* (their starter matches the current link state). You must tap the move's input — a 3-button directional sequence shown privately — inside a shrinking window (starts 6s, −0.4s each hand-off). A correct input extends the combo, updates the link state to your move's ender, adds damage, and passes to the next player. A wrong/late input **drops** the combo.

The twist that makes privacy load-bearing: you can only see YOUR legal moves, so the table has to talk — "who's got something that starts on AIR?" — without being able to just read each other's screens. Any player may spend their one **Burst** to deliberately break a combo they think is about to collapse on them, banking partial damage safely. Host screen shows the combo string (M1→M2→…), the link state, the damage meter, and the countdown ring. Phones show private movelists + input pads.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve fallback). Data model: `Room{comboChain[], linkState, damage, activePlayer, windowEndsAt}`, `Player{moves[4]{starter,ender,inputSeq}, burstUsed}`. Sync strategy: server owns the clock and the active-turn token; phones send only `{moveId, inputSeq}` and the server validates legality + timing, so no phone can cheat the window. The genuinely hard part is the hand-off timing feeling fair across phones — server-authoritative `windowEndsAt` timestamps with client-side countdown interpolation, and a ~250ms grace to absorb network jitter.

## v1 scope
- One combo relay, 3–5 players, one round.
- 3 link tags (LOW/HIGH/AIR), 4 moves per fighter, 3-tap inputs.
- One Burst per player; damage meter + final "biggest juggle" score.

## Out of scope
- Character rosters, super meters, blocking/defense.
- Versus/team modes; only cooperative single-combo v1.
- Fancy input motions (quarter-circles) — plain 3-tap only.

## Risks & unknowns
- Twitch timing on phones is fiddly; the window may need to be generous to stay fun, not frustrating.
- Dead-ends: a link state no living player can continue = forced drop. Needs movelist generation that guarantees at least one legal path most turns.

## Done means
4 phones join, each sees only its own movelist, players verbally coordinate to extend one combo across ≥6 hand-offs with correctly-timed private inputs, a Burst cleanly banks a combo, and the host shows the final combo string and damage.
