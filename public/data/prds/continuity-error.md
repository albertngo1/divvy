## Overview
Continuity Error is a cooperative real-time party game for 3-4 players with a shared host screen (the "editing bay") and each phone as a private monitor. Players are film script supervisors; each phone shows a slightly DIFFERENT take of the same animated scene, and the team must catch continuity errors by talking — no phone can see another's take.

## Problem
Spot-the-difference is usually solitary and static. The itch here is turning it into a live, verbal, coordinated hunt: because each player sees a different variant, the information only exists in the room's conversation, and errors appear and vanish so you can't leisurely scan — you have to narrate and align in real time.

## How it works
The host screen (shared) shows a neutral wide shot of a looping scene (a diner counter: mug, clock, hat, neon sign) plus the score and a countdown. Each phone PRIVATELY renders the SAME scene but with its own set of small mutations — the clock reads a different time, the mug is on the wrong side, the neon flickers a different color. Some mutations are unique to one phone; the scored ones are shared logical regions that differ across phones.

A continuity error only counts when TWO different phones independently tap the same logical region (e.g. "the CLOCK") within a shared ~2.5s window. So you can't just tap what looks off on your own screen — you must say it ("top-left, the clock — mine says 3:10!"), get a teammate to confirm it looks wrong on theirs too, and both point at once. Elements animate and swap on a slow tick, so unconfirmed errors expire. Win = confirm N errors before the timer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Round{ regions:[{id, bbox, phoneVariants:{playerId: variantState}}], confirmed:Set, tick }`. Each phone is dealt a `variantMap` at round start; taps send `{regionId, ts}` resolved on the phone from tap coordinates to a logical region id (each phone knows its own layout). Server correlates: a region is CONFIRMED when ≥2 distinct players submit its id within the window. Sync: server drives the animation tick and broadcasts confirm/expire events; phones render locally.

The genuinely hard part is the cross-phone coordinate/identity mapping plus window fairness: because phones show different images, a tap must resolve to a SHARED logical region id, not raw pixels, and the ≥2-within-window rule must feel responsive without rewarding blind spam. Region ids and hit-boxes must be authored so "the clock" is unambiguous by voice.

## v1 scope
- 1 round, 60s, 3 players, one scene with ~5 shared regions.
- Per-phone variant maps generated from one base scene.
- Two-phone confirm within 2.5s; slow swap tick.
- Score + win/lose screen.

## Out of scope
- Multiple scenes, difficulty tiers, art beyond simple shapes.
- Anti-spam scoring beyond distinct-player rule.
- Reconnect / spectator polish.

## Risks & unknowns
- Could degrade into lucky double-taps rather than real verbal alignment — needs enough regions and short windows to force talk.
- Authoring unambiguous named regions is real design work.
- Is 3 players enough for the confirm mechanic to sing, or does it want 4?

## Done means
Three phones on a LAN show visibly different takes of one scene; the team can only score by naming a region aloud and two players tapping it within the window, and tapping your own screen's oddity alone never scores — proving the voice-alignment loop is load-bearing.
