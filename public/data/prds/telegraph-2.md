## Overview
Telegraph is a 3-4 player hidden-role party game where the shared dining/coffee table *is* the board. Every player lays their phone flat on the table at their seat. One player is the secret Sender; when they knock a rhythm on the tabletop, the vibration travels through the wood and each phone's accelerometer feels it — but weaker the farther it sits from the knock point. Your felt-intensity is private evidence. The group talks, compares (and one player lies), and votes on which seat sent it. For friends who like Werewolf but want the tell to come from physics, not faces.

## Problem
Social-deduction games run on bluffing about *nothing* — pure talk, no ground truth. The itch: a hidden-role game where the room hands each player genuine, asymmetric physical evidence that can't be seen by anyone else, so lies have to fight against felt reality.

## How it works
Everyone places their phone flat on the same table and hits Ready. The host TV shows a 3-2-1 hush window. Privately, one phone is chosen Sender and shown a short rhythm (e.g. tap-tap---tap) plus "knock it on the table now, anywhere you can reach." The Sender knuckle-raps that rhythm. Every phone's accelerometer records the z-axis spike train; each phone PRIVATELY displays its own felt-intensity as a single needle (Faint / Medium / Strong) — nothing else. The host TV shows only that a knock was detected and starts a 90s discussion timer; it never reveals the gradient. Players verbally compare needles ("mine was strong") to triangulate the source seat. The Sender scores if the group misvotes — so they knock closer to a neighbor to frame them, but reaching across the table is conspicuous. One round, one vote, reveal.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: Room{players[], sender, phase, knockEvents[]}; each Player{seat, ready, peakAmp, feltBucket}. Phones read `DeviceMotion` acceleration (gravity-filtered high-pass), detect impulse peaks above a floor, and stream {t_local, peakAmp} bursts. The hard part is correlating one physical knock across phones with unsynchronized clocks and then trusting the amplitude gradient: server runs a lightweight offset sync (ping/pong RTT) and groups peaks landing within a ~150ms window into one KnockEvent, then buckets each phone's peakAmp into Faint/Medium/Strong *relative to that event's max* (so absolute table stiffness cancels out). Direct phone-bumps are rejected by requiring the impulse to appear on ≥2 phones near-simultaneously (a table-borne wave), not one.

## v1 scope
- 3-4 players, one table, one round, one Sender, one vote.
- Single knock event; three-bucket private needle only.
- Manual seat entry (tap your name to your position).

## Out of scope
- Multiple rounds / scoring across games.
- Precise (x,y) source localization or a visualized heatmap.
- Non-wood tables auto-calibration profiles.

## Risks & unknowns
- Table material (glass, thick oak, tablecloth) may flatten the gradient — needs a pre-round calibration knock.
- Cheap phones' accelerometers may saturate or miss faint taps.
- Cross-phone timing correlation is the make-or-break.

## Done means
Three phones on a real wood table; a scripted knock near seat 2 makes seat 2's needle read Strong and the far seat read Faint on the same event, and the group can vote a seat from those private needles alone.
