## Overview
Zoetrope is a 3–5 player concurrent-room party game where the group blindly co-animates a single short looping GIF. The shared host screen (TV/laptop) is the projector and gallery; each phone is a private drawing cel. The win condition is not points — it's the finished, exportable looping animation everyone screenshots and keeps.

## Problem
Collaborative drawing games (exquisite corpse) live in *space*; almost nothing lets a casual group make *motion* together. Motion is exactly where the funny discontinuities live — a hand that teleports, a smile that flickers. The itch: make an animated keepsake in 90 seconds without anyone being able to over-coordinate it into something coherent and boring.

## How it works
The host picks a 6-frame loop and a one-line premise ("a stick figure does a backflip"). Frames are dealt to players in loop order (frame 1→player A, frame 2→player B, …, wrapping so everyone owns at least one). Everyone draws **simultaneously** on a 60-second timer.

PRIVATE on each phone: a blank canvas for *your* frame, plus a faint onion-skin ghost of **only the single frame immediately before yours** (pushed by the server), and a secret micro-nudge for your frame only (e.g. "exaggerate the motion" / "add one wrong limb"). You never see the whole loop, the frames after you, or what anyone else is currently drawing.

SHARED on the host: a countdown, anonymous "3 of 5 committed" progress dots, then — on reveal — the frames played back as a fast loop, wobble and all. The host exports it as a GIF/APNG; every phone gets a download link. No scoreboard, no winner.

## Technical approach
Host browser tab + phone PWA clients + one authoritative WebSocket room (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ id, frameCount, premise, players[], assignments{frameIdx→playerId}, frames{frameIdx→strokeList}, phase }`. Canvas is captured as vector strokes (arrays of points) not bitmaps, so a frame is a few KB. Sync strategy: on `commit`, a player's strokes are stored server-side; the server pushes *only* the committed frame N-1's strokes to the owner of frame N as onion-skin (privacy is enforced server-side — the ghost never contains any other frame). The genuinely hard part is the reveal: the host must rasterize all vector frames to a uniform canvas and assemble a loop deterministically; timing jitter and mixed device pixel ratios can misalign frames, so the server normalizes coordinates to a fixed 0–1000 space and the host renders at one resolution.

## v1 scope
- 3 players, 3 frames, one premise, one round.
- Fixed 512×512 canvas, single black brush, undo only.
- Onion-skin = previous frame at 20% opacity.
- Export a 3-frame looping GIF at ~4fps.

## Out of scope
- Color, layers, brush sizes.
- Multiple rounds / rooms / accounts.
- Audio, sound effects.
- More than one onion-skin frame.

## Risks & unknowns
- Onion-skin might let players make it *too* coherent — tune opacity / hide it after first stroke.
- 60s may be too short to draw anything legible; playtest the timer.
- GIF assembly across devices is the fragile bit.

## Done means
Three phones each draw a blind frame, the host plays the assembled loop on the TV, and every player can download the same looping GIF keepsake — with no score shown anywhere.
