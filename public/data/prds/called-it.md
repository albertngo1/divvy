## Overview
A fast, sweaty party game for 3–6 people around one TV. The group passively watches a mystery photo resolve from a smeared blur into a crisp image over ~20 seconds. That passive stare becomes a private betting market: each player secretly picks an answer AND secretly decides *when* to lock it, chasing a multiplier that decays as the picture gets obvious.

## Problem
"Watching something reveal" (a slow zoom, a photo loading) is dead time. And group guessing games collapse into whoever-shouts-first. The itch: reward the person who trusted a hunch at 90% blur over the coward who waited until it was undeniable — privately, so nobody can copy your read or your nerve.

## How it works
Host screen (shared): one photo under heavy blur/pixelation that continuously sharpens on a server-owned clock. A shrinking multiplier number ticks down beside it (e.g. 8.0× → 1.1×). No answers, no names — just the image and the falling odds. Suspense theater.

Each phone (PRIVATE): the same wager (everyone antes 100 chips), four candidate answer buttons, and a live **your** multiplier mirroring the server tick. The player taps a candidate to arm it, then taps LOCK to freeze the current multiplier. Crucially, nobody sees who has locked, on what, or when — your smug early lock stays secret until reveal. You may re-arm before locking but each phone locks exactly once.

At full clarity the host names the answer. Payout = wager × multiplier-at-lock if correct, else 0. Locked-early-and-right is the flex; the host shows a leaderboard of each player's lock-clarity and take.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Data model: `Room { photoId, answer, decoys[], phase, startTs }`, `Player { id, chips, armedGuess, lockClarity, lockMultiplier, paid }`. Server owns a monotonic `clarity ∈ [0,1]` advanced from `startTs`; multiplier = f(clarity) (e.g. `1 + 7*(1-clarity)^2`).

Sync strategy: server broadcasts a `tick {clarity, multiplier}` every 100ms; phones render the number from the server tick, and phone blur/host blur are both driven off `clarity` so no client can front-run by reading a locally-ahead animation. On LOCK, phone sends `lock {guess}`; server timestamps against its own clarity — the phone's displayed number is advisory, the server's is authoritative and the source of truth for payout.

Genuinely hard part: a *fair, low-latency* shared clock. A player on lag must not get a stale-clarity bargain. Mitigation: server-timestamps every lock on receipt, clamps to its own clarity, and the ~50ms one-way jitter is small versus the 20s reveal, so it's noise not exploit.

## v1 scope
- 3 players, one round, one photo (4 answer choices, 3 decoys).
- One fixed 20s reveal curve, one multiplier formula.
- Flat 100-chip ante, single lock per phone.
- Host reveal + one leaderboard screen.

## Out of scope
- Parimutuel pot / odds moving with crowd bets.
- Photo packs, categories, difficulty tuning.
- Multi-round matches, persistent bankrolls.
- Custom/uploaded photos, video reveals.

## Risks & unknowns
- Blur may be trivially reversible by a savvy player squinting — need a reveal type that resists early cheese (tile-flip or diffusion-denoise may beat Gaussian blur).
- Latency fairness feels bad if visible; test on real phones over local WiFi.
- Four choices may make it a coin-flip; may need 6.

## Done means
3 phones join a room, watch one photo sharpen on the TV, each privately lock a guess at a different clarity, and the host shows correct payouts = wager × server-recorded multiplier, with early-and-right beating late-and-right.
