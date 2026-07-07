## Overview
Downbeat is a timing-synchrony party game: 3–6 players try to strike their phone screens at the same real-world instant, over and over, with zero verbal cues and no shared metronome. The only guidance is a PRIVATE haptic nudge on each phone telling that player whether their last tap landed early or late relative to the group's center. The host TV shows the taps collapsing from a scattered spray toward a single tight line. It's a cooperative feel-the-room game for people who like drum circles but can't talk their way there.

## Problem
Synchrony games usually cheat by broadcasting a beat everyone follows — that's just reaction time, and one device could drive it. Downbeat removes the shared clock entirely: there is no beat to follow, only an *emergent* tempo the room has to converge on from nothing. Each player privately calibrates against feedback only they receive, which is impossible to reproduce with a single passed phone (you can't capture 5 simultaneous strikes on one screen).

## How it works
The host screen shows a horizontal timeline and a target: 'get all taps inside a 150ms window.' On a shared 'GO' the room begins free-running attempts every few seconds — no countdown. Each phone PRIVATELY: (1) registers your tap, (2) after the server computes that attempt's group median, buzzes a short pattern encoding your offset — a soft late-side double-buzz if you rushed, a single delayed buzz if you dragged, a crisp confirm if you were inside the window. You never see anyone else's number; you only feel your own drift. Over successive attempts, players privately steer toward the invisible consensus instant. The host TV animates each attempt's tap-dots sliding together; when an attempt lands all-inside-window, confetti fires and the round ends. The delight is the moment the sloppy spray suddenly snaps tight and everyone feels it click together.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket room (PartyKit / Cloudflare DO over Tailscale Serve). Data model: `room {players[], attempt#, windowMs}`, `tap {playerId, tClientMono, tServerRecv}`. Sync: on 'GO' each phone starts a monotonic clock; every strike sends `{tClientMono}` and the server also stamps arrival. Per attempt the server waits for all taps (or a 2s cutoff), computes the median, and returns each player a private `{offsetMs, inside}` for haptics plus a public anonymized dot-spread for the host. The genuinely hard part is cross-device timing: network jitter (~20–80ms) corrupts naive server-arrival timing, so each phone must timestamp locally and the server should estimate per-device clock offset via a lightweight ping/round-trip handshake at join, correcting each `tClientMono` before computing spread.

## v1 scope
- One round, 4 players, single 150ms target window
- Free-run attempts, per-phone haptic early/late/confirm feedback
- Host timeline animating tap-dots converging
- Win splash on first all-inside attempt

## Out of scope
- Difficulty tiers / shrinking windows, multi-round scoring
- Audio cues of any kind (defeats the 'no shared clock' point)
- Streaks, leaderboards, reconnect handling
- Per-player accuracy stats screen

## Risks & unknowns
- Haptics are inconsistent across phones (iOS Safari restricts vibration); may need a private on-screen early/late glyph as fallback.
- Clock-offset estimation might not be tight enough for 150ms; window may need to open to 250ms for v1.
- Could feel frustrating if the room never converges — needs a mercy widening after N failed attempts.

## Done means
Four phones join, tap in a loose spray on the first attempt, each feels a distinct early/late/confirm buzz, the host dots visibly tighten across attempts, and one attempt lands all four taps within the (offset-corrected) window and fires the win splash — verified with two players deliberately rushing and still being pulled inside via their private feedback.
