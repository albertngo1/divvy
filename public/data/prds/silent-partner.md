## Overview

A 3-5 player, one-round, ~4-minute concurrent-room game for people who like a co-op task poisoned by private incentives. The room must solve a shared puzzle that *requires* talking, while every player is secretly paid for the silence of exactly one other player. Nobody knows who is assigned to them.

## Problem

Silence games usually punish the speaker. That collapses into everyone whispering, which is quiet and boring. The itch: make speech socially *necessary* and privately *expensive to someone else*, so the room argues about whether to talk at all — and can never say why.

## How it works

The host TV shows a **Ledger**: five blanks, each needing two facts. Facts are dealt privately, two per phone, and no blank's two facts ever sit on the same phone — so the room cannot solve it without speaking aloud. Every solved blank pays the whole room.

Before the round, the server deals a **derangement**: each player is assigned a **Ward** (a different player; nobody wards themselves; the cycle is secret). Your phone privately shows: your two facts, your Ward's name, and a live meter of *your Ward's voice only*. You earn +1 per second your Ward is silent, and pay −0.4 per second you yourself speak.

So you want the room loud and your Ward mute — and if you ever tell your Ward to shut up, you've named them, and they can spite-talk you into the floor at almost no cost to themselves. The only legal broadcast is the **Flag**: any phone may tap it, and the TV flashes an anonymous red bar for 5 seconds meaning "someone here needs quiet." No name, no direction.

The TV shows only: the Ledger, the room's live noise bar, and Flags. It never shows the ward graph, per-player meters, or scores until the reveal, where the whole cycle is drawn as a ring and everyone sees who was starving whom.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as the authority. Each phone runs an AudioWorklet computing A-weighted RMS and a voiced-frame flag (energy × zero-crossing-rate gate) at 20 Hz, streaming 2 bytes per frame over WebSocket. No audio ever leaves the device.

Data model: `Room{ledger, blanks[], flags[]}`, `Player{id, facts[2], wardId, gainOffset, spokeMs, wardSilentMs}`.

The genuinely hard part is **attribution under cross-talk**: five phones on one table all hear the same voice. Fix with a 5-second calibration (each player says their name; server stores per-device gain offsets), then argmax over the offset-corrected 250 ms energy window, requiring a 3 dB lead and 300 ms dwell before switching the "speaker" token — hysteresis stops score flicker mid-sentence. Ward meters are derived server-side from that single arbitrated token, so two phones never disagree about who spoke.

## v1 scope

- Exactly 3 players (a 3-cycle is the only derangement — no dealing logic needed)
- One 4-minute round, one 5-blank Ledger, one hand-authored fact deck
- Flag button, no cooldown
- Reveal screen: ward ring + three score bars

## Out of scope

Multiple rounds, transcripts, ASR, mid-round ward swaps, spectators, any scoring beyond seconds.

## Risks & unknowns

Gain calibration drifts if people move. Two people talking at once may split credit unfairly. Biggest design risk: the room discovers a total-silence equilibrium and the Ledger goes unsolved — mitigated by making the co-op pot per blank larger than any plausible ward payout.

## Done means

Three phones, one TV, one round: each phone privately shows a different Ward meter, the arbitrated speaker token matches the actual talker in ≥85% of hand-checked 1-second samples, and the reveal ring correctly renders who wanted whom quiet.
