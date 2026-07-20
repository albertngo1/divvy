## Overview
Typo is a 4-player hidden-role word game. Everyone shares one 4×4 letter grid and races to build words from it — but one player, the Typist, has a single tile silently changed on their private board. Words they can "see" cross a letter no one else has; words the table proposes may cross a tile the Typist lacks. The group must spot the person whose grid is subtly wrong.

## Problem
Word party games are usually solo-optimization races with no social read. Hidden-role games rarely give the imposter a *mechanical* tell that emerges from play rather than from lying. Typo fuses them: the Typist's altered view leaks through the words they can and can't build. Per-phone privacy is the entire point — each phone shows its own board, and a single passed device could never present two conflicting grids simultaneously.

## How it works
**Private (each phone):** A 4×4 grid and a "claim" input. Innocents share an identical grid; the Typist's grid has exactly one tile replaced (e.g. an innocent **N** becomes an **M**). To claim a word you drag-trace its path on your own grid; the phone validates the path locally and logs it. You cannot log a word whose path doesn't exist on *your* board.
**Shared host screen (TV):** A running list of words the table has agreed on, and per-seat **confirm dots** — when someone claims a word aloud, everyone taps to trace-verify it on their own phone; the host shows which seats confirmed (green) vs. failed (grey), never the letters. A word that everyone confirms except one seat, or a word only one seat can build, lights up the discrepancy.
**The squeeze:** the Typist wins by never being caught in 3 minutes. But their strongest words route through the swapped tile (others fail to confirm), and words routed through the *original* tile fail for them — forcing them to fake a trace (tap a dead path and bluff a green) at the risk of a visible mismatch.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Room{ baseGrid[16], swapIndex, swapLetter, typistId, phase, agreedWords[] }`, `Player{ id, confirms:{word→bool}, vote }`. Grids render client-side; the server sends `baseGrid` to innocents and a patched grid to the Typist. Trace validation is local (adjacency + dictionary check with a small bundled word list). Sync is low-rate event passing — claim, confirm-vote, agree — no continuous state. The genuinely hard part is **the confirm protocol**: reconciling simultaneous "I can/can't build this" reports into a clean host display without letting timing noise (slow tappers) read as guilt; needs a short confirm window per claimed word and an explicit "can't find it" button so silence isn't ambiguous.

## v1 scope
- Exactly 4 players, one shared grid, one swapped tile, one 3-minute round.
- Drag-trace claim + one-tap confirm/deny per claimed word.
- Host list of agreed words + per-seat confirm dots.
- One final vote; win/lose banner naming the Typist.

## Out of scope
- Scoring by word length/rarity; multiple rounds; multiple Typists.
- Auto-generated grids tuned for maximal ambiguity; larger boards.
- Anti-cheat beyond local dictionary validation.

## Risks & unknowns
- If the swapped tile happens to sit in a dead corner, the Typist never leaks — grid+swap must be pre-tuned so the changed letter is high-traffic.
- Fake-tracing might be trivially safe if confirm dots aren't timed; window tuning is delicate.
- Slow or cautious innocents can look guilty — the "can't find it" button must feel neutral.

## Done means
Four phones on one code show grids identical but for one tile; a claimed word traces green on three phones and grey on one; the host reflects the split live; the table votes and the banner reveals whether they caught the Typist.
