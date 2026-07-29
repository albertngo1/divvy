## Overview

A short standing-around game where the compass is a privacy device. Each phone privately holds a secret payload and a private compass sector; the payload only commits while **two or more players are facing that sector at the same moment**. Your own body orientation is your submission button, and it only works with a witness. For 4–5 people in a room with walls worth facing.

## Problem

Anonymity games always fake anonymity in software — a server shuffles, and you trust it. Here anonymity is *physical*: if you're the only person facing the north wall when a north-wall submission lands, everyone in the room saw who you were. Cover isn't a setting, it's a person standing next to you, and getting one costs them their own window.

## How it works

1. **Zero (5s).** Everyone points their phone at the TV and taps. That fixes a per-device heading offset; all sectors are TV-relative, so magnetic weirdness in the room cancels out.
2. **Deal.** Each phone privately shows two things nobody else sees: a **payload** (a one-tap answer to a spicy group prompt on the TV, e.g. "who'd survive longest without their phone") and an **assigned sector** — one of four 90° quadrants: TV wall, back wall, left, right.
3. **The round (75s).** You physically turn and face your quadrant, holding your phone flat. Your phone shows only: your live heading arrow, your target arc, and a **cover light** — lit only when the server sees ≥2 devices bucketed in that same quadrant. Hold in-arc *while covered* for 3 continuous seconds and your payload commits. Your phone never tells you who covered you.
4. **The squeeze.** Assigned sectors differ. Turning to cover someone abandons your own arc, and the clock is shared. The negotiation happens out loud in the middle of the room, in half-sentences, because saying "I need the back wall" tells everyone which submission is about to be yours.

**Host TV** shows: the prompt, a compass rose with an anonymous **count** per quadrant (not dots, not names), a clock, and a commit tally. At the end it reveals the pooled answers — never who committed when.

## Technical approach

Host tab + phone PWAs on PartyKit / Durable Objects over Tailscale Serve. Headings from `deviceorientation` (`webkitCompassHeading` on iOS, `alpha` elsewhere), sampled 10Hz, offset-corrected client-side, sent at 5Hz.

Data model: `Player{id, offsetDeg, sector, payload, committedAt}`, `Room{phase, prompt, window[]}`. The server keeps a 500ms sliding window of headings, buckets them, and is **authoritative** on cover — a phone can't claim it, because a phone claiming cover is the obvious cheat.

The genuinely hard part is **anonymity leaking through continuity**. If the TV animates per-device dots, everyone tracks a person's turn from quadrant to quadrant and the whole premise collapses. So the rose publishes quantized *counts* at 1Hz only, no identity, no trajectories, and commits are reported as a bare incrementing tally with no timestamp precision. Secondary hard part: indoor magnetic distortion — near a fridge or a steel stud, headings swing 30°+. Mitigations: wide 90° sectors, a ±25° tolerance arc, and a mid-round re-zero button.

## v1 scope

- 4 players, one prompt, one 75-second round
- Four fixed quadrants, TV-relative, one zeroing ritual
- Cover threshold = 2 devices, hold = 3s
- TV: prompt, count-only rose, clock, commit tally, end reveal of pooled answers

## Out of scope

Multiple rounds, scoring/leaderboards, 6+ players, variable cover thresholds, traitor roles, mid-round sector reassignment, any voice input.

## Risks & unknowns

- Compass reliability is the whole game; if a test room distorts badly, fall back to "face a labeled printed sign" + coarser buckets.
- Players may just all stand in one quadrant and brute-force it — the differing assigned sectors are the only thing preventing that, and may need a 2-quadrant-max rule.
- 75s may be too generous; tune down until at least one payload fails to commit.

## Done means

Four phones zero to the TV, hold four different private sectors, and light their cover lights only when the server independently confirms a second body in the same quadrant; a payload commits after a 3s covered hold, the TV shows counts that never identify anyone, and a post-round poll of players finds at least one committer nobody could name.
