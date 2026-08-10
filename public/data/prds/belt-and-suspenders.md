## Overview
A 4-player cooperative, turn-based game for a TV and four phones. One player is the **Dispatcher**, whose phone holds the only map. Three are **Movers**, blind pieces on that map. Eight turns, about six minutes.

## Problem
Broadcast-instruction games assume a perfect channel: whatever the holder says, everyone hears. Real coordination fails because messages arrive damaged and differently damaged for each listener. Nobody has made the holder *design for loss* — deciding whether to cover three people thinly or one person robustly.

## How it works
A 7x7 grid with pits and one goal tile. Three Mover dots (Ana, Bo, Cy) sit on it.

**Dispatcher's phone (private):** the map — walls, pits, goal, all three dots live. A text box, max 12 words, 20 seconds.

**Delivery:** the server sends that message to each Mover phone separately and deletes a fixed number of words from each copy — 4 of 12 — at independently chosen positions per phone, rendered as ▮. `ANA LEFT LEFT BO UP CY HOLD...` may reach Bo as `▮ LEFT LEFT ▮ UP ▮ HOLD`. Bo now believes two of those words are addressed to Bo.

**Each Mover's phone (private):** their own punctured copy, their last bump feedback ("you hit a wall"), and four arrows plus HOLD. Ten seconds, everyone locks simultaneously, all moves resolve at once. Players may shout freely — reconstructing the sentence out loud *is* the game, and ten seconds is not enough to do it calmly.

**Host TV (shared):** after moves lock, all three punctured copies side by side next to the true message — the comedy payoff — plus lives (3) and turn number. Never the map.

Strategy lives entirely in the Dispatcher's word budget: repeat a name three times so it survives, and two Movers get nothing this turn.

## Technical approach
Host tab plus phone PWAs on a Socket.IO server behind Tailscale Serve. Model: `{grid, movers[{id,pos,alive}], lives, turn, phase, message, deliveries:{playerId:maskedTokens}}`. Server-authoritative phase machine — COMPOSE (20s) → DELIVER → LOCK (10s) → RESOLVE — with timers on the server, never the client. Puncturing happens server-side; a Mover's socket receives only its masked token array, so the full string exists on exactly two machines, the Dispatcher's and the server's. That per-socket divergence is the whole product.

Hard part: making randomness feel like weather, not injustice. Delete a *deterministic count* (exactly 4 of 12) at random positions, show a "channel: 4 words lost" gauge on every phone before composing, and never delete two adjacent words. Second hard part: simultaneous lock — buffer all three submissions, resolve only on the tick after the last one or on timeout.

## v1 scope
- One hand-authored 7x7 map, 8 turns, 3 shared lives
- Exactly 4 players, roles fixed at join, room code, no accounts
- Text entry only, fixed 12-word cap and fixed 4-word loss
- Win = all three Movers on the goal; lose = lives or turns

## Out of scope
Voice input, variable channel quality, a traitor role, map generation, scoring, reconnect, rematch, animation beyond dots.

## Risks & unknowns
The room may trivially reconstruct the sentence by shouting — the 10-second lock is the only defense and may need to be 7. Phone typing under 20 seconds is brutal; a chip palette (LEFT/UP/ANA/…) may be required and would change the strategy. Losing an addressee may feel cruel rather than funny.

## Done means
Four phones and a TV: a full 8-turn round completes, and in at least two of five playtest rounds a Mover demonstrably executes an instruction addressed to a different player. Server logs confirm no Mover socket ever received an unpunctured message.
