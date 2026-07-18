## Overview
Double Cast is a 3-4 player concurrent-room game about claiming roles in a play without two people wanting the same one. The host screen is the cast list; each phone privately holds that player's ranked wishlist of parts. The room wins when everyone lands a role they actually wanted and nothing gets double-cast.

## Problem
Party games about "pick something" usually reward matching. This one punishes it: your desires are hidden, and the collision comes from two people secretly loving the same part. The itch is reading the room's greed — do I lunge for my dream role now and risk a clash, or quietly take a safe backup nobody's eyeing?

## How it works
The host shows a CAST LIST of 6 roles (Lead, Villain, Comic Relief, Narrator, Ensemble A/B). Each role is OPEN, TAKEN (grey, no name shown), or RUINED (struck through) — that's all the public info.

Each phone PRIVATELY shows that player's ranked wishlist: a Dream role (worth big points), plus two ranked Backups (smaller points), assigned at deal. Different players get different, overlapping wishlists — that overlap is the hidden hazard.

A 30s curtain timer runs. At any moment a player taps a role to CLAIM it:
- If OPEN and only one claim lands → it goes TAKEN for that player. Success.
- If two players claim the SAME open role inside a short window → DOUBLE CAST: collision, the role turns RUINED and locks empty, both claimants get nothing there and eat a time penalty. The public log shows "a role was double-cast" but not who or which rank it was to them.

You each get exactly one role at curtain. The strategy: grabbing your Dream early maximizes points but if someone shares it you both lose it forever; grabbing a Backup is safe but cheap. You infer rivals' tastes only from which roles get sniped or ruined. Room score = sum of the rank-value each player landed; a clean board where all three hit their Dream is the fireworks outcome.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `role{id,status,ownerId}`, `player{wishlist:[{roleId,rank}], claimed}`. The hard part is the same as any collision game: simultaneous claims. The server holds each role's status and, on a CLAIM, buffers for a ~150ms coalescing window; if exactly one distinct claimant → assign, if two+ → RUIN. First-packet-wins is explicitly rejected so the game isn't decided by phone ping. Phones show optimistic "claiming…" but only the server broadcast commits status. Everything else is trivial fan-out.

## v1 scope
- 3 players, 6 hard-coded roles, one fixed wishlist deal with a deliberate Dream-overlap between two players.
- Host cast list with OPEN/TAKEN/RUINED; phone shows private ranked wishlist + tap-to-claim.
- Server coalescing window + double-cast ruin logic.
- End screen reveals every wishlist and the room's total score.

## Out of scope
- >3 players, multiple scenes/acts, capability restrictions on who can play what, re-grabbing after ruin, leaderboards, cosmetics.

## Risks & unknowns
- Collisions may feel like bad luck rather than a read, since preferences are fully hidden — the reveal and repeated play must make the greed legible.
- Balance: if Dream roles rarely overlap, there's no tension; the deal must engineer near-misses.
- The 150ms window tuning under real LAN jitter.

## Done means
Three phones join, each sees a distinct private wishlist, and a round reliably produces both outcomes on demand: a clean board when players spread out, and a RUINED role when two deliberately tap the same part together — with the end screen correctly scoring landed ranks.
