## Overview
On the Hook is a 4-player, four-minute argument game for a TV plus phones, where speech is metered but the bill goes to somebody else. The server secretly draws a derangement of the players; nothing you say costs you a cent, and everything you say bankrupts a person you cannot identify. For groups who like bickering and want a party game where shutting up is an actual strategy rather than a forfeit.

## Problem
Most "be quiet" games punish the noisemaker, so they degenerate into one loud person losing while everyone else smirks in safety. And enforced-silence games are dull because nothing happens during the silence. We want silence to be *tense*: precious to you, cheap for the person spending it, and impossible to enforce without spending the very thing you are trying to protect.

## How it works
Everyone starts with 100 Air. The host screen posts one Agenda the room must settle **out loud** — "rank these five household chores worst to least-bad and say the final order as a sentence." Landing it pays a 200-point pot, split only among players still solvent at the buzzer.

Voiced audio attributed to player *i* debits σ(i) at 4 Air/second. Talking is therefore a public good and a private, randomized theft.

**Privately on your phone:** your own Air bar draining in real time with no label on the cause; your solvency state; one single-use NAME button listing the other players. **On the host screen:** the Agenda, the pot, the clock, and a four-bar "room health" readout that is *sorted and unlabeled* — the room knows the multiset of balances, never who owns which.

The deduction loop is the game: your bar drops when one specific person speaks. You can feel the correlation, but confirming it means getting them to talk more, and warning anyone costs whoever *you* are on the hook for. Spend your one NAME guess correctly and their debits reroute onto themselves for the rest of the round; guess wrong and you quietly eat a 20 Air fine. Nobody is ever told a guess happened.

Hit zero and your phone goes red: you are out of the split, and from then on your debits bleed the shared pot — so the room suddenly has a reason to shut up on your behalf, without knowing who to shut up.

## Technical approach
One authoritative room per game (PartyKit / Cloudflare Durable Object, or Socket.IO behind Tailscale Serve). Phone PWA opens `getUserMedia` with `autoGainControl`, `noiseSuppression`, and `echoCancellation` all **off** (they destroy cross-device level comparison), runs an AudioWorklet emitting 50 ms frames of `{t, rmsDbfs, voiced}` where `voiced` is a cheap autocorrelation-based periodicity flag. Frames ship as compact binary over WS at 20 Hz.

Data model: `Room{id, phase, deadline, pot, sigma[], agenda}`, `Player{id, air, solvent, nameUsed}`, plus an in-memory ring of the last 2 s of frames per device.

Attribution is the hard part. Every mic hears every person, so the server aligns frames on a per-socket clock offset (rolling median of WS ping half-RTT), then bills a frame to the loudest device only when it beats the second-loudest by ≥6 dB after subtracting that device's calibrated 5-second room baseline. Ambiguous frames are "ambient" and free — deliberately generous, because a false debit feels like cheating. The server owns all Air arithmetic; phones only render. Host gets sorted balances at 4 Hz; each phone gets only its own number.

## v1 scope
- Exactly 4 players, one 4-minute round, one hardcoded Agenda.
- 5-second silent calibration per phone before start.
- One NAME guess each; no chat, no avatars, no rematch flow.
- Host screen: Agenda, clock, pot, 4 sorted anonymous bars.
- Round-end reveal of the full derangement, with a per-second replay of who billed whom.

## Out of scope
Multiple rounds, variable player counts, whisper detection, speaker diarization from a single mic, spectator mode, persistent scores, audio recording or playback of what anyone said.

## Risks & unknowns
Attribution accuracy in a small hard-surfaced room is the whole game; if two people sit shoulder-to-shoulder, the 6 dB gate may never resolve them (mitigation: calibration step warns players to spread out, and the host screen shows a live "can't tell you two apart" pairing warning). Phone mic AGC cannot be fully disabled on some Android builds. Four minutes may be too long for the deduction to stay hot. And the round may collapse into everyone silently refusing to talk — the pot must be big enough that total silence is clearly the losing line.

## Done means
Four phones in one living room, one 4-minute round: every player's Air bar moves only when their hidden debtor speaks (verified against the round-end replay at ≥85% frame accuracy), at least one NAME guess resolves correctly, and the room finishes or fails the Agenda with the pot split computed server-side. Playtesters can articulate, unprompted, why warning someone was expensive.
