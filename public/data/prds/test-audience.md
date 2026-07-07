## Overview
Test Audience turns group watch-time into a market on the group itself. Everyone watches the same reel of short clips (trailers, jokes, food shots, cursed ads) on the host TV, but each player privately does two things per clip: cast their own honest gut reaction, and place a hidden bet on what the *room's* majority reaction will be. It's a Keynesian beauty contest wearing a couch — for 3–8 people who think they know their friends' taste.

## Problem
Watching stuff together is the most passive thing a group does; reactions evaporate unremarked. Test Audience makes the crowd the game. You're no longer reacting to the clip — you're betting on how everyone else reacted, which is a completely different, sharper, and funnier problem.

## How it works
The host TV plays clip 1 (8–15s) with a big countdown, then locks input. It is purely the shared stimulus — it never shows anyone's votes.

**Each phone (private, simultaneous):** during and just after the clip, a card appears with two secret inputs — (1) **My reaction**: LOVE / MEH / HATE (your honest take, never revealed individually), and (2) **The room will mostly**: LOVE / MEH / HATE, with a slider to stake 1–5 chips on that call. Both lock on the timer. No phone sees any other phone's inputs.

**Resolve (host TV):** the server computes the true room majority from the honest reactions and reveals only the aggregate ("The room: 5 LOVE, 2 MEH, 1 HATE → LOVE wins"). Every player who bet the majority correctly wins chips scaled by their stake and by how *contrarian-but-right* they were (guessing an upset pays more). The TV shows the running leaderboard; each phone privately shows its own hit/miss and payout.

Per-phone architecture is the whole point: honest reactions must be private and simultaneous so they can't be anchored by seeing others, and bets on the crowd must be hidden so nobody copies. A single passed phone collapses both privacy and simultaneity — there is no game without N devices reacting at once.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{ reel[], clipIdx, phase }`, `Player{ id, reaction, roomGuess, stake, locked, chips }`. Host owns the clip transport and clock; phones subscribe. Phases per clip: PLAY → INPUT(timer) → LOCK → RESOLVE → SCORE. Sync needs are light except one genuinely hard part: **synchronizing the input window to the clip** across phones with variable latency — solve by driving the countdown from a server timestamp (`inputClosesAt`) and having phones render against it, not from local clip playback. Media is host-owned (local files/YouTube embed); phones stay media-free to dodge device-audio drift. Payout: majority tally + a contrarian multiplier (payout ∝ stake × (1 / share of winning side)).

## v1 scope
- 3 players + host laptop, one hardcoded reel of 3 clips.
- Two hidden inputs per clip; 20s input window driven by server clock.
- Fixed chip start (10), majority resolve, contrarian multiplier, running leaderboard.
- 4-letter room code, no accounts.

## Out of scope
- Uploading/curating your own reel; long clips.
- Ties/abstentions beyond a simple majority rule.
- Per-player reaction reveal, streaks, multi-game persistence.

## Risks & unknowns
- Ties in a 3-player room make "majority" fragile — need a defined tiebreak (e.g. MEH loses ties).
- Honesty: players may cast a reaction to manipulate the payout rather than react truthfully; small stakes and hidden reactions blunt this.
- Clip timing/latency across phones is the make-or-break sync detail.

## Done means
Three phones join via code; the host plays a 3-clip reel; for each clip every phone privately locks an honest reaction and a staked bet on the room's majority within a server-timed window; the TV reveals only the aggregate and pays out with a contrarian bonus; a leaderboard names a winner — with no phone ever exposing another's reaction or bet.
