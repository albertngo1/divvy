## Overview

Clapper is a silent cooperative game for three phones and a TV. Everyone scrubs the same short clip and must independently stop on the *same moment* — not a moment the game points at, a moment they each decide the others will find most notable. Named for the clapperboard: the room is trying to manufacture a sync point out of nothing.

## Problem

"Pick the same thing" games collapse the instant someone can match by screen position — everyone lands on the obvious middle of the bar and calls it telepathy. Clapper makes screen position a lie, so the only shared coordinate left is the content itself.

## How it works

The canonical clip is 12 seconds, silent, no dialogue, no single dominant event — a busy street corner where about five small things happen (a dog turns, an umbrella opens, a bag drops, a bus door hisses shut, someone waves). Comparable salience is the whole design.

The TV shows the clip looping once at the start, then goes to an abstract sync display and never shows the footage again.

Each phone privately shows a scrubber over **its own** version:
- Player A: normal, frames 0–44
- Player B: horizontally mirrored, frames 8–52
- Player C: desaturated and cool-tinted, frames 15–59

So the same instant sits at a different scrubber percentage on every phone, looks different, and some instants aren't even reachable for some players. Nobody is told any of this. You drag, you look, you commit — one lock per player, revocable until all three are locked.

The TV shows exactly one thing during play: a **sync bar**, an out-of-focus horizontal smear that sharpens as the three currently-hovered canonical timestamps draw together. It never shows a timestamp, a name, or which way anyone should move — only "warmer," continuously, for the room as a whole.

Win: all three locks land within 200ms of the same canonical time. Payoff: the TV plays the clip once more, frozen at the agreed frame, with the three lock marks on a timeline.

## Technical approach

Host tab + phone PWAs + authoritative room server (PartyKit / Durable Object). State: `{roomId, clipId, frames: 60, views: {playerId → {offset, len, filter}}, hover: {playerId → canonicalMs}, locks: {playerId → canonicalMs}, phase}`. Phones send hover at 10Hz, throttled and converted to canonical ms client-side using their assigned offset; server owns view assignment so a phone can't discover another's mapping.

Smooth scrubbing of an `<video>` on mobile Safari is janky — seeking decodes keyframes and stutters. v1 sidesteps it: the clip is a preloaded **60-frame JPEG sprite sequence at 5fps**, scrubbing swaps an `<img>` src from cache, filters are CSS (`scaleX(-1)`, `hue-rotate`, `saturate`). Deterministic, instant, identical across devices.

The genuinely hard part is the sync bar feeling honest: it must respond to *spread among three live hovers* at 10Hz without leaking direction. Server computes `max−min` of canonical hovers, smooths with a short EMA, and broadcasts a single 0–1 focus value at 20Hz to the host only.

## v1 scope

- 3 players, one round, one hardcoded 60-frame clip
- Fixed view assignments (mirror / tint / offsets) baked in
- Sync bar, lock button, 90s clock, reveal timeline
- 4-letter room code join

## Out of scope

Clip library, real video decode, >3 players, multiple rounds, scoring, per-player hints, reconnect.

## Risks & unknowns

Salience may not actually be shared — if one micro-event dominates, the game is trivial; if none does, it's random. Requires hand-tuning the clip. Preloading 60 JPEGs on a phone hotspot may stall the start; needs a real loading gate. Mirroring may read as broken rather than clever.

## Done means

Three phones join, each demonstrably shows a differently mapped and differently filtered scrubber over the same footage, the TV's focus bar tracks true canonical spread at 20Hz, and locking within 200ms of each other triggers the frozen-frame reveal — demonstrated live on three real phones.
