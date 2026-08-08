## Overview
White Balance is a 3-player silent cooperative game for a TV and a phone each. Everyone turns a hue dial to pick a color. Every phone renders color through a *different secret rotation*, so what you see as red is truly teal on someone else's screen. The room wins when all three TRUE hues land within 30° of each other by the end of round 3.

## Problem
"Everyone pick the same thing" collapses instantly the moment a shared reference exists — the room converges on red, or on 50, or on the middle, and the game is over. The interesting version is the one where every instrument in the room is miscalibrated in a private way and there is no vocabulary for the target. That's a real problem (color calibration, sensor drift) and nobody has made a party game out of it.

## How it works
**Each phone (private):** a hue wheel with a draggable marker and a large swatch. Every color on that screen is rotated by your private θ, assigned by the server and never sent to the client. Your dial reads degrees — in *your* frame. You also see a private log: "last round you turned +72°."

**Host TV (public):** during a 20-second lock phase, only a countdown and three LOCKED badges. At reveal, a neutral wheel with degree ticks showing the three TRUE hues as three anonymous dots — no names, no order, plus the spread arc and its width in degrees.

**The deduction:** a rotation preserves *differences*. You can't tell where you are, but you know exactly how far you moved. So on the reveal you hunt for the dot that shifted by your remembered delta — you have to find yourself in the data before you can correct yourself. Once you've identified your dot, you know the exact turn needed, because +40° true is +40° on your dial. Round 1 is a blind cold start; round 2 is self-identification (ambiguous and delicious when two players happen to move alike); round 3 is the correction.

## Technical approach
PartyKit room. State: `{players: {id, theta, trueHue, history[]}}`, θ drawn ≥60° apart. **The phone never receives θ** — it submits a dial value in its own frame and the server maps to truth, and any color the phone displays is pre-rotated server-side. That kills devtools cheating and keeps the secret authoritative.

Hard parts: (1) cross-device color fidelity — Night Shift, True Tone, OLED gamut all shift perceived hue, so the game is played on *angles*, not vibes: fixed S/L, degree ticks on the TV wheel, numeric dial readout, so color perception is flavor and geometry is the mechanic (this also makes it colorblind-playable); (2) simultaneous lock with a hard deadline plus late-join/reconnect restoring θ; (3) reveal choreography — the dots must be shuffled every reveal so dot order carries zero identity.

## v1 scope
- Exactly 3 players, one host tab, room code
- Three rounds, 20s lock each, no practice round
- Fixed θ spacing, single win threshold (≤30° spread)
- Reveal wheel + spread number; win/lose card at the end

## Out of scope
4+ players, saturation/lightness axes, nonlinear or per-source distortions, scoring across games, sound, rematch, accessibility settings beyond the numeric readout.

## Risks & unknowns
Self-identification may be too easy — if so, round 2 ends it and the game is two rounds long; mitigate with a forced small minimum move or tighter θ spacing. Conversely, two identical deltas can make round 2 unresolvable and feel unfair. Whether "I am secretly miscalibrated" lands as funny or as merely confusing is the real unknown, and only a playtest answers it.

## Done means
Three phones and a TV; a first-time group finishes three rounds with a final true spread ≤30° in at least 2 of 5 sessions, and at least one player can state their own rotation to within 20° after the reveal.
