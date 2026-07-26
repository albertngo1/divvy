## Overview
Bogey is a four-player, eight-round hidden-role game. One player is **Ground Control**: their phone is a radar scope, the only view of the board that exists. The other three are **Pilots** flying blind on a d-pad. One Pilot is secretly the Bogey, working a different objective. The blips on the scope are **unlabeled** — Ground Control can see three aircraft and has no idea which is whom.

## Problem
Hidden-role games leak through talk: the traitor is caught by tone, hesitation, a story that doesn't line up. We wanted a traitor who hides inside *mechanical noise* instead. Because the Pilots are blind, honest pilots disobey constantly — they misjudge, they hit walls, they drift. Ground Control's real problem isn't detecting a lie, it's separating malice from incompetence when both look identical from above.

## How it works
A 10×10 airspace with terrain, one **airstrip** cell and one **fuel depot** cell. Eight rounds; each round is a 12s command window (Ground Control talks; Pilots may not) followed by a 5s commit window where all three Pilots secretly pick a direction. The server resolves all three simultaneously, then the scope updates.

- **Ground Control's phone (PRIVATE):** the scope. Terrain, airstrip, depot, and three identical dots that move but are never named. Identity→blip mapping is shuffled once at start and never re-derived, so dots are trackable by continuity and by nothing else.
- **Each Pilot's phone (PRIVATE):** callsign, a d-pad, a bump buzz on collision, and one single-use **SQUAWK** button that flashes their own blip on the scope for 1.5s. The Bogey's phone is identical except for a private objective card: reach the depot.
- **Host TV (SHARED):** round number, commit countdown, three "committed" lights, and a public squawk log ("round 4 — someone squawked, blip at E4"). It is a public audit record, never a board. After the final round it replays every trail in the players' colors.

Friendlies score by landing a blip on the airstrip. The Bogey wins by reaching the depot, or by surviving the final vote where Ground Control publicly names one *person* as the Bogey. One squawk each is the only hard proof of identity in the game, and spending it to win a small argument in round two is a real, painful cost.

## Technical approach
PartyKit Durable Object per room; round state machine (COMMAND → COMMIT → RESOLVE) driven server-side. State: `grid`, `pilots[{id,cell,role,squawkUsed}]`, `blipOrder[]` (the frozen shuffle), `round`, `commits{}`. Role-based redaction: the scope client receives `[{blipIndex,cell}]` with no player ids ever crossing the wire; Pilot clients receive `{bumped, squawkAvailable}`; the TV receives counts and squawk events only.

The hard part is **leak-proofing an asymmetric broadcast**. Commit payloads must be identical in shape and size for Bogey and friendlies, role assignment must be sent once at deal time and never re-referenced, and the RESOLVE tick must not vary in timing based on who moved where — anyone with devtools open gets to read the traitor otherwise. Secondary: making simultaneous commits feel fair when one phone's packet lands 300ms late (server resolves on window close, not arrival order).

## v1 scope
- Exactly 4 players (1 Ground Control, 3 Pilots), one game, one fixed map
- 8 rounds, fixed 12s/5s windows
- One squawk per Pilot, no other abilities
- Bogey objective is a single depot cell; no sabotage powers
- Final step: Ground Control says a name out loud, taps it on their phone, TV reveals
- TV shows countdown, committed lights, squawk log, final replay
- QR join, 4-letter code, no accounts

## Out of scope
5+ players or two Bogeys, fog on the scope, jamming/spoofing abilities, fuel or altitude, Pilot-to-Pilot private channels, persistent scoring, reconnect beyond rejoin-by-seat.

## Risks & unknowns
- The Bogey may be trivially caught by walking the wrong way, or completely uncatchable because everyone walks the wrong way. The depot's distance from the airstrip is the tuning knob and we will probably get it wrong twice.
- Ground Control's job may be lonely — one person talking for eight rounds. Consider letting Pilots answer yes/no only.
- 5s commit may be too short to be deliberate and too long to be tense.
- Blind movement plus unlabeled blips is two unknowns at once; playtest may show one has to go.

## Done means
Four phones and a laptop. Ground Control sees three anonymous dots that move on commit, Pilots see only a pad, a squawk flashes exactly one dot and appears in the TV log within 300ms. A cold game reaches the final vote with the group genuinely arguing about which blip was whose, and across three test games the Bogey is correctly named at least once and escapes at least once.
