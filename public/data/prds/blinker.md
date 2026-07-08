## Overview
Blinker is a 2-6 player cooperative party game where phones talk to each other with light. Half the phones are *lamps* (they flash their screens), the other half are *scopes* (they film a lamp through the camera and decode the flashes). It's for friends who liked flashlight-tag and want a Jackbox-shaped reason to physically arrange themselves across a room for line of sight.

## Problem
Every phone party game routes data through the server; the phones never *see* each other. There's an untapped, genuinely physical channel — a phone screen is a bright modulated light source and the camera is a crude photodiode. Nobody plays with it, and it forces the one thing screens usually kill: people looking across a room at each other.

## How it works
Players pair up: a Lamp and a Scope, seated apart. The host TV shows a shared "message board" with blanks (e.g. a 2-symbol code). PRIVATELY, each Lamp phone shows only its own secret code plus a giant tap-to-flash pad; the phone encodes symbols as timed bright/dark (or two-color) pulses when the Lamp taps through them. PRIVATELY, each Scope phone shows a live camera view with a targeting reticle and a decoded-so-far readout — the holder must aim at their partner's glowing screen across the room and hold steady while the camera samples average brightness per frame and thresholds pulses into symbols. The host screen shows ONLY whether each pair's transmission is confirmed, never the code. Room-as-board: people, furniture, and glare block the beam, so pairs physically reposition for clean sightlines; two pairs crossing beams interfere, forcing them to spread to opposite walls.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, pairs[], phase}`, `Phone{id, role:'lamp'|'scope', partnerId, secret, decoded}`. Lamps render pulses locally on a fixed clock; the *optical* channel carries the payload, the WebSocket only carries pairing, start/stop, and the Scope's decoded guess for host scoring. Genuinely hard part: reliable low-baud optical decode on the Scope — `getUserMedia` at ~30fps, downsample the reticle ROI, compute mean luma, adaptive-threshold against a rolling ambient baseline, and clock-recover pulse edges. Keep it to ~2-3 bits/sec with a sync preamble (long flash) so drift and ambient light don't corrupt symbols.

## v1 scope
- 1 round, exactly 2 players (one Lamp, one Scope)
- One 2-symbol code from a 4-symbol alphabet (screen: white/black pulses only, no color)
- Fixed pulse clock, manual "lock reticle" button before decode starts
- Host shows only ✔/✗ per pair

## Out of scope
- Two-color / higher-baud encoding, error correction
- 3+ pairs, interference scoring, team scoreboards
- Auto-aim, face/screen detection

## Risks & unknowns
- Ambient light and screen glare may swamp the signal; may require dimming the room (feature, not bug — leans into room-as-board).
- Camera exposure auto-adjust fighting the threshold; may need to lock exposure or use relative deltas.
- iOS `getUserMedia` needs HTTPS + user gesture; frame-rate throttling in background tabs.

## Done means
In a normally-lit room, a Lamp and Scope 3m apart can transmit a 2-symbol code with the Scope's phone privately showing the correct decode and the host flipping to ✔ within 20 seconds, three tries running.
