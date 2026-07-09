## Overview
Quiet Car is a competitive silent-tasks game for 3–4 players sharing a host TV and each holding a phone. The conceit: everyone is in a train's designated quiet car. Each player has a PRIVATE errand that requires silently getting information to a specific other player — but any spoken sound triggers your own phone's 'conductor,' and three shushes eject you from the car.

## Problem
Silent party games usually funnel through one shared device or devolve into shouting. Quiet Car makes the phone your only expressive channel — a private billboard you selectively aim at people — and enforces the silence rule per-person via each phone's mic, so the whole room genuinely goes quiet instead of one person policing it.

## How it works
PRIVATELY, each phone shows: (a) a two-symbol code (e.g. 🦉7), (b) a target described obliquely ('deliver to the player the host tagged as FERN' — never by name), and (c) a big toggle that turns the whole screen into a giant glyph 'placard' you can flash at someone. To complete your errand you must silently identify your target, flash your code at them, and have them tap the matching code into their phone's 'received' field. You simultaneously are SOMEONE ELSE's target, so you're watching for placards aimed at you.
The shared host TV shows only: each player's public tag (OWL, FERN…), a live 'shush counter' per player, and who's been ejected. It reveals no codes or targets. The mic is the conductor: each phone independently listens; any vocalization from its owner = one shush strike, shown on the TV. Three strikes ejects you (your errand fails). Round lasts 90s; you score by completing your delivery while staying un-ejected.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room{ phase, players[{id, tag, code, targetId, strikes, delivered}] }`; deliveries validated server-side when a target submits a code matching an aimer's. Each phone runs WebAudio RMS onset detection with an adaptive noise floor and a 3s hush calibration at start.
The genuinely hard part: attributing sound to the right owner amid crosstalk. Because every phone is near its owner's mouth, a per-phone SPL threshold (calibrated above the room's ambient floor) plus a short refractory window keeps one person's whisper from striking everyone. The server never adjudicates audio — each phone reports only its own owner's strikes — which is exactly why per-phone architecture is load-bearing: one passed-around phone could neither hold N private errands nor police N mouths.

## v1 scope
- 3–4 players, one 90s round.
- Each player: one private code + one oblique target + placard toggle.
- Mic = 3-strike shush ejection; TV shows tags + strike counts only.
- Win = your code correctly received by your target before time/ejection.

## Out of scope
- Multi-round scoring, chained relays, decoy/saboteur roles.
- Gesture recognition; camera use.
- More than 4 players.

## Risks & unknowns
- False shushes from ambient noise could feel unfair — needs robust calibration.
- Oblique target descriptions must be unambiguous enough to identify silently in a small room.
- Placard-flashing may be too easy/too chaotic with 4 players; tune target obliqueness.

## Done means
Three phones join, each shows a distinct private code + target + placard, players complete deliveries with zero words, a phone that vocalizes accrues a strike visible on the TV, and after 90s the host screen correctly reports each player's delivery success and ejection status.
