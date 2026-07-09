## Overview
Sentry is a concurrent-room social-deduction game for 3–5 players. Each phone becomes a private motion detector pointed at exactly one other player. On the host's command everyone freezes; the phones quietly measure how much their assigned target moved. One player is the secret Fidget, who must sneak a single small movement. The shared host screen runs the freeze clock and the reveal; the accusation happens out loud, among people.

## Problem
Freeze/statue games collapse because a human referee can't watch everyone at once, and staring contests have no hidden information. The itch: distribute the watching across the room so that *the phones* are impartial witnesses, but scatter the assignments so no one knows whether they're currently under a lens. That paranoia — "is my camera-holder good enough to catch me?" — is the game.

## How it works
The server assigns a hidden permutation: each player watches one other (a ring in v1). You prop your phone facing your target.
- **Each phone shows PRIVATELY:** "Watch: DANA — aim your camera at her," a framing reticle, and during the freeze a private "motion captured" pulse (you feel/see if your target moved, but not the number). You are never told who watches *you*.
- **The host screen shows PUBLICLY:** a big countdown → "FREEZE (5s)" → "RELAX," and after the round a single ranked bar chart of *who moved most*, aggregated from all sentries. It never shows who watched whom.
One random player is secretly the Fidget and must make one deliberate small motion during the freeze. Their own watcher's camera catches the twitch and pushes them up the motion ranking. The group then argues and votes on who the Fidget was. Fidget wins by moving only when they gamble their watcher is inattentive or badly aimed; sentries win by catching them. Because each camera sees a different person from a different angle, one shared phone couldn't cover the room — the fan-out of private lenses is the point.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Each phone samples its camera via getUserMedia, downscales frames to ~64px, and computes inter-frame pixel difference (optical energy) in a canvas/worker, streaming only a scalar `motion` value — no video leaves the device. Server holds `{watches{}, fidgetId, freezeWindow, motionByTarget{}}`, sums each target's reported motion, and ranks them. **Genuinely hard part:** normalizing motion across wildly different phones, distances, and lighting so a jittery cheap camera doesn't out-"move" a real fidget. Mitigations: a 2s per-phone baseline calibration right before the freeze (subtract ambient noise/auto-exposure drift) and reporting a z-score against that baseline rather than raw energy.

## v1 scope
- 3 players in a ring (each watches the next), one Fidget, one freeze round.
- Per-phone baseline calibration, scalar motion streaming, host ranked reveal.
- Verbal vote (hands/host tap) to accuse; QR join, no accounts.

## Out of scope
- Non-ring assignments, multiple fidgets, scoring across rounds.
- On-screen voting UI, camera face-tracking, decoy movements.

## Risks & unknowns
- Auto-exposure/rolling-shutter noise swamping a subtle fidget — calibration must be tested.
- Players needing to prop phones stably; handheld jitter may dominate.
- Whether one freeze gives enough signal to accuse confidently.

## Done means
Three propped phones each track their assigned neighbor through a 5s freeze, the secret Fidget's single arm-shift lands them at or near the top of the host's motion ranking, and a still player ranks near the bottom.
