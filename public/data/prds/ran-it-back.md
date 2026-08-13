## Overview

A 4-player co-op that steals the rewind mechanic from Braid, Prince of Persia and Life Is Strange and makes it *socially expensive*. The TV plays one 75-second heist. Each phone holds one rewind token. Spend it and the shared screen jumps back eight seconds — but the erased eight seconds are stored, privately and permanently, on your phone alone. Everyone else's memory of it is gone, and the replay comes back **different**.

## Problem

Save-scumming is the most-used and least-designed mechanic in games: you reload, and the game pretends it never happened. Nobody has made the retained knowledge asymmetric. In a room of four, "I saw the timeline you didn't" is a whole social game — and it can't exist on a single passed-around phone.

## How it works

**Ground truth:** the server rolls one hidden 5-symbol vault code at round start. It never changes.

**Shared TV:** a security-camera view of a vault door. Over 75 seconds, glyphs flicker across the keypad — each is a **noisy sample** of the true code: 60% of the time it shows the true symbol in that slot, 40% a neighbor. One pass alone is never enough to be sure.

**Each phone, privately:** a REWIND button (one use), and a growing scrollback of *only the segments you personally erased*, frozen as still frames with timestamps. You can read your ghost timeline; you can never show it. You can only talk.

**The rewind:** press it, the TV snaps back 8 seconds and re-renders that window with **freshly drawn noise** — same hidden truth, new samples. Everyone watches the new version. Only you hold the old one. The clock does not rewind: the 75 seconds keep draining, so every rewind costs the room live footage at the end.

**Endgame:** at 0:00 every phone independently submits its 5-symbol guess. The room scores on *unanimity plus correctness* — all four right is a clean win, a split means someone hoarded or someone lied. The tension is real: your private samples make you the most confident person in the room and the least verifiable.

## Technical approach

Host tab + phone PWAs, PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the authority.

- **Data model:** `Round {truth: string[5], t0, clockEndsAt, rewindsUsed}`, `Segment {id, startT, endT, renderSeed, observedBy: playerId|null}`, `PlayerState {tokenSpent, ghostSegments: SegmentId[]}`. The truth never leaves the server.
- **Sync:** the TV is a dumb renderer driven by a server-authoritative playhead broadcast at 10 Hz plus a `renderSeed` per 8s segment; glyph noise is generated deterministically from `hash(seed, slot, tick)` so host and phones agree without shipping frames. A rewind is a single server event: allocate a new `renderSeed`, assign the outgoing segment's frames to the spender's `ghostSegments`, rebroadcast.
- **Genuinely hard part:** the *contested rewind*. Two players pressing within ~200ms must resolve to one rewind, one owner — first-to-server wins, loser's token is refunded with an explicit "beaten by Ana" toast, because a silently eaten token feels like a bug. Second hard part: the host must snap backward without a visual hiccup that reads as a network stall; use a hard cut plus a deliberate VHS artifact so the rewind is legible as *intentional*.

## v1 scope

- 4 players, one 75-second round, one token each
- 5-symbol code, 6-symbol alphabet, fixed 60% noise
- Ghost scrollback is a flat list of still frames — no scrubbing
- Endgame is four independent submissions and one score line

## Out of scope

Multiple rounds, token economies, a traitor role, rewinding *your own* phone, audio, spectators, difficulty tuning per group size.

## Risks & unknowns

- **Legibility.** "The replay is different" is a hard idea to land in 10 seconds of onboarding. Needs a scripted 15-second tutorial rewind.
- Players may all rewind in the first 20 seconds and squander the mechanic; may need a lockout for the opening window.
- 60% noise may make it solvable by one attentive player with no rewind, killing the trade.

## Done means

Four phones join; a rewind by one player visibly snaps the TV back 8s with re-drawn glyphs; that player's phone — and no other — shows the erased segment's frames; contested double-presses resolve to exactly one owner with a refund toast; the round ends with four submissions scored against a truth no client ever received.
