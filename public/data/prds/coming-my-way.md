## Overview
A 45-second silent co-op for exactly three people with phones and one shared screen. Three tokens sit on a 12-position ring of icons. The room wins by getting all three tokens onto the same icon at the same time. The catch: your phone renders every token but your own.

## Problem
Every "secretly converge" party game hands you a dial and a target and asks you to hill-climb. Once a group finds the trick (elect an anchor, everyone else chase) the tension dies. The itch here is a coordination problem where you don't even know your own coordinates — where the primary act isn't steering, it's *locating yourself in other people's behavior*.

## How it works
**Private (each phone):** the 12-icon ring with two anonymous dots — the live positions of the other two players. No self-marker, ever. Two controls: ◀ and ▶, one step per tap, 200 ms cooldown. A small readout shows only your **net displacement since the round started** ("+5"), never an absolute position. The two dots keep stable colors for the whole round so you can track a person, but the mapping to real players is scrambled per phone.

**Shared (TV):** a single SPREAD number — the width of the smallest arc containing all three tokens — a 45-second clock, and nothing else. No names, no positions, no trails.

**The turn of the screw:** if a phone goes 4 seconds without a tap, the server drifts it one step in a random direction. Total stillness is not a strategy. So everyone must move, and movement is the only thing that makes you legible: as the other two converge on you, you see two dots homing in on a spot that looks empty. That empty spot is you. Everyone is doing this simultaneously, so the first 20 seconds are pure comedy — three people chasing three ghosts, spread oscillating. The room resolves when players silently discover asymmetry: hold a steady rhythm, let one person be the obviously-moving one, and read the convergence.

**Win:** SPREAD = 0 held for 1.5 continuous seconds.

## Technical approach
Host tab + phone PWAs over an authoritative WebSocket server (PartyKit Durable Object; one object per room code). State: `{players: [{id, pos: 0..11, lastInputAt, dotSlot}], spread, phase}`. Server ticks at 20 Hz and sends a **per-connection filtered snapshot** — this is the whole game, so it cannot be a broadcast: each player's frame omits their own position and re-labels the other two through that player's private permutation. Inputs are `{seq, dir}`; server applies, clamps to cooldown, echoes an ack with your net displacement.

Hard part: leak prevention. Any correlation between your tap and a dot twitching on your own screen destroys the game, so self-state is stripped server-side, never client-side. Second hard part is honest latency — 120 ms of jitter reads as "that person hesitated," which is false signal. Fixed 20 Hz tick with a 100 ms uniform display delay on all dots makes everyone equally late.

## v1 scope
- Exactly 3 players, one room, one 45-second round
- 12 fixed positions, fixed icon set, no themes
- Win/lose + elapsed time on the TV; no scoring, no rematch flow beyond a reload
- 4-second drift nudge, hardcoded
- Phone UI is two buttons and a ring; no animation polish

## Out of scope
More than 3 players, variable ring sizes, 2D grids, spectators, audio, persistent scores, reconnect handling.

## Risks & unknowns
May be unsolvable rather than hard — if three self-blind players can never break symmetry, the round is 45 seconds of noise. Mitigation lever is the drift timer and ring size (8 vs 12). Conversely a group may find a boring metronome protocol on round two. Colorblind-safe dot distinction needed.

## Done means
Three phones on a LAN converge to SPREAD 0 for 1.5 s at least once in five attempts; no phone can ever display or infer its own absolute position from packets it receives; a tester says out loud, unprompted, "wait — is that empty one me?"
