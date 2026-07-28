## Overview

A 3-player haptic channel-contention game. Every phone goes face-down on one hard table; every player rests fingertips on the wood. Each phone privately holds a short message it must push through a shared 12-slot timeline, and the table is the only wire. Two phones firing in the same slot collide into a doubled, unlocatable thump and both lose the symbol. It is carrier-sense networking played with your hands, for people who like games that go quiet and tense.

## Problem

Party games about "don't collide" almost always resolve collisions on a screen — you tap, you look up, the TV tells you you lost. The punishment arrives as a notification. Here the collision arrives through the furniture, before anyone looks up, and you cannot tell who caused it. That ambiguity is the whole game.

## How it works

The TV shows a 12-slot timeline, 700ms per slot, with a big ticking cursor and a click track so everyone shares the beat. Slots fill in as the round runs: gray = one clean pulse, red = collision. **No owner attribution until the reveal.**

**Private (phone):** your payload length — secretly 2, 3, or 5 pulses, dealt differently to each player — a counter of pulses remaining, and one giant SEND button. That asymmetry is the engine: the player holding 5 pulses is desperate for slots and invisible until the board is nearly full, and the player holding 2 can afford to be polite.

**Firing:** tapping SEND during a slot plays a 55 Hz burst through the phone speaker into the tabletop. One phone = a clean tap you feel in your fingers. Two phones = random relative phase, roughly doubled amplitude, and a wobble you can feel but not localize. You now know the channel is contested; you do not know by whom.

**Scoring:** +10 per pulse delivered clean, −15 per collision you were part of, 0 for undelivered pulses. Reveal recolors the timeline by owner and the 5-pulse player usually gets booed.

## Technical approach

Host tab + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve is fine for one table).

**Data model:** `Round { startAt, slotMs: 700, slots: 12, pulses[] }`, `Player { id, payloadLen, delivered, collisions }`. A pulse is `{ playerId, correctedTs → slotIndex }`.

**Sync:** ping/pong offset estimation per phone, then the host cursor and every phone's local cursor are both derived from `startAt` in server time. Phones fire audio locally via a pre-warmed WebAudio oscillator (unlocked on a tap at lobby join).

**Hard part:** deciding *what* the server judges. Phone audio output latency is 100–300ms and varies by device, so the sound you hear is not when you tapped. v1 judges the **tap timestamp**, not the sound — audio latency then only affects feel, never fairness — plus a 15% guard band at each slot's tail rendered on the phone as a dead zone so boundary taps don't become coin flips.

## v1 scope

- 3 players, one table, one 12-slot round
- Payload lengths hardcoded 2 / 3 / 5
- One tone, one collision rule, no backoff timers
- TV shows gray/red slots and a reveal screen

## Out of scope

Multi-round, receiving/decoding another player's message, real acoustic collision detection via mic, iOS `navigator.vibrate` (it doesn't exist), soft tables, more than 3 phones.

## Risks & unknowns

Cheap phone speakers roll off hard below 80 Hz — the thump may need to be 90–120 Hz to actually be felt. Tabletop material matters enormously (glass rings, particleboard deadens). Players may cheat by watching hands instead of feeling; 700ms slots may be too fast to react to.

## Done means

Three phones face-down on a kitchen table: a player who has not looked at the TV correctly says "that one was a collision" from touch alone, and the server's slot log agrees with them.
