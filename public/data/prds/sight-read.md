## Overview

A 60-second co-op rhythm game for 3–4 players sitting in a ring. Nobody plays a pre-made chart. Your phone's top half is a scrolling lane you must hit; the bottom half is a set of pads where every tap you make plants a note in your **left neighbour's** lane, two bars in the future. You sight-read one person's cruelty while authoring another's.

## Problem

Rhythm games are the purest party genre and the worst party genre: one person plays, everyone else watches. Splitting a chart across phones has been done (each player owns a lane), but the chart is still a fixed asset. The interesting thing about rhythm games is the *editor*, and nobody has made the editor a live, adversarial, blind act.

## How it works

The TV plays one 60-second loop at 100 BPM and owns the clock. On each phone, privately:

- **Your lane** — three columns of notes scrolling down. Tap to hit; ±80ms is Perfect, ±150ms is Okay, past that is a miss.
- **Your pad** — three big buttons. Each tap quantizes to the nearest 1/8 beat and schedules a note in your left neighbour's lane 8 beats later.
- **Your Quota card** — e.g. *"place at least 20 notes, of which 6 are two-column doubles."* Private. If you miss quota, the group score is halved.
- A note counter and a mini ghost-timeline of what you've placed.

You never see the lane you're writing. The quota is what stops you being kind: the group needs 85% accuracy to clear, but you personally must be generating pressure. And because the ring is directed, you can't retaliate against your tormentor — only push the pain one seat further.

The TV shows the beat grid, a shared combo meter, and four accuracy bars. Afterwards it replays each authored chart with its author named, plus "Cruellest Chart" and "Most Humane" awards.

## Technical approach

Host browser tab is audio and clock master (Web Audio, `AudioContext.currentTime`). Phones estimate their offset to host beat-time with NTP-style ping/pong over the WebSocket, median of 11 samples. PartyKit Durable Object holds `{songStart, bpm, players:[{id, leftId, quota, placed, hits, misses}], notes:[{id, targetId, beat, col}]}`.

The **2-bar lookahead is what makes this buildable**: a charter's tap only has to reach the target's phone within ~1.2s, so 60–200ms of jitter is completely invisible. Hit judgment runs locally on the target phone against host beat-time and is sent up for scoring; the server rejects hits outside the window or with impossible timestamps. Notes are pushed only to their target and to the host aggregate — a phone never receives another player's chart.

The genuinely hard part is that audio lives only on the TV while input lives on the phone: players hear the beat from across the room and watch a screen in their hand. Room acoustics (~10ms) are negligible; touch-event latency variance on Android is not.

## v1 scope

- 3 players, one 60s loop, 100 BPM, 3 columns, taps only
- Quota is a single number ("place ≥ 20 notes")
- One 4-tap "tap along" calibration screen
- Group clear/fail, no leaderboard

## Out of scope

Hold notes, multiple songs, per-player difficulty, audio on phones, song selection, more than 4 players, rematch.

## Risks & unknowns

The 2-bar delay may make charting feel disconnected — the ghost-timeline preview is the mitigation and may not be enough. Spam charts could be unplayable; may need a max-notes-per-bar cap. Halving the score for a missed quota may be too harsh to be fun.

## Done means

Three phones and a TV run a 60-second loop where every note in a player's lane provably originated from their right neighbour's pad, quotas pass or visibly fail, and the post-song replay attributes each chart to its author.
