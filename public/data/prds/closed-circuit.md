## Overview

A cooperative 90-second scramble where the touchscreen is repurposed as a contact sensor for *other people's hands*. Each phone privately holds a target finger-count; nobody may touch their own phone; the room wins only when all four phones are simultaneously satisfied for five continuous seconds. Physical layout of the phones on the table is the board — reach is a hard constraint.

## Problem

Party games either move your body (Twister) or your information (Codenames), rarely both at once. And the touchscreen — the single most sensitive sensor in the room — is only ever used as a button. Treating it as a *proximity/contact graph sensor between people* turns a coffee table into a constraint-satisfaction puzzle you solve with your arms.

## How it works

Four players, four phones placed face-up and spread out so no single person can comfortably reach two of them.

**Private briefing (10 s, phone in hand):** each phone shows only its own target — an exact count from {1, 2, 3}. Then it goes face-up on the table and the number is gone forever. You have to remember it.

**Each phone then shows publicly** one thing: a large disc, green when its live finger-count equals its (unshown) target, red otherwise. Anyone can see warm/cold; only the owner knows the target. So the owner becomes a live director — "one more, not there, take one off" — for a phone they are forbidden to touch.

**Capacity constraint:** each player may place at most 3 fingers total across all phones, and targets are dealt to sum near total capacity, so the solution requires genuine trade. Combined with arm's-length reach, the feasible assignments are dictated by where the phones physically lie.

**Host TV shows only**: a 90-second clock, a "2 / 4 SATISFIED" counter (never which two), and the 5-second hold bar. At a random moment around t=25 s the TV flips a public **INVERT** card: every target silently becomes (5 − N). No phone reveals its new number; everyone recomputes privately from memory, and the tangle scrambles.

Win: all four green, held 5 continuous seconds, before the clock runs out.

## Technical approach

Phone PWA locks the viewport (`touch-action: none`, no scroll, Wake Lock on) and counts active pointer IDs via `pointerdown` / `pointerup` / `pointercancel`. Count changes stream over WS at up to 20 Hz, debounced 80 ms to suppress flicker.

Authoritative server (Socket.IO over Tailscale Serve, or a Durable Object): `Room {phase, tStart, inverted, phones: {id, target, count, lastUpdate}}`. Clients report **counts only** — never satisfaction. The server evaluates `count === target` per phone, computes `allGreen`, and owns the 5-second hold timer with a 150 ms grace so a single dropped packet doesn't break a legitimate hold. Green/red state is pushed back down; the phone is a dumb terminal.

Hard part: palm rejection. A resting hand or a sleeve registers as phantom contacts and silently ruins a hold. Mitigate by discarding contacts with `radiusX`/`radiusY` above a threshold where exposed, and by requiring a clean "zero fingers" baseline before the round arms itself. Second hard part: iOS Safari fires `pointercancel` aggressively — treat cancel as release, and re-sync full count on every event rather than incrementing.

## v1 scope

- Exactly 4 players, 4 phones, one 90-second round
- Targets drawn from {1, 2, 3}; one INVERT event
- TV shows clock, satisfied-count, hold bar — nothing else
- No score, no rematch, no lobby art

## Out of scope

- Relational targets ("none of these fingers may be Sam's") — unverifiable by sensor in v1
- Teams, more than 4 phones, phone-to-phone contact detection
- Any use of the camera or accelerometer

## Risks & unknowns

- Capacity tuning: too generous and it's trivial, too tight and it's unsolvable — needs playtest to fix the fingers-per-player cap
- Smudged or protector-covered screens may drop contacts; a pre-round "press 3 fingers" self-test is required
- Reads as Twister-adjacent to some groups; the private-target layer has to carry the novelty
- Physical awkwardness is the feature but also the ceiling — not for every room

## Done means

Four real phones on a coffee table: each reports 0–3 simultaneous contacts accurately, the server-held 5-second timer survives a deliberately dropped WS frame without resetting, INVERT visibly scrambles the arrangement within 3 seconds, no client can force a green by lying, and a group of four solves it inside 90 seconds on at least one of three attempts.
