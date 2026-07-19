## Overview
Overdub is a 3–5 player concurrent-room game themed on ADR 'loop group' recording. A silent film plays on the host; each player must slot their own lines into the soundtrack, but the microphone booth holds exactly one voice at a time. Two people performing simultaneously ruins both takes — coordination is the failure.

## Problem
Rhythm/karaoke party games reward being together on the beat. The itch here is the opposite: a single shared 'on-air' resource that everyone needs at different, private moments, with no shared conductor. You must weave into the gaps, sensing pile-ups by ear rather than seeing anyone else's schedule.

## How it works
Host TV plays a ~40-second silent scene with speech bubbles appearing over characters at scripted times, plus a shared 'ON AIR' bar that glows clean-green for one voice and muddy-red the instant two overlap.

Each phone PRIVATELY shows a scrolling cue lane of only THAT player's lines: each cue is a colored block with a soft due-window (e.g. 'deliver within these 3 seconds') and a fixed duration (how long you must hold TALK). Players see their own upcoming cues and nothing about anyone else's timeline. You choose exactly WHEN inside your window to press-and-hold TALK for the line's duration.

Collision rule: while you hold TALK, if anyone else is also holding, the ON-AIR bar goes red, a garbled-audio sting plays, and every overlapping line that tick is marked BLOWN (must be re-attempted if its window still has room). A line delivered with zero overlap for its full duration is banked. Win: all lines across all players banked before the reel ends. The tension: your windows overlap with others' invisible windows, so you must stagger — start late, bail early, or gamble on a gap.

## Technical approach
Host + phone PWAs + authoritative WebSocket server. Data model: `{reelSeed, t, cues:[{id, playerId, startWin, endWin, durMs, state}], airHolders:Set<playerId>}`. Reel time is a server clock broadcast at 10Hz; phones locally interpolate for smooth cue scrolling. Phones send TALK-down/TALK-up events; the server is sole authority on the `airHolders` set and stamps any overlap as BLOWN, echoing per-line state + the ON-AIR color to all clients. The hard part is fair overlap adjudication under network jitter: use server-received timestamps with a small guard band, and reconcile each phone's optimistic 'I'm on air' glow against the authoritative verdict. No microphone needed in v1 — the host synthesizes/pre-plays the clean line audio on a successful hold, so 'muddiness' is purely a timing collision, not real audio mixing.

## v1 scope
- 3 players, ~6 lines total across a single 40-second reel, one scene.
- Press-and-hold TALK, fixed line durations, soft windows.
- Host shows film + ON-AIR bar + banked/blown tally, ends in pass/fail.

## Out of scope
- Real microphone capture or audio mixing, scoring beyond pass/fail.
- Multiple reels, difficulty curves, re-record penalties, cosmetics.

## Risks & unknowns
- Network jitter could blow legitimately-staggered holds; guard-band tuning is critical.
- If windows barely overlap, there's no tension; if they overlap too much, it's unsolvable — instance design is load-bearing.
- 'Hold a button precisely' may feel thin without haptic/audio confirmation of your own take.

## Done means
Three phones each show a distinct private cue lane, the server flips ON-AIR to muddy-red within ~150ms whenever two holds overlap and banks any clean full-duration line, and a test group can both fail a reel by colliding and win one by silently staggering their held lines into each other's gaps.
