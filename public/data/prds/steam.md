## Overview
Steam turns the universal act of watching a clip together into a live betting market with a hidden signal. 3–5 players watch one short video on the shared TV and privately wager chips on how it resolves ("which chef plates first", "does the dog catch the frisbee"). Exactly one player is the *sharp* — secretly shown the likely outcome before the clip plays. The whole game is learning to read line movement to sniff out where the smart money is.

## Problem
Group video-watching is passive: everyone stares, someone narrates, nobody has skin in the game. Prediction is fun but shouting a guess out loud collapses it into groupthink. The itch: give each person private stake and private information, then let the *market itself* become the thing you read.

## How it works
The host TV shows a market: a question, two-to-three outcomes, and a live parimutuel odds bar that shifts as money pools in — but never who bet what. Each phone PRIVATELY shows: your chip balance, a slider to stake on an outcome, and (for the sharp only) a whispered hint like "outcome B is favored." Betting is open for a 20-second pre-roll window; you can move your stake repeatedly, and each move nudges the public odds. The sharp wants to bet B without making the line steam so obviously that everyone piggybacks and splits the pool. Everyone else watches the odds twitch and tries to follow the sharp — or fake a steam to bait them. At lock, the clip plays and resolves. Winners split the pool proportionally. Then a private post-round question on every phone: "Who was the sharp?" Correctly fingering the sharp pays a bonus; the sharp scores extra for staying hidden.

One passed-around phone breaks completely: private balances, the secret hint, and *simultaneous* stake-moves that drive the shared line are the entire game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{clipId, phase, marketId}`, `market{outcomes[], pool[outcome]→total}`, `player{id, balance, stake:{outcome,amount}, isSharp}`. Sync: phones send `setStake` deltas; server clamps to balance, updates pool totals, broadcasts only aggregate odds (never per-player stakes) at ~5Hz. The genuinely hard part is fair, jitter-free odds display under rapid concurrent stake-moves — server is the single source of truth, coalesces updates into fixed ticks, and freezes the pool atomically at lock so no late bet sneaks in. Clip resolution is a bundled timestamp→outcome map, so no video analysis needed.

## v1 scope
- 3 players, one bundled 60s clip with a scripted resolution
- One binary market (A vs B), fixed 100-chip starting stack
- One sharp, chosen at random, one hint string
- Odds bar on TV; stake slider + hint on phone; one "who was the sharp" guess

## Out of scope
- Multiple markets/rounds, live/streamed video, chip carryover, custom clip upload, spectators, animated odds history charts.

## Risks & unknowns
- If line movement is too subtle, the sharp is invisible and reading fails; if too loud, everyone piggybacks. Needs a tuned pool size / min-stake so a single sharp bet visibly steams.
- 20s pre-roll may be too short to read the room with 5 players.

## Done means
Three phones join, all place private stakes that visibly steam the shared odds bar, the clip resolves, the pool pays out proportionally, and each player privately guesses the sharp with the sharp's identity revealed on the TV.
