## Overview
A physical-comedy waiter's race for 3–4 players in one room, with a TV/laptop as the shared "dining room" and each phone as a private tray held flat in one hand. It's about the ridiculous careful-walking body language of carrying something full while other people cut across your path.

## Problem
Most phone-sensor party games are stationary — you stand and tilt or hum. Nobody makes you actually *walk across the room holding the phone like a fragile object while dodging bodies.* The room's crowdedness itself is never the hazard. Silver Service turns the shared floor into the obstacle and other players into the danger.

## How it works
Each player holds their phone flat, palm-up, like a tray. The **host TV** shows the room as a top-down dining floor with numbered tables and, for each player, a glass filling with liquid — the shared, public "how full is everyone's tray" view (anonymized-ish by color). Each **phone PRIVATELY** shows: (1) your secret destination table number — nobody else knows where you're headed, so paths cross unpredictably; (2) a live bubble-level showing your tilt off horizontal; (3) your remaining liquid. On "go," all players cross simultaneously from their start corners to their private table. Two things spill you: sustained tilt off level (measured from the gravity vector), and sharp jerk spikes from physically bumping another player (or rushing/stomping). Because destinations are private and everyone moves at once, real human collisions in the shared space are the core hazard — and the accelerometer *feels* every bump. First to reach their table still holding liquid wins; empty tray = disqualified.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). **Data model:** Room{players[], phase, startTime}, Player{id, color, targetTable, liquid:0–100, tiltPenalty, bumpCount, arrived}. **Sensors:** DeviceMotion — gravity vector → tilt angle (reliable); `acceleration` (gravity-removed) magnitude → jerk spikes for bump/stomp detection (peak over threshold). Each phone computes its own `liquid` locally at 30–60Hz (drain rate ∝ tilt beyond deadband + fixed penalty per bump peak) and streams a throttled liquid/tilt/bump summary (~10Hz) to the server, which is authoritative for win/DQ and rebroadcasts to the host. **Sync strategy:** phones own their physics; server owns game state and ordering; host is a pure renderer. **Genuinely hard part:** calibrating the bump threshold so a real neighbor-bump reliably fires but normal walking footfalls don't — per-device accelerometer noise floors differ, so a 3-second "stand still holding tray" baseline capture per phone sets each player's personal jerk threshold.

## v1 scope
- 3 players, one round, one race.
- Four fixed tables, random private assignment.
- Tilt-drain + bump-drain only; first-to-table-with-liquid wins.
- Per-phone baseline calibration step.
- Host shows floor + three filling glasses.

## Out of scope
- Teams, multiple courses, obstacles/props on screen.
- Real indoor positioning (host floor is decorative, not tracked).
- Scoring history, cosmetics, spectator mode.

## Risks & unknowns
- Bump vs. footfall discrimination is the make-or-break; may need per-device tuning.
- Players could "cheat" by walking glacially — add a soft time limit that also drains liquid.
- iOS requires a tap to grant DeviceMotion permission.

## Done means
Three phones calibrate, all cross simultaneously; deliberately bumping a neighbor visibly drops that phone's liquid on the host screen within ~200ms, holding the phone level the whole way preserves it, and the first player to reach their private table still holding liquid is declared winner authoritatively by the server.
