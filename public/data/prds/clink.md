## Overview

A 90-second, stand-up party game for exactly 4 people sharing one room, one host screen (TV or laptop), and four phones. Each phone is both a private dossier and a contact sensor: two phones gently bumped back-to-back register a simultaneous accelerometer spike, and the server treats that as a verified, un-fakeable game action. Your private goal is to clink one specific other player — identified only by a pseudonym — while never clinking one specific player you *can* name.

## Problem

Phone party games seat everyone down and turn the handset into a keyboard. The accelerometer can resolve a two-device tap to a few milliseconds, which makes *physical contact between two specific people* a first-class, cheat-proof move. Meanwhile, most hidden-role games hand out a secret and then ignore the room entirely. Clink makes information cost you a walk across the carpet in front of witnesses.

## How it works

Lobby: phones join by QR, pick a color, and grant motion permission behind a "tap to arm" button (iOS requires a user gesture). The host assigns each player a public pseudonym — A, B, C, D — shown only on the TV, never mapped to faces.

Each phone privately shows three things and nothing else:
- **SEEK: pseudonym C** — you must clink whoever C is. You have no idea.
- **AVOID: Priya** — by real name. Clink her and you lose outright.
- A running list of identities you've personally unmasked.

The host screen shows only a live force-directed graph: four lettered nodes, an edge drawn the instant any two phones clink, plus a 90-second clock. It never shows names, goals, or who is seeking whom.

The loop: you walk up to someone, bump phones (back-to-back, cases on, a soft tap — the threshold is ~2 g, not a smash). Both phones buzz. Your phone privately reveals "that was B" — you've bought one identity. But the TV just grew an A–B edge that everyone saw, and the person you clinked now knows you're hunting. Because your AVOID is named and your SEEK is not, you are simultaneously dodging a known person and groping blind, and that person may be groping toward you.

Round ends at 0:00 or when all four have clinked their SEEK. Reveal: the TV re-labels the graph with real names and overlays the four hidden seek-arrows.

## Technical approach

Host tab + phone PWAs over an authoritative WebSocket server (PartyKit Durable Object, or Socket.IO behind Tailscale Serve for a homelab run).

**Data model.** `Room { code, phase, players[], edges[], clock }`. `Player { id, name, pseudonym, seekPseudonym, avoidPlayerId, unmasked[] }`. `Impact { playerId, tHostMs, peakG, durationMs }`.

**Sensing.** `devicemotion` at 60 Hz on each phone; a client-side peak detector fires on |a| − g crossing ~2 g with a <60 ms rise, sends one `Impact` with its local timestamp, then goes deaf for 500 ms.

**The genuinely hard part: pairing.** Phones share no clock. Each client runs continuous NTP-style offset estimation over WS ping/pong (median of the lowest-RTT 20 samples) so impacts can be projected onto host time within ~±15 ms. The server buffers impacts for 120 ms and pairs them only if exactly two arrive within ±40 ms with peak magnitudes inside 2× of each other. Three-or-more in a window is discarded as a table bump, and a room-wide 500 ms lockout after any confirmed clink prevents two simultaneous pairs from being cross-matched. Failed matches surface on the offending phones as "missed — try again," which is honest and playable.

## v1 scope (humiliatingly small)

- 4 players, hard-coded. One round, 90 seconds.
- One SEEK (pseudonymous) and one AVOID (named) per phone.
- Host screen: lettered graph, clock, end-of-round reveal. No score history, no rematch button.
- No accounts, no avatars, no sound design beyond a buzz.

## Out of scope

More than one round; 5+ players; chained or conditional goals ("clink whoever clinked B"); any leaderboard; spectator mode; Bluetooth or NFC pairing as a fallback.

## Risks & unknowns

- **Android sample-rate variance** — some devices deliver `devicemotion` at 20 Hz, blurring the impact peak. Mitigation: adaptive threshold from a 5-second calibration shake.
- **People will not tap their phones together** if they fear scratching them. Onboarding must explicitly say "back-to-back, cases on, gently."
- **False pairs** from two people setting phones on the same table at once — the exactly-two rule and lockout may not be enough.
- With 4 players the pseudonym space is tiny; a smart table may deduce everything in 30 seconds. May need 5–6 to breathe.

## Done means

Four people in a living room, cold, complete a full round: every clink they attempt registers as a pair within 300 ms at least 90% of the time; at least one player unmasks their SEEK *only* via a clink (not by guessing); and at the reveal the group can point at the graph and reconstruct at least one person's whole 90 seconds out loud.
