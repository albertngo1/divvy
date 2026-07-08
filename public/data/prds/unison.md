## Overview
Unison is a cooperative audio-convergence game for 3–5 players sharing a TV/laptop (the only speaker) with each phone as a private step sequencer. No talking. Everyone programs a short loop, hears them all layered together, and must silently converge on ONE identical pattern by ear.

## Problem
Rhythm party games hand you a beat to copy. The itch here is inverse: nobody is given the beat — the room must *agree* on one from nothing, using only what they hear in the shared mix. It's blind consensus where your instrument is private but the sound is communal, which is impossible with a single passed phone.

## How it works
The host loops one bar of 4 steps at a fixed tempo and is the sole audio source. Each phone PRIVATELY shows a 4-pad grid (4 steps × 1 sound); a player toggles pads to author their own pattern — a 4-bit mask — seeing only their own grid. The host plays every player's pattern superimposed on a shared clock. When patterns differ, you hear extra, off-consensus hits; when they align, the same notes stack and reinforce into one crisp loop.

The host screen shows only an abstract 'tightness' meter and a pulsing bar cursor — never anyone's grid. Each phone shows its own pattern plus a single room 'sync' number, nothing about who plays what. So players listen: 'there's a stray hit on step 3 — is that me?' They mute and add pads to shed notes they didn't intend, steering blindly toward the emergent groove until the mix is a single clean four-on-the-floor everyone is independently playing.

## Technical approach
Host browser tab (WebAudio, authoritative transport clock) + phone PWAs + WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{tempo, barLen:4, players[]}`, `Pattern{playerId, mask:[b0..b3]}`. Phones send only their 4-bit mask on every toggle (tiny payloads). The host schedules all active steps per bar via WebAudio's lookahead scheduler on its own clock, so per-phone network latency never affects audio — masks just update which samples fire next bar. Convergence metric = agreement across masks (e.g., 1 − normalized Hamming spread) → tightness meter + sync %. The genuinely hard part is quantization-to-bar so a mask edit lands cleanly on the next loop and the reinforcement is audible, plus keeping feedback ear-first (resisting the urge to show a green/red 'shared pad' hint that would trivialize it).

## v1 scope
- 3 players, 4 steps, ONE shared sound (a single kick sample).
- One continuous free-run session with a 90-second timer.
- Host: tightness meter + bar cursor only; phones: own 4-pad grid + sync number.
- End state: fires when all masks identical for 4 straight bars.

## Out of scope
- Multiple sounds/tracks, tempo control, swing.
- Longer bars, per-player mixing, headphone monitoring.
- Any visual reveal of others' patterns.

## Risks & unknowns
- Can players actually attribute a stray hit to themselves by ear with 3 phones? May need very distinct/quiet mixing or a metronome click.
- 16 possible masks might converge too fast; step count and player count need tuning.
- Room acoustics and a weak laptop speaker could muddy the mix.

## Done means
Three phones on a LAN each toggle a private 4-pad grid; the host plays all masks on one clock, a tightness meter rises as masks agree, and the session auto-completes when all three patterns match for four consecutive bars.
