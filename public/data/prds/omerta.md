## Overview
Omerta is a 3-6 player sealed-bid auction where the currency is *held silence*. Each round a prize is up; you privately commit to how long you swear you can stay perfectly quiet, then the room goes silent together and your own phone's mic verifies whether you kept your word.

## Problem
Auctions bid money; silence games measure noise. The theme wants silence itself to be the stakes. Nobody has fused a sealed-bid auction with mic-enforced silence, where over-bidding your own composure is the way you lose.

## How it works
The host TV shows a prize card (a silly title worth points). Each phone PRIVATELY shows a slider to lock a secret bid: "I will hold perfect silence for N seconds" (2-15s), committed simultaneously (commit-reveal so no bid leaks). Then a countdown begins and everyone must go silent NOW. Each phone's own mic (WebAudio RMS) watches ONLY its owner; the instant your sustained RMS crosses your silence threshold, your phone privately records the moment you broke. You win the prize only if you actually held for at least your committed bid AND your bid is the highest among players who successfully held. Break early and you're FOLDED — publicly shown, out for the round. The agony: bid 12s to beat rivals, cough at 10s, and someone's safe 7s bid takes the prize.
Private per phone: your sealed bid, your live held-time, your bust moment. Shared TV: the prize, anonymized dots that dim as players fold, and the winner reveal.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{prize, phase, countdownStart}, Player{bid, threshold, brokeAt|null, heldSeconds}. Phones run an AnalyserNode at ~20Hz RMS; bust detection is local (the owner's phone is authoritative) and reports brokeAt with a server clock offset. Server collects sealed bids at lock, receives brokeAt events as they arrive, and resolves the winner. Sync strategy: commit-reveal for bids; a clock handshake at join for fair timing. The genuinely hard part is crosstalk false-busts — a silent room amplifies a neighbor's cough — mitigated with per-phone calibrated floors, a 150ms sustained-crossing requirement, and hysteresis; near-field owner speech should dominate far-field noise.

## v1 scope
- 3 players, one prize, one round
- Bid slider 2-15s
- Single global countdown
- Own-mic bust with fixed hysteresis + calibrated floor
- Winner = highest successful hold; ties break to earliest lock

## Out of scope
- Multi-round economy, banking/spending silence across rounds, anti-collusion, leaderboards, whisper-allowed variants.

## Risks & unknowns
- Neighbor-cough false busts at table distance.
- Players muffling the mic with a hand to cheat — may need a proximity/again check.
- Whether the sealed-bid tension is legible inside a sub-15s round.

## Done means
Three phones lock hidden bids; on the countdown the first player to make a sound folds within 200ms on their own phone only; a player who stays silent past their bid and holds the top bid is declared winner on the TV; and in a calm room, no phone busts from a neighbor's cough at table distance.
