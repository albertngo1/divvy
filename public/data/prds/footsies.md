## Overview
Footsies is a head-to-head Divvy duel that steals the *neutral game* — the spacing-and-poking phase — from 2D fighters (Street Fighter, Footsies-the-training-game) and turns it into a simultaneous-commit reading duel for exactly 2 players, watched by a room. No combos, no execution: just yomi.

## Problem
Fighting games are thrilling but locked behind execution walls — nobody at a party can quarter-circle-punch. The actual *mind game* underneath (do I poke, whiff-bait, or walk back?) needs zero dexterity, yet no party game surfaces it. And it dies the instant both players can see each other's options.

## How it works
Two players pick asymmetric characters (e.g. **Lance**: long reach, slow startup; **Jab**: short reach, fast). Each round is one simultaneous exchange:
- **Each phone privately shows** ONLY that player's own movelist — each move's *range band* (close/mid/far), *startup speed*, and whether it *low-crushes* or *whiff-recovers slow*. You also privately pick your **stance distance** (step in / hold / step back).
- Both players lock in within a 5s timer. Neither sees the other's chosen move or the other's full movelist — ever.
- **The shared TV** then animates the clash frame-by-frame: the two fighters at their chosen spacing, attacks extending, and the resolution — clean hit, trade, or a juicy *whiff-punish* when someone poked at empty air and ate a counter. Health bars sit on the TV; a hit-spark and freeze-frame sell the read.

Because your opponent's ranges and speeds are hidden, you win by *reading tendencies* across rounds ("they keep poking mid — I'll step back and whiff-punish"). Passing one phone around would reveal both movelists and collapse the entire bluff — the private, simultaneous state IS the game.

## Technical approach
Host browser tab + 2 phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `match {roundNo, scoreboard, phase}`; per-player `{characterId, hp, submittedMove|null, stance}`. Sync is lockstep: server accepts both secret submissions, reveals only when both land (or timer forces a default "hold"), resolves via a small deterministic table (range overlap × startup frames × crush flags → hit/trade/whiff), then pushes an animation script to the host and per-phone results. The genuinely hard part is *fairness of simultaneity* — server must reject any submission after reveal and hide opponent state until resolution, so there's no info leak via network timing.

## v1 scope
- Exactly 2 players, 2 hardcoded characters.
- One move axis: 3 attacks × 3 stances each.
- Best-of-3 exchanges, first clean hit per round wins.
- One crude TV animation (sprites sliding + hitspark), no audio.

## Out of scope
- Combos, meter, health chunks, more than 2 players, character select variety, mobile-vs-mobile matchmaking beyond one room code.

## Risks & unknowns
- Is one hidden exchange readable enough to feel like footsies, or just coin-flippy? Needs the resolution table tuned so reads beat guesses over 3 rounds.
- 5s commit timer may feel rushed or draggy — needs playtest.

## Done means
Two phones join a room code, each sees only its own movelist, both lock a move, the TV animates a whiff-punish, and a best-of-3 crowns a winner — with no way for either player to see the other's options before reveal.
