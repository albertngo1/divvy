## Overview

A silent cooperative color-matching game for exactly three people, one TV, and three phones. Every player is secretly assigned a hue. You never see your own hue and you have no control over it — your phone only shows you the *other* two players' colors and gives you the pads that push them around. Everyone is simultaneously a shepherd and a sheep. Four minutes, no talking, one round.

## Problem

Most "match each other" games hand everyone the same feedback bar and the same self-view, so play collapses into three people creeping toward the middle of a gauge they can all read. The phones become numeric keypads. The itch: a convergence game where the *information asymmetry is structural* — where you literally cannot solve your own problem, only someone else's — and where "no talking" is enforced by architecture rather than by house rule.

## How it works

The server deals each player a random hue on the 360° circle, minimum 60° apart. Nobody is told their own.

**Phone (private, and different for every player):** a large neutral-gray card labeled YOU with a "?" where a color should be — this never fills in during play. Below it, two live swatches showing the other two players' *true current hues*, each labeled by name, each with two fat pads: ← COOLER and WARMER →. A press nudges that player 4°, rate-limited to four presses per second. That is the entire interface. You cannot move yourself. You are moved entirely by the other two.

**Host TV (shared):** no color at all during play. A single HARMONY ring whose tightness maps to the maximum pairwise circular distance between the three hues, plus a 90-second countdown. When all three sit within 12° for two continuous seconds, the ring snaps shut, the TV floods with the agreed color, and all three hues replay their trails from their starting positions into the meeting point.

The ring is a *deliberately ambiguous* mirror: knowing the other two hues plus the room's spread pins your own hue to two mirrored candidates, and only the others' nudges resolve which. And because hue is circular there is no canonical average — two players may drag you clockwise while the third hauls you the other way around the wheel. That fight is the game.

## Technical approach

PartyKit / Durable Object room, authoritative. State: `{ roomCode, phase, players: { id, name, hue, connected }, dwellStartedAt }`. Client→server: `{ type: 'nudge', target: playerId, delta: ±4 }`. Server applies a 4/s token bucket per (actor, target), wraps mod 360, recomputes max pairwise circular distance, and broadcasts **per-socket filtered snapshots** — a phone is never sent its own hue, because the first curious player will open devtools. The host socket receives only `spread`.

Sync: 20 Hz tick, phones interpolate swatch fill over 100 ms so drift reads as physical. Optimistic local rendering of your own presses on *their* swatch, reconciled on tick. The genuinely hard part is feel, not throughput: every value on screen is being contested by two people at once, so any latency above ~80 ms reads as "someone is fighting me" — which is charming when real and infuriating when it's just lag. Win detection is server-side with a dwell timer that resets the instant spread exceeds 12°.

## v1 scope

- Exactly 3 players, one round, no scoring, four-letter room code, no lobby.
- Hue only. Fixed thresholds (12°, 2 s dwell, 90 s timer).
- Host screen is a ring, a timer, and the reveal. Nothing else.
- No reconnect, no accounts, no PWA install polish. One rising tone tied to spread.

## Out of scope

Multi-round play, scoring, saturation/lightness axes, 4+ players, teams, a saboteur variant, spectator mode.

## Risks & unknowns

- **It may orbit.** Three averaging controllers each missing their own self-term is not obviously convergent; it may circle forever. Mitigation: the 90 s timer plus a late-game "gravity" assist that shrinks nudge deltas. This is the first thing playtesting must answer.
- Hue-only excludes colorblind players; a same-architecture fallback axis (a dial angle) is a v2 necessity, not a nicety.
- The ambiguity may land as opaque frustration rather than comedy.
- Peeking is asymmetric and delightful: looking at *your own* phone reveals nothing about you; looking at *someone else's* does. Leave it in.

## Done means

Three phones join a code; each shows two labeled swatches and four nudge pads and never its own color. A press moves the named player's swatch on every relevant screen inside 100 ms. The host ring tracks true max pairwise circular distance. When all three hues sit within 12° for two continuous seconds the host snaps to unison and replays all three trails. And: a full capture of one phone's socket traffic contains no field from which that player's own hue can be derived.
