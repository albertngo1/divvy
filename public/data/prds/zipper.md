## Overview
A real-time silent-timing game for 3 players. The host TV is a single-lane highway funnelling to one merge point; each phone is a throttle for one car. It's for a group that wants the specific dread of a real-world zipper merge — where nobody talks, everyone guesses, and one greedy move ruins it — turned into 60 seconds of held breath.

## Problem
Co-op party games usually reward tight coordination. This one makes coordination the trap: the fun is that you *can't* announce your timing, you can only feel for a gap and hope the other person felt the same gap differently. Real merges fail for exactly this reason; we want that itch.

## How it works
The TV shows a highway where three cars approach on separate feeder ramps toward one merge gate that admits a single car at a time. Each phone shows a big hold-to-accelerate pad plus a **private** "time-to-merge" countdown visible only to that player. Cars always creep forward (monotonic — you can never brake or reverse); holding the pad speeds you up. If two cars' bumpers enter the merge zone within 0.5s of each other → CRASH → the round is lost for everyone. Win = all three cars pass the gate cleanly, staggered, inside a 60s timer.

Private per phone: your throttle, your exact countdown, and a haptic buzz that pulses faster as *some* other car nears the gate at the same moment (danger proximity only — never identity or position). Shared TV: the road, the three cars' coarse positions, the gate, and the crash/clear verdict. You can eyeball rough positions on the TV, but you cannot see anyone's countdown or throttle, and because you can't slow down, over-accelerating locks you into a collision you can't back out of.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `room {players[], cars[{pos, vel, ramp}], tick}`. Server integrates positions at 20Hz from a per-phone `throttleHeld` boolean, clamps `vel ≥ base` (no reverse), and detects merge-zone occupancy overlap on its own clock. It broadcasts to each phone only *their* countdown + a scalar proximity value, and to the host the coarse car positions. Hard part: real-time fairness — the 0.5s crash window must be judged on server time despite jitter, while phones need client-side prediction so the accelerate pad feels instant and reconciles smoothly. The proximity buzz must be derived without leaking who or where the rival is.

## v1 scope
- 3 players
- One straight highway, one merge gate
- Hold-to-accelerate only, monotonic forward
- One round, 60s timer
- Server-side crash detection + win/lose splash
- Cars as colored dots; no art

## Out of scope
- Braking, multiple lanes, obstacles
- Cross-round scoring, matchmaking, spectators
- Any real vehicle art or sound design

## Risks & unknowns
- Latency fairness on the 0.5s window
- Whether hidden-timing tension reads as thrilling or just frustrating
- Buzz proximity possibly leaking too much
- Tuning the merge window and base creep speed

## Done means
Three phones join a LAN room via QR and throttle simultaneously. The server reliably flags a crash when two cars enter the gate within 0.5s and a clean pass otherwise; a staggered clean pass shows a win splash. Testable: force two players to floor it → reliable crash; hand-stagger three passes → reliable win.
