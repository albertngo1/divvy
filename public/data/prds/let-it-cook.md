## Overview

Let It Cook is a 4-player, one-round race where each phone slowly brews a private clue pointing at one physical object in the actual room — but only while the phone is face-down, flat, and untouched. The accelerometer isn't a controller here; it's a state machine, and the three states it detects are mutually exclusive by physics.

## Problem

Every hidden-info party game hands you your secret instantly and for free. The itch: make consuming your own private information *cost* something, in a currency the whole room can see you spending. Your posture becomes public information about your private state — no telemetry leak required, everyone just has eyes.

## How it works

Each phone is always in exactly one of three states, classified from `devicemotion`:

- **DARK** — face-down (gravity z inverted), motion energy near zero. Your clue accrues one token every 4 seconds. Screen is black; you literally cannot read while it brews.
- **READING** — face-up, still. Accrual stops dead. You see every token accrued so far, at once.
- **MOVING** — motion energy above threshold, any orientation. Accrual stops *and* the screen blanks. You cannot read while walking.

Each player's clue stream describes a different object in the room, and tokens sharpen as they go: token 1 is "higher than your knee", token 5 is "something is printed on it", token 7 is nearly a giveaway. Everyone brews simultaneously from the moment the round starts.

To win, you go touch the thing. **Proof of touch:** press the phone flat against the object and hold still 2 seconds. The gravity vector classifies the surface as FLAT, UPRIGHT, or SLOPED, and each of the six candidate objects was tagged with its class during setup. Then tap which object you're claiming. A class mismatch is rejected loudly on the TV before your guess even counts. The room's eyeballs handle the rest of the refereeing — everyone can see where you walked.

A wrong call is a 20-second public burn: no brewing, no reading, phone locked, name flashing on the TV.

**Privately, your phone shows** only your own accrued clue text, and only in READING state. **The host screen shows** each player's state lamp (DARK / READING / MOVING) and their token count — which leaks nothing the room can't already see, but turns the race legible: watching a rival sit at 6 tokens and suddenly stand up is the tell that makes you gamble early.

## Technical approach

Host tab + phone PWAs + an authoritative Socket.IO or PartyKit room. Phones classify their own state locally at 30Hz (cheap, avoids streaming raw motion) and emit only state *transitions* with a monotonic client timestamp; the server owns the clock, applies its own NTP-style offset estimate per socket, and accrues tokens server-side so a hacked client can't fast-forward. Clue text is never sent ahead of time — token N ships only when the server credits it.

Data model: `Room{code, targets: {id, label, surfaceClass}[6], startedAt, phase}`, `Player{id, targetId, state, stateSince, tokens, lockedUntil, offsetMs}`.

The genuinely hard part is state classification that doesn't flicker. Someone bumping the coffee table must not knock every DARK phone into MOVING and reset the room's patience. This needs hysteresis: a 700ms dwell before any transition out of DARK, an energy threshold calibrated per-device during a 3-second lobby baseline, and a rule that brief spikes below 1.2× baseline are ignored entirely. Second real problem: a phone face-down for 90 seconds will screen-lock and drop the socket. Screen Wake Lock API covers Chrome/Android and modern iOS Safari; older iOS needs a silent-video NoSleep fallback, and the lobby must verify the lock was actually granted before the round can start.

## v1 scope

- 4 players, one round, six candidate objects, ~3 minutes total
- 30-second setup: group names six objects aloud, taps each as FLAT / UPRIGHT / SLOPED
- Three states, one clue ladder of 7 hand-written tokens per object
- One wrong-call penalty, first correct call ends the round
- TV shows state lamps, token counts, a burn banner, and the winner

## Out of scope

- Generated clue ladders (v1 ships hand-authored ladders for one fixed six-object demo set plus a manual entry mode)
- Any camera or image use for verifying the touched object
- Team play, multi-round scoring, spectators
- Cheat-proofing against a player who props the phone face-down on their thigh and peeks around it — the room polices that

## Risks & unknowns

- Surface-class proof is weak: a room may have five FLAT candidates, making it near-decorative. Acceptable for v1 if the room refereeing carries it; if not, surface class becomes a pure flavor confirmation and the tap is the real answer.
- Motion thresholds vary hugely across phones; the lobby baseline may be insufficient on very noisy IMUs.
- Clue ladder tuning is the whole balance problem: too steep and everyone waits for token 7, too shallow and it's a coin flip at token 2. Expect several playtests purely on the ladder.
- Face-down phones on a soft couch cushion damp motion detection differently than on a hard table.

## Done means

Four phones on one real table brew simultaneously for 60 seconds with zero spurious state transitions when someone sets down a drink; a player who walks to an object, presses the phone flat, and taps the right label is credited within 300ms; a player who presses an UPRIGHT phone against a FLAT-tagged object is rejected on the TV; and in a live playtest at least one player gambles early on a partial clue and loses the race to someone who waited.
