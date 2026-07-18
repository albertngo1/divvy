## Overview
Cheap Seats is a 3-6 player live micro-betting game that turns passively watching a clip into an information race. The host TV plays a short silent clip — but heavily blurred, so the room can't just eyeball the outcome. Each phone shows a private, *sharp* crop of a different region of the same synced frame. Your edge comes from what your seat reveals. For groups who'd normally just watch a video and shrug.

## Problem
Watching a clip together is passive; "guess what happens" games collapse the instant everyone sees the same thing. Cheap Seats fragments the view so no one has the whole picture, making a genuine market out of partial private information.

## How it works
The **host TV** plays an 8-second silent looping clip with a resolvable outcome (a ball rolling toward a cup, a soufflé in an oven, a magician's cup shuffle) — rendered **blurred/pixelated** so the room sees motion but not detail. A live bet timer and, later, the clean replay + payouts live here.

Each **phone** is a private window: the server assigns every player a **different crop-rect** of the same clip, rendered *sharp*. One seat sees the tilt of the table; another sees the wind flag; another sees the magician's off-hand. Under a ~10s depleting timer, each player privately splits a bankroll across the outcomes ("cup A / B / C / misses"). Bets are simultaneous, hidden, and lock when your timer hits zero. You may talk — or bluff about what your crop shows.

On reveal, the TV drops the blur, plays the clip clean, and settles chips. The fun: your crop gives real signal, but only a sliver — do you trust it, share it, or lie?

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). To avoid streaming video per-phone, **every client preloads the same small clip file**; each phone just CSS-transforms it to its assigned crop-rect. **Sync:** the server broadcasts a shared playback clock (start timestamp + loop period); clients seek to `(<now> - start) % duration` and correct drift each loop. **Data model:** `Room{clipId, phase, startAt, cropRects{playerId→rect}, outcomes[]}`, `Player{id, bankroll, bets{}, lockedAt}`. **Hard part:** sub-100ms playback sync across heterogeneous phones so crops stay frame-aligned with the TV, plus authoritative bet-locking at timer expiry.

## v1 scope
- Exactly 3 players, one hand-authored clip with 3 outcomes, one betting round.
- Static per-player crop-rects, single bankroll, single reveal with chip payouts.
- Blur on TV via a canvas filter.

## Out of scope
- Clip library / upload, multi-round bankroll carryover, live odds, spectator seats, audio.

## Risks & unknowns
- Playback sync drift could misalign crops and break trust in the signal.
- Crops must be authored so each genuinely carries *some* unique, load-bearing intel.
- Blur strength: too weak and the TV gives it away; too strong and it's frustrating.

## Done means
3 phones each show a distinct sharp crop synced to a blurred TV clip, all three lock blind bets before the timer expires, and the clean reveal settles chips correctly against the true outcome.
