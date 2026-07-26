## Overview

A 3-player cooperative shouting game for a TV plus a phone each. You are the overnight compounding crew at a very unlicensed pharmacy, mixing a recipe into a shared vat. The recipe is public and trivially easy. The reason you will fail is that each of you privately holds one safety warning that rotates on its own timer, and nobody's mental model of the room is ever more than ten seconds fresh.

## Problem

Every game in the Spaceteam lineage is about *acquiring* information fast — read your panel, shout it, done. Once the room has said everything once, the puzzle is solved and only dexterity remains. Nothing in this lineage is about information *rotting*. The itch: a game where telling the truth loudly and clearly is exactly what gets you killed, because it stopped being true while you were saying it.

## How it works

**Host screen (public):** the vat, a queue of six ingredient icons to add in order, a 90-second clock, a strike counter (3 strikes = fail), and one public state light that flips on its own — FIZZING / CALM.

**Each phone (private):** three ingredient buttons — your slice of the nine-ingredient palette, overlapping with others but never identical — and one WARNING CARD in huge type with a draining bar underneath. Warnings look like: *NOT after CHALK*, *NOT within 4s of anything RED*, *NOT twice in a row by the same person*, *NOT while FIZZING*. Each card lives 10–14 seconds, and per-phone offsets guarantee they never flip together.

Only the player who owns the next ingredient's button can advance the recipe. Every add is validated server-side against **all three live warnings**, including ones nobody has announced yet. A violation shows the violated warning text on the TV — but not whose card it came from, so the room has to work out who went stale.

Play is therefore a permanent verbal refresh loop, on top of the actual job: "mine just flipped, no reds for four seconds" / "is chalk still live?" / "say yours again, say it again."

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as sole authority. Model: `Room {phase, queue[], cursor, strikes, fizzing, players[]}`, `Player {id, buttons[3], warning:{id, kind, params, version, expiresAt}}`. Server ticks at 100ms and rerolls each player's warning on its own expiry, pushing the card text **only down that player's socket** — host and peers never receive it; leaking it collapses the game into a read-off-the-TV exercise.

Hard part is expiry fairness. A tap sent 200ms before a flip must be judged against the card the player could actually see, so clients stamp taps with the displayed `warning.version` and the server accepts a version one generation stale within an RTT-adjusted grace window. Second hard part: the three live warnings must remain jointly satisfiable — a solver check on each reroll, re-rolling any set that makes every legal move impossible.

## v1 scope

- 3 players, one 90-second round, 6-step recipe, 9 ingredients
- Exactly 3 warning kinds: NOT-after-X, NOT-within-Ns-of-COLOR, NOT-twice-by-same-player
- Host shows vat, queue, strikes, fizz light, and violated-warning text
- QR join, name only, no persistence between rounds
- Win = recipe complete under 3 strikes

## Out of scope

Speech recognition. Round ladders and difficulty curves. More than 4 players. Reconnect beyond rejoin-by-name. Any sound design past a card-flip chime.

## Risks & unknowns

Flip interval is the entire tuning knob — too fast and it's noise, too slow and the room just memorizes. Watching your own drain bar may starve attention for the TV queue. Unknown how often a group deadlocks waiting for windows to align.

## Done means

Three phones and a laptop, one round played cold: at least one strike is caused by a player announcing a warning that had already flipped, and the room can correctly name that as the cause during the postmortem. A practiced group can clear the recipe inside 90 seconds.
