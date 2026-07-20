## Overview
Test Audience turns the couch ritual of watching stuff together into a sealed prediction market on your friends' taste. 3–5 players watch the same short reel on the host screen; before each clip resolves, every phone privately bets on which way the *room* will split — and, because you're also secretly one of those votes, calling a 2–1 means knowing you're the swing. It's a bookmaker's game where the odds are your friends' guts.

## Problem
Groups consume clips, trailers, and reels totally passively — a shrug, a "that's cute," scroll on. Everyone privately has an opinion but the collective reaction is a fog until someone breaks the silence and the room herds to their reaction. Test Audience prices that fog before anyone can herd.

## How it works
One round = a reel of 3 micro-clips chosen to split a room (a baby cackling, a bug macro-shot, a soaring drone pass). For each clip:

1. **Watch.** Host plays the ~8s clip. Phones are locked — no input, no peeking.
2. **Bet + React (sealed, simultaneous).** The host shows a binary axis (e.g. DELIGHT vs DISGUST). Each phone PRIVATELY does two things: (a) predicts the room's MAJORITY verdict and wagers 1–3 chips, and (b) casts its own honest gut verdict. The host screen shows only a "4 of 4 locked" counter.
3. **Reveal.** Host shows the split as an anonymous tally ("3 Delight / 1 Disgust") and pays chips to everyone who called the majority. Crucially, WHO voted which way stays hidden — so the payout is public but the lone dissenter is a mystery you argue about.

The private, simultaneous double-action is the whole game: because your own reaction is sealed until reveal, nobody can read the room off faces or gasps — you have to *know* your friends. And knowing you're a vote inside the thing you're pricing makes every near-even call a self-referential gamble.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room{reel[], clipIndex, phase}`, per-clip per-player `{bet:{verdict,chips}, reaction:verdict}` held server-side. Sync strategy: host drives clip playback and emits a `betWindowOpen` event; phones submit sealed payloads; server acks with only a locked-count. When all lock, server computes the majority, pays out, and pushes one reveal. Clip playback lives entirely on the host tab (phones never load media), so sync is just an event fence, not video streaming. Hard part: **enforcing the lockout window** so no reaction or bet leaks before all phones commit, and keeping individual reactions secret through reveal to preserve the deduction layer.

## v1 scope
- 3 players, one reel of 3 hardcoded local clips, one axis (Delight/Disgust).
- Sealed bet + reaction per clip, chip payout on majority calls.
- Anonymous tally reveal; running chip total on host screen.

## Out of scope
- Clip upload / streaming services / licensing.
- Multiple axes, custom reels, sentiment auto-detection (front-camera anything).
- Bankrolls across sessions, matchmaking.

## Risks & unknowns
- With even player counts, ties on the axis need a payout rule (push? split?).
- Curating clips that reliably split a room is content work, not code.
- Does hidden individual reaction add fun deduction, or just feel opaque?

## Done means
Three phones join, watch a host-played clip, and each secretly lock a majority-bet plus an honest reaction; the host reveals an anonymous split and pays chips to correct callers — with no reaction or bet observable before the shared reveal fires.
