## Overview
A browser game for the millions who passively binge forward-facing "cab ride" train videos on YouTube. Highball turns that lean-back viewing into a lean-forward daily contest: you watch a real cab-view clip and must anticipate the railroad the way an engineer does — call the next signal aspect, brake for the upcoming speed board, name the next station — scored against ground truth, with a global daily leaderboard.

## Problem
Cab-ride footage is one of the most-watched ambient genres online, and a one-person train sim just topped Hacker News — people love trains but only consume them. There's no way to *compete* at railfanning, and no low-friction game that rewards the actual skill engineers have: reading the road ahead. Full train sims are a huge time and hardware commitment; there's nothing you can play in 90 seconds on your phone at a signal-reading skill level.

## How it works
Each day serves one curated clip. It plays forward; at scripted moments it freezes a second or two before an event and prompts:
- "Next signal: Clear / Approach / Stop?"
- "Speed restriction ahead — brake now or coast?" (hold to brake)
- "Name the next station / junction."
You answer, the clip resumes and reveals the truth, and you score points for correct + well-timed calls. A combo multiplier rewards streaks. End-of-run gives a Wordle-style shareable card (🟩🟨⬛ per call) and slots you on the daily leaderboard. A "free ride" endless mode strings clips together.

## Technical approach
Stack: static SvelteKit front end, clips embedded via the YouTube IFrame API (no rehosting — we store video IDs + timestamped event annotations only). Content is a JSON puzzle pack per day: `{videoId, events:[{t, type, prompt, answer, options}]}`. Authoring is the real work; a small internal labeling tool lets a human scrub a clip and drop annotated events. To scale later, a computer-vision assist can pre-detect signal-mast bounding boxes and color states (OpenCV/YOLO) and OCR speed/GPS overlays that many railfan channels burn in, proposing events a human confirms. Scoring is deterministic client-side; leaderboard is a tiny serverless KV (Cloudflare Workers + KV) keyed by date. The hard part is trustworthy ground-truth labels and handling channels that later delete videos (fallback pool + graceful skip).

## v1 scope
- One hand-labeled daily clip, ~8 events.
- Signal-aspect and speed-board prompt types only.
- Score + emoji share card.
- Simple date-keyed leaderboard.

## Out of scope
- Automatic CV labeling (manual first).
- Realistic throttle/brake physics.
- User-uploaded clips or licensing deals.

## Risks & unknowns
- YouTube embed/ToS and video deletions.
- Whether casual viewers find signal-reading fun without a tutorial.
- Sourcing enough high-quality, overlay-rich footage.

## Done means
A first-time player loads today's puzzle, understands the prompts without external help, completes an 8-event clip, receives a shareable score card, and appears on a leaderboard shared across two devices.
