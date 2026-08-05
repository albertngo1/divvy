## Overview

A 4-player, ~6-minute cooperative grid game. One phone is the **Board**; three are **Pieces**. The Board sees the map — but the pieces on it are anonymous, and the map only exists in half-second flashes. For groups that like arguing about who just walked into a wall.

## Problem

Most one-map-many-blind-pieces games give the map-holder a labeled, persistent board, which makes their job pure translation. The itch: what if the map-holder's problem isn't *navigation* but *identification* — and what if the map is fleeting even for the person holding it?

## How it works

A 5×5 grid with walls, plus three colored exit pads: red, green, blue. Each Piece is secretly assigned a color. Win condition: every Piece ends on their own color's pad.

**Board phone (private):** the grid, walls, and the three colored pads — persistently. The three **tokens**, however, are identical white dots, rendered *only* as a 0.5-second flash at the end of each tick, then hidden. The Board sees where the dots are and where they went, but never who they are, and never for long. The Board talks continuously.

**Piece phone (private):** their own color (large, only they see it), four arrows, and after each tick one line of local feedback — MOVED or WALL. Pieces have no coordinates, no map, and no idea where the pads are.

All three Pieces submit simultaneously on a 5-second tick. So when the Board's flash shows two dots both moving north, and two Pieces both say "I went north," the identification is genuinely underdetermined and stays that way. The Board issues orders by color — "RED, go east twice" — and a misidentification is invisible until it produces an impossible report three ticks later. The fun is the room jointly running a constraint solver out loud: "the dot in the corner hit a wall going west — that can't be you, you said you moved."

## Technical approach

PartyKit Durable Object. State: `{grid, pads, tokens: [{id, cell, ownerId, color}], tick, submissions}`. Phones are PWAs on WebSocket; the host TV mirrors the tick clock and tick count only.

Sync is a fixed server tick: collect intents, resolve terrain collisions server-side, push each Piece its own one-word result and push the Board a positions array with token IDs **stripped and shuffled** before serialization — the anonymity must be enforced on the wire, not in the renderer, or a curious player opens devtools and the game evaporates.

The genuinely hard part is **tuning ambiguity**: a random start layout often collapses in one tick (three dots move three different directions, done). v1 uses a hand-picked start position plus a server check that rejects the round if the first two ticks would be fully disambiguating — practically, an offline search over the fixed map for a start triple where at least four ticks of ambiguity are reachable.

## v1 scope

- Exactly 4 players, 1 hand-authored 5×5 map, 1 round
- Fixed start positions chosen for ambiguity
- 15 ticks, 5s each, 0.5s flash reveal
- Host TV: tick clock, ticks remaining, win/lose card

## Out of scope

Map generation, difficulty settings, rotating the Board, scoring, hazards, reconnects, spectator view.

## Risks & unknowns

The 0.5s flash may be simply frustrating rather than tense — flash duration is the single most important playtest dial. The room may also solve identification trivially by pre-agreeing on a move protocol ("tick 1, red goes north, green east, blue west"), which is a legitimate solve; if it lands too fast, v2 answer is randomizing which Piece may not move on tick 1.

## Done means

Four phones join, three Pieces submit blind simultaneous moves, the Board's phone flashes three unlabeled dots for 0.5s per tick and never persists them, the wire payload to the Board contains no owner IDs, and a full round ends with the post-game screen revealing which dot was which player.
