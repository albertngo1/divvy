## Overview
Footfall is a 4-player physical stealth game fusing two underused sensors: the pedometer (accelerometer step detection) on the Movers' phones and the microphone on the Guard's phone. Three Movers race to physically cross the room — wall to opposite wall — while one Guard, facing away, uses their phone as a live listening post. The room itself is the board; the far wall is the finish line.

## Problem
Red-light-green-light is a great party bones, but it runs on one person's eyeballs. Nobody has made the *phones* be the referee: your own device silently tallies your progress, and the Guard's device — not the Guard's ears — decides when you were too loud. That asymmetry only works if every player holds their own phone.

## How it works
Movers line up at the start wall. Each Mover's phone PRIVATELY shows: a step-progress bar (how far across the target step-count they are, e.g. 20 steps to cross), and a private "too fast / land softer" warning derived from their own accelerometer impact magnitude. The Guard's phone PRIVATELY shows a single live mic-loudness needle plus a "CALL FREEZE" button; the Guard cannot see anyone's progress.

When the Guard taps freeze, the host TV flashes RED and every Mover's phone must read near-zero motion within 1.5s — any Mover whose accelerometer still shows walking-magnitude motion is caught and sent back to the wall. Between freezes, Movers advance, but each real footstep risks tripping the Guard's mic needle over threshold, which lets the Guard freeze with confidence. So Movers must literally tiptoe: step count advances progress, but loud landings feed the Guard. The shared TV shows only three anonymous progress pips and a red/green state — never which Mover is where. First Mover to bank their crossing step-count wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve). Data model: per-Mover `{steps, lastImpactPeak, moving:bool}`; Guard `{micRMS, freezeTapAt}`. Movers run a lightweight peak-detection pedometer on `devicemotion` acceleration (band-passed ~1.5–2.5Hz), streaming step increments and a `moving` flag (variance over a 300ms window). Guard streams smoothed mic RMS. Server arbitrates freeze windows: on freeze, snapshot every Mover's `moving` flag after a 1.5s settle. The genuinely hard part is cross-device pedometer calibration and distinguishing a real step from a fidget — solved with a 10-step calibration walk per phone at join and a generous, per-device threshold rather than absolute counts.

## v1 scope
- 3 Movers + 1 Guard, one crossing, one round
- Pedometer step-progress + accelerometer freeze-check for Movers
- Single mic needle + freeze button for Guard
- TV shows 3 anonymous pips + red/green state only

## Out of scope
- Multiple Guards, multiple rounds, elimination brackets
- Absolute positioning or true footstep localization
- Difficulty tuning per player

## Risks & unknowns
- Pedometer false positives from arm-swing vs real steps; needs the calibration walk
- Mic threshold varies wildly by room noise floor — may need a per-room ambient baseline tap
- Fairness: fast walkers advantaged unless step-count (not time) is the currency

## Done means
Three Mover phones each show an independent live step bar, the Guard phone shows a live mic needle and can freeze, a freeze snapshots each Mover's motion and sends the moving ones back, and the first Mover to reach the crossing step-count triggers a win on the TV — all with no phone revealing another's position.
