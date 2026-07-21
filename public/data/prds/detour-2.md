## Overview
Detour is a cooperative phone-controller party game for 3–5 players riffing on *Just One*. One player per round is the Guesser; everyone else secretly writes a single-word clue for the same hidden target word. As in *Just One*, clues that are too similar to each other cancel and vanish — but the load-bearing twist is a **private, live originality meter** that only you can see while you type, forcing a solo gamble no passed phone could recreate.

## Problem
*Just One* is a great cooperative bluff-against-yourself, but the duplicate-cancellation is manual, slow, and public (you flip cards and eyeball matches). On phones we can cancel by *semantic* similarity, and — the real itch — give each writer a private read on how predictable their own clue is, so the tension of "is my clever clue actually the obvious one everyone else will also write?" becomes a real, informed decision instead of a shrug.

## How it works
The server picks a target word. **Privately on clue-givers' phones:** the target word plus a text box and a live meter. As you type, the meter slides between OBVIOUS and WAY OUT, computed from (a) corpus word-frequency and (b) semantic distance from the target. It never shows anyone else's clue. **The Guesser's phone** shows only "waiting." **The shared TV** shows the round title and locked-in status dots — never the word or clues yet.

On lock, the server computes pairwise similarity across all clues (exact/stem match + embedding distance). Clues that clump together **all cancel and are destroyed** — never shown to anyone. Survivors appear on the Guesser's phone and the TV. The Guesser makes one guess. Cooperative score = did they get it, with a bonus for how many clues survived. The push-pull: obvious clues help most but collide most; detours survive but may not land.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room {code, phase, targetWord, guesserId, clues: {playerId, text, originalityScore, survived}}`. Ship a trimmed GloVe-50d table (~10k words, a few MB) to clients so the originality meter runs **on-device** with zero round-trips as the user types (debounced 200ms). Cancellation runs server-side on the same table for a single authoritative verdict. Sync is trivial (tiny events, clear phase machine: pick → write → cancel → guess → reveal). The genuinely hard part is *threshold tuning*: what similarity counts as a collision, and mapping frequency+distance to a meter that feels fair rather than arbitrary.

## v1 scope
- 3 players, exactly one round, one Guesser.
- Fixed 50-word target list.
- Client-side GloVe-50d table for meter + server for cancellation.
- One fixed cancellation threshold; no tuning UI.
- No persistent scores.

## Out of scope
- Multiple rounds / rotating Guesser / scoreboard.
- Custom word packs, difficulty settings.
- Spectators, reconnection polish.

## Risks & unknowns
- Similarity thresholds may feel unfair ("why did MY clue cancel?").
- The meter could be confusing or gameable.
- GloVe payload size on mobile.
- Enforcing true one-word clues (hyphen/space cheats).

## Done means
Three phones join; clue-givers see the word and a live meter, the Guesser does not; on lock, semantically-clumped clues visibly cancel on the TV; the Guesser sees only survivors and makes one guess; a correct guess shows a cooperative win screen. Reproducible with a scripted 3-player run.
