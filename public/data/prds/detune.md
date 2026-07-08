## Overview
Detune is a concurrent-room party game for 3–6 players that reimagines *Wavelength* with each phone as a physical dial. One player is the Psychic; the rest are Guessers who literally tilt their phones to slide a needle along a spectrum. It's for groups who love the 'read my brain' tension of Wavelength but hate how the loudest person at the table drags everyone's guess toward their own.

## Problem
Real Wavelength has two friction points: you need a plastic screen-and-dial prop to hide the target, and the guessing is a group negotiation where one confident voice anchors everyone. Detune dissolves both — the target hides natively on one private phone, and simultaneous blind locking makes each guess genuinely independent.

## How it works
The host TV shows a labeled spectrum (e.g. HOT ↔ COLD) as a horizontal band with no needle visible. **Privately, only the Psychic's phone** shows the true target zone glowing on that spectrum. The Psychic types a one-word clue ("lava") which appears on the TV.

Then every Guesser holds their phone flat and **tilts left/right**; the phone's `deviceorientation` gamma maps to a needle position, rendered **only on that Guesser's own screen** — nobody sees anyone else's needle, and the TV stays blank. A 5-second countdown runs; each phone locks on timeout or on tap. Only after all lock does the TV animate every needle sliding in at once, revealing the target band and scoring by distance. Because guesses are private until the simultaneous reveal, there is zero table-talk anchoring — the core fun is 'did we independently land in the same place?'

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room { spectrumId, targetPos (server-secret), clue, phase, players: { id, role, needlePos, locked } }`. The Psychic's target is sent only to the Psychic socket. Guesser phones stream throttled gamma (~15Hz) but the server does NOT broadcast needle positions during the guess phase — it only records the final locked value, guaranteeing privacy. Sync strategy: server holds phase clock; countdown driven by server timestamps so all phones reveal on the same tick. Hard part: making the tilt dial feel calibrated and stable across phones — needs a per-phone calibration tap ('hold flat, tap center = zero') and a low-pass filter to stop jitter.

## v1 scope
- 3 players, one Psychic + two Guessers, ONE spectrum, ONE round.
- Fixed spectrum list of ~10 hardcoded pairs.
- Tilt-to-dial with center-tap calibration; lock on 5s timeout.
- Simultaneous TV reveal + simple distance score.

## Out of scope
- Multi-round matches, team play, the 'left/right of target' betting from real Wavelength.
- Custom spectrums, accounts, animations beyond the reveal slide.

## Risks & unknowns
- `deviceorientation` permission friction on iOS (requires a tap gesture) and inconsistent gamma ranges across devices — calibration must be dead simple.
- Is tilt-dial actually more fun than a touch slider, or just fiddlier? Prototype both.

## Done means
On three phones in one room, a Psychic sees a private target, types a clue; two Guessers each tilt a private needle no one else can see, both lock, and the TV reveals both needles plus the target simultaneously with a distance score — with no needle ever visible before the shared reveal moment.
