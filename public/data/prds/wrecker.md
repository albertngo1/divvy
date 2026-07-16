## Overview
Wrecker is a 4–5 player social-deduction concurrent-room game (host screen + phones). Two players are Guides who can see the coastline map on their phones; the others are blind Pilots steering boats through fog. One Guide is secretly the **Wrecker**, who wins by running boats onto the rocks. For groups who love hidden-traitor games but are tired of pure discussion — here the betrayal happens in the *steering*.

## Problem
"One phone is the map" usually means one trusted narrator. Wrecker asks: what if you have *two* narrators, both invisible-mapped, and you can't tell the saboteur from the savior because their instructions look identical? It fuses map-asymmetry with treachery and gives the map-holders an active, hidden agenda instead of a servant role.

## How it works
The host TV shows a fog channel grid (5 wide × 5 tall) with a harbor at the top and hidden rocks. Each round it reveals only boat positions and any wreck splashes — never the safe path.

**Guide phones (private, ×2):** both see the *same true map* — the safe channel and the rocks. They differ only in intent: the honest Pilot-Guide wants boats home; the Wrecker wants them sunk. Each Guide privately sends each boat a single steering arrow per round.

**Pilot phones (private, ×2):** each shows two incoming arrows this round — one labeled "Guide A," one "Guide B" — plus their own wake trail. They pick which arrow to obey (or override) and Commit. They cannot see the map or the other boat's arrows.

Each round resolves simultaneously: boats move, boats on rocks wreck. Because both Guides look plausible, a Pilot only learns the truth by comparing outcomes across boats and rounds ("Guide B told us both to go east; I sank, did you?"). After a 4-row channel or first wreck, the crew votes on who the Wrecker was. Crew+honest-Guide win if all boats reach harbor; Wrecker wins on any wreck; a correct vote flips a wreck into a Wrecker loss.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Game{grid, safePath[], rocks[], round}`, `Role{playerId, kind: guide|pilot, secret: wrecker?}`, `Boat{pos, alive, committedDir}`, `Whisper{fromGuide, toBoat, dir}`. Lock-step rounds: whisper window (guides fan out arrows) → commit window (pilots choose) → atomic resolve. The hard part is strict per-recipient rendering: each Pilot must receive exactly two arrows addressed to *their* boat and never see another boat's whispers or the Wrecker flag; the server composes a distinct payload per socket and the host gets only anonymized dots/splashes.

## v1 scope
- 2 Guides + 2 Pilots, one 5×5 channel, one round.
- Both guides see true map; one is secretly Wrecker.
- Simultaneous resolve, single end-of-round vote.

## Out of scope
- 3+ guides, scrambled/fake maps, multi-round campaigns, scoring history, reconnection.

## Risks & unknowns
- With only 4 moves, is there enough signal to deduce the Wrecker, or is it a coin flip? May need one extra boat or row.
- Balance: the Wrecker sinking a boat too early kills tension; consider requiring a majority of boats wrecked.

## Done means
Five phones join, two Guides see a map the Pilots can't, each Pilot receives two private conflicting arrows per round, moves resolve simultaneously with wrecks on the host screen, and the round ends with a reveal-and-vote that assigns a win to the crew or the Wrecker.
