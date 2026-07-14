## Overview
Foxfire is a 3–4 player concurrent-room party game where every phone is simultaneously a *beacon* (its screen flashes a private color-blink signature outward) and a *scanner* (its rear camera hunts the room for one specific target beacon). It's for a lit-but-dimmable living room and people willing to shuffle around furniture. Think fireflies signaling across a dark field, except each firefly is looking for exactly one other.

## Problem
Optical signaling is the most romantic idea in phone hardware and nobody uses it. Screens are bright directional light sources; rear cameras are decent light meters. Point them opposite directions — because they physically face opposite directions — and one phone becomes a full-duplex line-of-sight node. That asymmetry is impossible to fake by passing a single phone around, which is exactly the constraint Divvy wants load-bearing.

## How it works
Each player is privately assigned a **signature** (e.g. red–red–blue, ~1.2 Hz) and a **target** (another player's signature — never their name). The phone's *screen* continuously strobes the player's own signature as full-bleed colored flashes; the *rear camera* continuously samples a center reticle, running frequency/hue analysis to detect a matching blink pattern in its field of view.

PRIVATE per phone: your own signature swatch, your assigned target swatch, a live "scanner" viewfinder with a lock-progress ring, and a warm/cold hue-confidence bar. SHARED host TV: only 3–4 anonymized lock pips and a countdown — never who found whom.

Because your screen faces the people hunting *you* while your camera faces where *your* target is, you must orient your body so both hold — and other players' bodies, lamps, and couches occlude line-of-sight. Room-as-board is literal: you renegotiate physical position until the whole directed graph of locks closes. Win when all pips are lit inside 90 s.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, deadline}`, `Player{id, signatureSeq, targetId, locked}`. Screen strobe is a local rAF loop keyed off a server-synced epoch so blink phases don't matter. Scanner samples a downscaled camera ROI (~30 fps via `getUserMedia` + offscreen canvas), computes mean hue/luma, buffers ~2 s, and runs a lightweight autocorrelation/goertzel over the sequence to score a signature match; a 1.5 s sustained match emits `lock{targetId}`. Server validates and flips the pip.

Genuinely hard part: reliable detection of a modulated colored source across a room under camera auto-exposure/auto-white-balance and ambient glare. Mitigations: slow (~1–1.5 Hz) high-saturation blinks, lock exposure where the API allows, match on hue *transitions* not absolute brightness, and require sustained duration to kill false positives.

## v1 scope
- 4 players, one round, 90 s timer.
- 3 fixed signatures assigned round-robin; each player targets exactly one other (a single cycle).
- Screen strobe + camera-ROI scanner + lock ring on phone; 4 pips + timer on host.
- One win/lose screen.

## Out of scope
- More than 4 players, multi-round scoring, teams.
- User-chosen colors, colorblind-safe alt patterns, difficulty tiers.
- Reconnect/spectator polish.

## Risks & unknowns
- Camera detection reliability in bright rooms (may need to dim lights — feature, not bug).
- iOS Safari `getUserMedia` + screen-wake + strobe simultaneously draining battery/CPU.
- Photosensitivity: cap flash rate, offer a solid-fade fallback.

## Done means
Four phones in one room, lights slightly dimmed: every player's camera can lock their assigned target's blink within 1.5 s of clear line-of-sight, all four pips light on the host, and the win screen fires — with at least one round where a player had to physically move around another's body to close their lock.
