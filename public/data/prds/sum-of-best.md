## Overview
A 4-player co-op party game stealing the speedrunner's private hell: pace, choke, and the reset. The room runs a four-segment route against a public target time. The TV shows one clock. Your phone shows the only thing that matters — how far off your own personal best you just went — and shows it to nobody else.

## Problem
Everything dramatic about speedrunning is invisible: the runner knows they're 3 seconds down and the room doesn't. Party games solve this by making everything public, which deletes the drama. Keep the splits private and the room has to *argue* about a truth it cannot see.

## How it works
**Calibrate (25s).** All four phones simultaneously run the same minigame — twelve numbered tiles, tap them in ascending order as they reshuffle, on a fixed seed. That time becomes your **PB**. The TV says only "calibrating." The seed never changes, so memorizing the route is legal and encouraged.

**The run.** Segments fire in order, one player per segment, ~20s each. The active player's phone runs the minigame. The three waiting phones privately guess *ahead or behind* on the runner — scored quietly at the end, so nobody is idle.

When your leg ends, your phone alone shows `+2.1s vs your PB`. The TV shows total elapsed and the target (1:40) — never a split, never a name.

**The reset window (45s, after segment 2).** The room holds exactly one reset token; any phone can slam it. But elapsed time alone is useless — the four legs have wildly different PB lengths, so a big clock could mean one disaster or four small ones. The room must pool self-reports. The lie incentive is built in: a **Sum of Best** award goes to whoever beat their own PB by the most, and a reset wipes every split. Players who are up want to push on; players who choked want the wipe. Nobody can check.

**End.** Under target = the room wins. Then the TV reveals all four deltas at once, side by side, next to who said what.

## Technical approach
Host tab + phone PWAs + a Cloudflare Durable Object per room. Model: `Player{id, segment, pbMs, deltaMs}`, `Run{index, startedAt, segmentTimes[], resetUsed}`, `Guess{playerId, segment, aheadBehind}`.

Timing is server-authoritative but easy — only one player is live at a time. The genuinely hard part is **information containment**. The TV and the three idle phones must feel live while structurally incapable of leaking the runner's progress. Solution: the DO never broadcasts raw state. Each subscriber gets a server-side projection function keyed by role (`viewFor(role, state)`), so a per-segment delta is not merely hidden by CSS — it never enters the TV's socket payload. Second unknown: a single calibration attempt is a noisy PB; v1 takes best-of-two and accepts the remaining noise as part of the joke.

## v1 scope
- Exactly 4 players, one 4-segment route, one minigame type, one fixed seed
- One reset token, maximum two runs per session, then it's over
- TV renders a clock, a target, and a four-dot segment tracker. No sprites, no ghost
- Room code join, no persistence between sessions

## Out of scope
Multiple minigames, longer routes, risky-strat/glitch branches, persistent PBs, leaderboards, spectator mode.

## Risks & unknowns
Dead time is the biggest threat — if the ahead/behind guessing doesn't hold the other three, the game sags. The reset argument may be trivially resolvable if the target is loose; the target needs to sit near the sum of practice times. Honest players may just tell the truth immediately, which is fine once and boring twice.

## Done means
Four phones and a TV complete two full runs including one reset. Inspecting the TV's WebSocket frames shows no per-player delta field at any point before the reveal, and the post-run screen displays all four true deltas beside each player's reported claim.
