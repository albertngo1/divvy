## Overview
Shutter is a 3-player cooperative timing game. A short silent animation loops on the host TV; each player privately taps their phone to 'snap a photo' at the single moment they believe everyone else will also snap. It's a Schelling point *in time* — everyone can feel where 'the' moment is, but nobody agrees to the millisecond. The room wins when all three shutter-taps land in the same narrow window.

## Problem
Existing sync games either give an explicit countdown (trivial) or ask you to release on pure internal feel with no anchor (a coin flip). Shutter sits in the sweet spot: a shared visual anchor makes 'the peak' legible, but the exact frame is genuinely contested, so the fun is reading the moment the *others* read.

## How it works
The host TV plays a ~6s silent loop with one clearly salient beat but soft edges: a firework arcing up and bursting, a wave rising to a crest, a runner reaching the tape, a raindrop about to hit. It loops seamlessly and continuously.

Each phone shows only a big **SNAP** button and a private 'you've snapped' confirmation — nothing about the animation (players watch the shared TV), nothing about others' timing. The moment you tap, your phone locks a timestamp relative to the loop clock. You get one snap per loop pass.

Shared host screen while playing: the looping scene plus a small loop counter and an anonymous 'shutters fired: 2/3' tick — never *when* anyone fired. After all three have snapped in a pass, the host reveals every tap plotted on a timeline of the loop, with the target window highlighted.

Win = all three taps fall within ~250ms of each other (tunable) on the same loop pass. Miss = they replay the loop and try again (best-of, or a fixed number of passes).

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). The host owns the loop clock and broadcasts periodic `loopTick {loopId, tHostMs}` beacons; each phone runs a lightweight clock-offset estimate (NTP-style: on tap, send `tap {clientMonotonicMs}`, server maps to loop-relative time using the phone's measured offset). Data model: `Room { loopId, taps: {pid: loopRelativeMs} }`. On a completed pass the server computes max−min spread and declares win if ≤ threshold. Genuinely hard part: **cross-device clock alignment** — phone tap timestamps must be projected onto the host's loop timeline within tens of ms despite WebSocket jitter. Solved with per-phone offset calibration during the 3s join handshake and by timestamping taps against the phone's own monotonic clock (not on server receipt), so network latency doesn't corrupt the measurement.

## v1 scope
- Exactly 3 players, one hand-made loop animation, one target window.
- SNAP button + one tap per pass; server-side spread check.
- Host reveal timeline after each full pass.
- 4-letter room code; no accounts.

## Out of scope
- Multiple animations / difficulty tiers.
- Scoring across rounds, >3 players.
- Per-player handicaps, audio cues.
- Spectators, saved 'photos'.

## Risks & unknowns
- Clock-offset estimation is the make-or-break: if alignment error approaches the 250ms window, wins/losses feel random. Needs a solid calibration handshake and real-device testing.
- The loop must have exactly one salient moment — two competing peaks fork the room; a mushy peak makes it luck.
- Watching the TV while thumb-hovering the phone is an awkward split; button must be huge and blind-pressable.

## Done means
3 phones join via code, all watch one looping animation on the TV, and each taps SNAP once per pass; the host shows only an anonymous fired-count live and reveals all tap times on the loop timeline after each pass; when the three taps fall within the target window the host declares a win, with measured cross-device timing error demonstrably under the window on real phones over the LAN.
