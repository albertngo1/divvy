## Overview
Off Hand is a hidden-role spatial deduction game for 3–5 players. Everyone privately studies the same top-down room diagram on their phone and talks through a shared navigation task aloud. One player — the Off Hand — holds a horizontally MIRRORED copy of that map. The group's job: find whose sense of left/right is flipped.

## Problem
Social deduction almost always hinges on a secret WORD or role. Spatial disagreement is wide open. A mirrored map is a difference you literally cannot catch by glancing at someone's screen — it only surfaces the instant a person speaks a direction. That makes the tell emerge from natural conversation, not from staring.

## How it works
The host TV shows only neutral scaffolding — lobby, the current prompt, a countdown, and the final vote graph. It NEVER shows the map, so there's no shared reference to check against. Each phone privately renders the scene: a top-down room with ~5 labeled objects (door, couch, lamp, plant, safe) plus a start marker. The imposter's phone renders the identical scene mirrored left-to-right — only object POSITIONS flip; label text stays readable.

A 60-second discussion runs. In turn, each player speaks ONE direction to route from the door to the safe ("go left past the couch, then it's on the far wall"). Honest players build a consistent chain; the Off Hand's directions are internally consistent but mirror-reversed, clashing on left/right and clockwise/counter. Then every phone privately votes for the flipped player, and the Off Hand privately guesses whether they got caught. TV reveals both.

Private vs shared: phones hold the divergent maps privately and simultaneously; the TV holds only neutral text.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], sceneId, imposterId, phase}; Scene = JSON list of {label,x,y} in [0,1]. Server pushes the scene as-is to honest phones and x'=1−x to the imposter. Sync is turn-based, so real-time isn't the hard part — a server-driven phase machine (lobby→brief→discuss→vote→reveal) with a broadcast timer suffices. The genuinely hard part is TUNING the scene so the mirror is catchable but not trivial: objects must sit off-center, and the ideal route must cross the midline, or the flip never bites. Also: flip coordinates, not glyphs, so labels stay legible.

## v1 scope
- 3 players
- 1 hand-authored scene
- 1 imposter, always assigned
- 1 discussion timer, spoken-turn prompts
- 1 private vote + reveal on TV
- Win/lose only, no scoring

## Out of scope
Multiple scenes; rotation/other transforms beyond mirror; scoring or streaks; >1 imposter; spectators; on-screen drawing.

## Risks & unknowns
The mirror may be too obvious (reversed directions jump out instantly) or too soft (nobody commits to left/right) — needs playtest tuning. Peeking at neighbors' phones breaks it; mitigate with verbal-only discussion and phones face-down between turns. Label legibility / colorblindness.

## Done means
Three phones join by code; each shows the room map with exactly one mirrored copy; players complete the direction task; everyone votes; the TV correctly reveals the Off Hand and whether the group caught them — one continuous round, no reloads.
