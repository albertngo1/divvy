## Overview
Constellation is a 3-6 player keepsake game. Each phone is a private patch of night sky. Everyone secretly places a handful of stars, blind to the others; the host TV then reveals the combined sky at once and auto-draws lines into an accidental constellation the group names together. The win condition is the keepsake — a titled, mythologized star chart PNG — not points. For anyone who wants a two-minute collaborative artifact with a real reveal.

## Problem
Collaborative-art party games usually let you see the shared canvas as you go, so people just coordinate out loud and the phones are redundant. The delight here is the *surprise of superposition*: you can only see your own stars while placing, so the final shape is something no single person authored or foresaw. That is only possible with private, simultaneous per-phone state — passing one phone around would expose everyone's stars and destroy the reveal.

## How it works
PRIVATE on each phone: a dark sky canvas. You tap to place 2-3 stars anywhere, and you privately allocate a small shared "brightness budget" across them (a slider per star) — brighter stars will anchor more connection lines. You see only your own stars; the rest of the sky is empty to you. A "lock in" button commits. SHARED on the TV: while placing, only anonymized progress dots ("3 of 4 skies locked"). On the last lock, all stars fade in together across one unified sky, and the host runs an auto-connect (nearest-neighbor / minimum spanning tree weighted by brightness) to draw the constellation lines. The group then collectively types a NAME and a one-line myth into any phone (first submission wins, or a quick vote). The host renders the final star chart — name, myth, everyone's stars glowing — and exports it as the keepsake PNG. No scoreboard.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{phase, budget}; Player{id, stars:[{x,y,brightness}], locked}. Sync is easy and forgiving: phones hold their own star array locally and send only the final committed set on lock — nothing about one player's stars ever reaches another phone until the global reveal, which enforces the blind constraint server-side. The mildly hard part is the auto-connect looking *intentional*: a raw nearest-neighbor graph often looks like noise. Use a brightness-weighted minimum spanning tree plus a pass that prunes crossing edges, so the figure reads as a plausible constellation. Canvas coordinates are normalized 0-1 so all phones and the TV agree regardless of aspect ratio.

## v1 scope
- 3-4 players, one sky, one round
- 2-3 stars each, one brightness slider per star
- MST-based auto-connect, no edge-pruning polish
- Single free-text name + myth, first-submit wins
- Export star-chart PNG

## Out of scope
- Voting/tie-breaks on the name
- Multiple constellations / a growing galaxy across rounds
- Zoom, drag-to-move after placing, animated twinkling

## Risks & unknowns
- Auto-connect may look random rather than constellation-like (core polish risk)
- With too few stars the figure is boring; too many and it's a hairball — needs tuning
- "First-submit-wins" naming could feel unfair with talkative groups
- Little replay value once the novelty of the reveal is spent

## Done means
3 phones join, each privately places stars invisible to the others, and on the final lock the TV reveals one combined sky with connection lines within 1s; the group names it; and a star-chart PNG with the name, myth, and all stars saves to disk.
