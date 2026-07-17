## Overview
Overlook is a webcam-gaze party game riffing on the arXiv paper *"Divergent Gaze Patterns in Artistic Viewing."* Each day it shows a public-domain painting; you get ten seconds to look at it while your webcam tracks your gaze, and you're rewarded for fixating on the *overlooked* regions — the spots few other players' eyes landed on. It turns the passive act of looking at art into a rarity-hunting competition, for museum nerds, friend groups, and anyone who likes noticing the weird detail in the corner.

## Problem
We scroll past great art without really seeing it; galleries are lean-back. And the paper shows people's eyes cluster on the obvious focal points (faces, centers). What if the game rewarded *not* being basic — finding the strange hand, the hidden skull, the mislaid glove nobody looks at?

## How it works
Daily painting loads full-bleed. Calibrate (click a few dots), then a 10-second reveal with a subtle fixation ring following your gaze. Behind the scenes the canvas is a heatmap grid; your dwell time per cell is recorded. Scoring is inverse to crowd density: land on cells with high aggregate attention and you get little; find low-density cells that *also* contain salient content (edges, high local detail) and you score big — rewarding genuine discovery, not random staring at blank sky. After your turn, the reveal overlays the global heatmap ("87% stared here; you found this") and a leaderboard of who found the rarest real detail. Shareable like Wordle.

## Technical approach
Stack: pure browser — WebGazer.js for gaze estimation, a canvas heatmap, public-domain art from the Met Open Access and Wikimedia Commons APIs. Server (a thin FastAPI + SQLite) stores per-painting aggregate gaze grids: `Painting(id, image_url, date)`, `GazeCell(painting, x, y, weight)`, `Play(user, painting, cells[], score)`. Score = Σ over your fixated cells of `local_saliency(cell) / (1 + crowd_weight(cell))`, where saliency is precomputed with a cheap edge/contrast filter (OpenCV) at load time. The hard part is *gaze accuracy*: WebGazer has ~4° error, so you cannot trust pixel-precise fixations — the design leans on coarse ~40px cells, per-session calibration, and a smoothing window, plus discarding plays where calibration confidence is low.

## v1 scope
- One painting per day from a small curated Met/Wikimedia pool
- Click-dot calibration + 10s tracked reveal
- Inverse-density scoring against the accumulating crowd heatmap
- Post-round heatmap overlay + share card

## Out of scope
- Real-time multiplayer rooms
- Mobile front-camera tuning
- Accessibility path for players who can't use gaze tracking (planned, not v1)

## Risks & unknowns
- Accuracy: if WebGazer is too noisy, scores feel arbitrary — needs a calibration-quality gate and generous cell size.
- Cold start: inverse-density scoring is meaningless until enough people have played a given painting; seed with synthetic saliency until the crowd grid fills.
- Privacy: gaze/webcam is sensitive — all inference stays client-side, only aggregate cell coordinates leave the browser.

## Done means
Two players view the same day's painting; each gets a per-cell gaze trace, the one who fixated a genuinely detailed but low-crowd region scores higher, the global heatmap overlay renders correctly on reveal, and no raw webcam frames ever leave the client.
