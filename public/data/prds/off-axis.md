## Overview
A Wavelength-shaped deduction game for 4–6 people in one room. Instead of hiding a *target* on a public spectrum, Off Axis hides the *spectrum itself*. Every phone privately holds an axis label pair; N−1 phones hold the same pair, one holds a near-twin. Nobody is told which they have. The room sees only anonymous dot positions and has to decide who is measuring with a different ruler — while each player privately wonders if it's them.

## Problem
Hidden-role games make the impostor act. That produces performance: the shifty player, the over-explainer. Off Axis removes agency from the secret entirely — you answer honestly and your answers still betray you. The tension moves from "who is lying" to "whose judgment do I actually trust, including my own," which is a texture Chameleon and Wavelength never reach.

## How it works
Host screen (TV): a bare horizontal track, no labels ever. One item at a time — "a birthday candle", "a hospital bill", "an office printer", "a rented tuxedo". A lock counter ("3/4 locked"). Nothing else.

Each phone privately shows: your axis pair (majority `cheap ↔ expensive`, odd `everyday ↔ special occasion`), a slider, and your own placement history. Drags never stream — only the committed value.

Eight items. All placements reveal simultaneously as colored dots; no one sees who locked first. Most items land the same under both axes; two or three *split* them (a birthday candle: dirt cheap, wildly special). Those are the whole game.

After item 4, each phone gets one silent **Peek**: reveals one random other player's axis label. A match means neither of you is odd — private, unprovable certainty you now have to sell out loud. The host shows only how many peeks were spent, never by whom.

Endgame, all private and simultaneous: accuse one dot color, and separately answer "Am I the odd one?" Correct accusation +3. Correctly claiming you're odd +4; wrongly claiming it −2. The odd player scores +2 per accusation they dodged.

## Technical approach
PartyKit Durable Object per room, one object = one game. Model: `Room{code, phase, items[8], majorityAxis, oddAxis, oddPlayerId, peeksSpent}`, `Player{id, color, axis (never sent to host), placements{}, peek, accusation, selfClaim}`. Host connects as a privileged read-only client whose payloads are filtered server-side — the axis fields simply never enter its message stream, so a host devtools console leaks nothing.

Sync is commit-and-barrier: phones POST `{itemIdx, value}`; the server acks privately, broadcasts only a count, and emits the full dot array once all players commit or a 25s deadline fires. The genuinely hard part isn't throughput, it's **leak surface**: lock order, peek timing, message sizes, and reconnect replays all leak. Every phase transition ships a uniform-shape payload, peek results ride the same message envelope as a no-op heartbeat, and reconnects replay from server state rather than a client log.

Second hard part is content, not code: authoring near-twin axis pairs plus an item bank where exactly 2–3 items reliably split them. Pairs need playtest calibration.

## v1 scope
- 4 players, one room, one round, one hardcoded axis pair + its twin
- 8 items, one fixed order, no shuffling
- One peek, one accusation, one self-claim, one score screen
- No reconnect, no avatars, no sound

## Out of scope
Multiple rounds, more than one axis family, spectators, scoring history, mobile-web polish beyond "a slider that works."

## Risks & unknowns
If the twin axes are too close, dots are indistinguishable and the round is noise; too far and it's trivial. Four players may be too few dots to read a pattern. The self-claim may dominate scoring — needs tuning.

## Done means
Four phones join by code, each sees a slider and one of two axis labels; the host tab's full WebSocket log contains no axis string; eight simultaneous reveals produce a dot scatter where at least two items visibly separate the odd player; the end screen names the odd player and shows per-player deltas.
