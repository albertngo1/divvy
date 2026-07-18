## Overview
Siteswap is a local-multiplayer gestural rhythm game for 2–6 people, each holding a phone. The group's phones become the 'hands' of a single juggling pattern; a virtual ball (or several) passes between them on the beat. It's a party game about shared cadence and nerve, riffing on the arXiv paper *Catch, Throw, Repeat: Planning for Human-Robot Partner Juggling* — except the partners are humans and the 'physics' is juggling's real mathematical notation.

## Problem
Most phone party games are turn-based tapping. There's almost nothing that makes a room feel like one coordinated organism in real time, and nothing that borrows juggling's gorgeous, underused siteswap math. Passing juggling is hard to learn physically; this makes the *timing intuition* playable with zero risk of a dropped club to the face.

## How it works
Phones join a room (QR / 4-letter code). They arrange in a fixed circular order. The round loads a siteswap sequence (e.g. `3` = basic cascade, `531`, or a passing pattern like `<3p|3p>`). A ball 'lands' in your phone when it's your beat: the phone buzzes and glows, and you must flick it (accelerometer throw gesture) within a timing window to send the ball to the destination hand the pattern dictates. Catch too early/late and the ball wobbles; miss entirely and it drops. Every few passes the metronome BPM ticks up. A shared click track (Web Audio) keeps everyone locked. Score = longest sustained run; drops reset the combo. Higher patterns unlock as the room proves it can hold a cadence.

## Technical approach
Stack: static PWA, no install. Transport: WebRTC data channels via a tiny signaling server (or LAN WebSocket) for sub-50ms pass events; one phone is elected clock master and broadcasts beat timestamps, others sync via an NTP-style offset handshake. Throw detection: `DeviceMotion` accelerometer magnitude threshold + jerk direction, debounced. Siteswap engine: parse a siteswap string into a beat→(source hand, dest hand, air-time) schedule; validate the sequence averages to ball count (sum of throws / period = #balls). Audio: Web Audio API scheduled click ahead of time on a lookahead clock. The genuinely hard part is clock sync across phones with drift and the fairness of the flick-timing window under variable network latency — needs client-side prediction of the beat and server reconciliation of drops.

## v1 scope
- 2 phones, one ball, pattern `3` only
- Flick-to-pass with a fixed timing window
- Shared audible metronome, fixed BPM (no ramp)
- Combo counter + drop = reset

## Out of scope
- Multi-ball patterns, passing notation `<|>`
- BPM ramp / difficulty unlocks
- Spectator view, leaderboards

## Risks & unknowns
- Cross-phone clock sync jitter may make timing feel unfair
- Accelerometer flick detection varies wildly by device
- Is 'catch by buzz' legible enough without visual ball travel?

## Done means
Two phones in a room can keep a virtual ball passing back and forth for 20+ consecutive on-beat flicks with the click track, and a mistimed flick visibly drops the ball and resets the combo on both devices within one beat.
