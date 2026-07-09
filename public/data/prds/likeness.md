## Overview
Likeness is a cooperative 3–5 player identikit party game. The shared host TV shows one face being assembled live; each phone privately controls a single facial feature and secretly holds one scrap of description about a mystery person. Together you build a police-sketch portrait blind, then keep the (usually hilarious) poster as a group keepsake. For friends, families, and party groups who want everyone to contribute rather than one confident artist to dominate.

## Problem
Group drawing games either let the best artist take over or collapse into chaos on one shared canvas. There's no gentle, everyone-has-exactly-one-job creative game where the fun is the shared object you make, not who scored highest. Likeness gives each player a single feature and a private secret, so the collaboration itself is the point.

## How it works
The server picks a "target person" defined by 5–6 short trait clues (e.g., "hasn't slept in a week," "would fight a goose," "always cold"). Each player is dealt ONE private clue and assigned ONE feature layer: eyes, brows, nose, mouth, hair/hat, or jaw.
- PRIVATE (phone): your clue text; a feature editor for YOUR layer only — a few sliders (size, angle, spacing, style preset) plus a couple of preset shapes. You see a faint live thumbnail of the whole face but NOT others' clues or which sliders they're touching.
- SHARED (host TV): the composited face updating in real time as everyone tweaks, with feature outlines but no labels of who owns what.
A 3-minute build timer runs. House rule: you can't say your clue verbatim — you express it through your feature. When time ends, the host reveals all clues at once beside the finished face and the group reacts to how well the blind composite "reads." No scores — the face is saved as a shareable poster (the keepsake) with the clues as a caption.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).
Data model: `Room { code, phase, targetClues[], players[] }`; `Player { id, feature, clue, layerState }`, where `layerState` is a small JSON of slider values + preset id.
Sync: each phone emits throttled `layerUpdate` (~10–15 Hz, last-write-wins per layer); the DO fans out the merged render params to the host and a low-detail param set to phones. Rendering is deterministic parametric SVG — each feature is an SVG group driven by the same params, so host (full detail) and phones (faint) render identically with no image streaming.
Genuinely hard part: a multi-layer merge that stays smooth and legible while 5 people drag sliders at once, plus tuning the parametric face system so ANY slider combo still reads as a face. Per-layer LWW + throttling + a fixed anchor grid handle sync; the art system is the real work.

## v1 scope
- 3 players, 3 features (eyes, nose, mouth), one target, one round.
- 5 hardcoded target people, ~4 presets per feature.
- Parametric SVG faces; save-as-PNG poster with clue caption.
- Room-code join, no accounts.

## Out of scope
- Voting/scoring, extra features, custom targets, freehand drawing, app-store build, persistence beyond the poster download.

## Risks & unknowns
- Does a blind composite read as a coherent face or just mush? Needs art-system playtest.
- Slider-only expression may feel too constrained or too loose.
- Host render latency with 5 simultaneous editors.

## Done means
3 phones join a room, each shows a distinct clue and its own feature editor, the host face updates live as all three edit, the timer ends, all clues reveal, and the group can download one PNG poster of the finished face.
