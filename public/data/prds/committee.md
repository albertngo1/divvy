## Overview
A party game for 3-5 co-located players. The room secretly co-authors a single short letter (a thank-you note, an apology, a manifesto) that must read as if one person wrote it. For groups who like social bluffing but want to walk away with something they actually keep. There are no points: you win if the letter is "sealed" — it survives a single-author test — AND you personally aren't fingered as the seam.

## Problem
Collaborative writing games (Quiplash and kin) reward the loudest one-liner and produce disposable output nobody re-reads. Nothing is built around *blending in* — matching a shared voice instead of standing out — and no party game hands you an artifact you'd keep. The itch: make one seamless thing together, while privately sweating that your line sticks out like a bad stitch.

## How it works
The host TV shows a prompt and an empty letter with N numbered slots (N = player count). Each phone is privately assigned ONE slot and shown ONLY the lines adjacent to it — the line above forming in real time, a hint of the line below — never the whole letter. All players type their line simultaneously under a 90s timer.

Phone PRIVATE view: your slot number, your neighbors' adjacent text (streaming as they type), your input field, a soft style hint ("keep it warm"). Host SHARED view: slots flipping to "✔ written" (text hidden), the timer.

When all submit, the host assembles and displays the full letter for the first time. Then the single-author test: each phone privately reads the whole letter and flags the ONE line that "sounds like a different person." Votes are private. If flags scatter (no line gets a majority), the seams held → the letter is SEALED and every phone downloads it as an image keepsake. If one line is majority-flagged, its author is "exposed" on the TV. You win if the letter sealed AND you weren't exposed.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / a Durable Object per room, or Socket.IO over Tailscale Serve). Data model: Room { code, phase: lobby|writing|flagging|reveal, prompt, slots: [{playerId, text, done}], flags: {voterId→slotIndex} }. Players join by scanning a room-code QR on the TV. Sync: the server assigns slots at round start and pushes each phone only its adjacent-slot text, so context updates live as neighbors type (throttled diffs, ~4/s). Writing ends on all-submitted or timer; flagging reveals the full letter to all; votes tally server-side. Genuinely hard part: the live *adjacent-context projection* — each phone receives a filtered slice of neighbors' in-progress text and never the whole doc — plus making the seal/expose tally feel instant and fair. Keepsake export renders the letter to a shareable PNG (html-to-canvas) delivered to every phone.

## v1 scope
- 3-4 players, exactly one round, one prompt (thank-you note).
- One slot per player, adjacent-context-only, 90s timer.
- One flag per phone; simple majority = expose.
- PNG keepsake download on seal.

## Out of scope
- Multiple rounds, prompt packs, cross-round scoring.
- Rich text, styling, images.
- Spectators, reconnection polish, 6+ players.

## Risks & unknowns
- Is "blend in" fun, or do players just write bland filler? The adjacent-context pressure is what should force voice-matching.
- Flagging may reliably nail whoever wrote last/rushed — skill vs. luck.
- At 3 players a majority is easy; N and threshold need tuning for scattered flags.

## Done means
Three phones join via QR, each writes one line seeing only its neighbors, the host assembles the letter, all flag privately, and on a scattered vote every phone downloads the same sealed-letter PNG — with the exposed player shown on the TV when a line is majority-flagged.
