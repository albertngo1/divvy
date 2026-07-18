## Overview
Cascade is a phones-as-jugglers party game: 3–7 people stand in a circle, each holding a phone, and together they sustain a *passing juggling pattern* (siteswap) purely through timing and haptics. Nobody juggles physical objects — the 'balls' are virtual, tracked by a shared clock — but the rhythm, hand-offs, and collision-avoidance feel exactly like a passing pattern. For friends who like coordination games (spikeball-brain, not trivia-brain) and anyone curious about juggling notation.

## Problem
Coordination party games are mostly verbal or tap-a-screen. Passing juggling is a gorgeous real-time distributed-timing problem — throws must land in specific slots or the pattern 'drops' — but it's locked behind years of physical practice. Cascade grafts that mechanic (sparked by the human-robot partner-juggling paper) onto a group of phones so anyone can feel it in 30 seconds.

## How it works
One phone hosts and picks a valid multi-person siteswap. A shared beat runs across all phones. When a virtual ball is 'in your hand,' your phone buzzes and shows an arrow; on the beat you swipe toward the neighbor the pattern dictates (a self-throw = swipe up). Swipe on-beat and toward the right target → the ball flies; the receiving phone lights up for its incoming catch. Two balls arriving in the same slot, or a missed/mistimed throw, = a DROP, and the round's survival streak resets. Difficulty ramps by adding balls and faster tempo. Score = longest collective streak.

## Technical approach
Browser PWA, no install: host serves via a small Node/WebSocket relay (or WebRTC data channels) for a shared logical clock; clients NTP-style offset-correct against the host so beats align within ~30 ms. Siteswap engine: generate and validate passing siteswaps (each beat sums to a legal state; track the 'ground state' so patterns are sustainable). Throw detection: touch-swipe vector + timestamp vs. the beat window; classify on-beat/early/late and target-correct. Haptics via the Vibration API; audio click track via Web Audio scheduled ahead. The genuinely hard part is cross-device clock sync and fair timing windows so lag doesn't cause phantom drops — plus generating siteswaps that are *learnable* (not chaotic) at each player count.

## v1 scope
- 3 players, one fixed easy passing pattern, one tempo
- WebSocket shared clock + swipe-toward-neighbor detection
- Haptic buzz on your throw beat, drop detection, streak counter
- Circle seating set manually at lobby join

## Out of scope
- Arbitrary siteswap generator (v1 hardcodes a few)
- >5 players, tempo ramps, spectator view
- Accelerometer 'real throw' gesture (swipe only for v1)
- Accounts / leaderboards

## Risks & unknowns
- Clock sync jitter causing unfair drops — the make-or-break
- Is it fun without physical objects, or just a metronome?
- Discoverability of the swipe timing for newcomers

## Done means
Three phones on the same wifi join a lobby, a 3-person pass pattern runs, each phone buzzes on its correct beat, a correctly-timed swipe toward the right neighbor advances the ball, a mistimed or wrong-target swipe registers a DROP, and the streak counter increments per successful full cycle.
