## Overview
A 3–5 player betting game for a room that is already sitting in front of a screen. The host tab plays a short clip; the phones turn passive watching into a parimutuel market where every player is a critic who has seen a different piece of the screener and is under embargo — the only sanctioned way to speak is with chips.

## Problem
Watching something together is a zero-agency activity. Existing "bet on the show" apps hand everyone the same information, so the bet is just a trivia guess resolved by luck. Nothing about the group is in play. The interesting thing about a real prediction market is that other people's money is evidence — and that only exists if people know different things.

## How it works
One round is 45 seconds of betting, then 90 seconds of clip.

**Host screen (shared):** the proposition in large type — "Does the man in the blue coat get in the car?" — YES / NO, a countdown, and a live tote board: total chips on each side and the implied payout per chip. Money moves visibly. Names never appear.

**Each phone (private):** your 100 chips, a YES/NO amount slider, and **one still frame** pulled from the back half of the clip. Every player gets a *different* frame. Some are informative (the coat, mid-stride, reaching for a door handle). Some are decoys sampled from before the resolution, or framed to imply the opposite. You are never told which kind you hold.

Bets can be raised but never withdrawn. Table talk is loud and legal — and cheap, because decoys mean "I have a frame of the empty car" costs nothing to say. The board is the only costly signal. Betting big early moves the line against yourself (parimutuel dilutes the winning side); waiting buys information but the pool has already been shaped by whoever was confident.

The clip plays, the prop resolves, the winning side splits the pool proportionally, and the host reveals all five frames side by side so everyone sees who was lied to by their own evidence.

## Technical approach
Host browser tab + phone PWAs + one Cloudflare Durable Object per room (or PartyKit).

`Room { phase, clipId, propId, players[], bets: [{playerId, side, amount, seq}], totals }`. The DO is the single writer: bets are appended with a monotonic `seq`, chips clamped server-side, totals recomputed and broadcast on a 100 ms tick. Frames are delivered per-socket as short-lived signed URLs so the assignment table never reaches a client that shouldn't have it.

The genuinely hard part is normally fill fairness under latency — solved here by design: **parimutuel payout is computed at close, not at bet time**, so a 300 ms round trip changes what you *saw* but never what you *got*. That leaves the real work as tick-accurate board animation (interpolate totals client-side, snap on server frame) and leak-proofing the frame assets.

## v1 scope
- One bundled public-domain clip, one hand-authored proposition, five hand-picked frames.
- Exactly 3 players, one betting round, one payout screen.
- Flat 100 chips each, no carryover, no accounts, no lobby beyond a 4-letter room code.

## Out of scope
- Multiple rounds, a season, chip persistence.
- Any clip the designers didn't hand-annotate. No auto frame extraction.
- In-app chat, emotes, spectators, live TV integration.

## Risks & unknowns
Content is the whole cost: every clip needs a hand-authored prop and a curated frame set, and a frame that's *too* informative collapses the market instantly. Table talk may drive the room to consensus, making the board flat and boring — decoy frames are the mitigation and may not be enough. Reading a still on a phone while a countdown runs may be too much at once.

## Done means
Three phones join by code, each receives a distinct frame no other client can fetch, the host tote board reflects any bet within 250 ms, chips are conserved exactly across the round, and one playtest ends with the odds inverting inside the final ten seconds.
