## Overview
Clash is a blind rhythm-filling game for 3-5 players around a TV. Together you must fill one musical measure so every beat-slot has exactly one owner — but each phone taps in private, and same-slot collisions blow up in everyone's face.

## Problem
Rhythm party games are about syncing up. Clash inverts it: the fun is the anti-coordination scramble of a band where landing on the same beat as a bandmate is the mistake. You want to be alone in your slot, and the only way to learn you're not is the crash.

## How it works
The host shows a looping 8-slot measure (a bar of eighth-notes) scrolling left-to-right at ~90 BPM, looping every ~5s for 6 loops, with a metronome tick. Each slot displays FILLED (green), EMPTY (dark), or CLASHED (red flash + discordant clang) — but never WHO filled it.

Each phone privately shows the same scrolling bar and a big TAP pad. Tapping lands your hit in the current slot and plays YOUR assigned instrument (drum/bass/synth) audibly through the host. Your phone privately highlights the slots YOU currently own. The room's shared goal: cover all 8 slots, exactly one owner each, by the final loop. The failure mode: two phones tap the same slot → it CLASHES, clangs, both taps are voided (slot reverts to empty), and a shared 'harmony' meter drops. You can move your tap to a new slot next loop — but so can everyone, and chasing the same empty slot someone else just eyed spawns fresh clashes.

Private per phone: the bar, your owned slots, your instrument, a 'you clashed' ping. Shared: filled/empty/clash state of all 8 slots, harmony meter, the audible mix.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit/DO) over Tailscale Serve. The host owns the master clock and all audio (WebAudio) so every instrument plays from one device in sync. Model: `slots[8] = ownerId | 'clash' | null`, `loopIndex`, `harmony`. Phones send `{tap, slotAtTapTime}` timestamped to the shared clock; the server resolves at each loop boundary — a slot tapped by exactly one player → owned; by ≥2 → clash (void both, ding harmony). The server broadcasts slot-state (no owner identity) to host and phones, plus a private 'your slots' set to each phone. Hard part: a shared low-latency clock so a phone tap maps to the correct slot despite WS jitter (client predicts slot from its local audio clock, server reconciles at loop end), and routing every player's instrument through the host without echo.

## v1 scope
- 3 players, one 8-slot bar, 6 loops at 90 BPM, one round.
- Tap-to-own, loop-boundary clash detection, harmony meter, host audio mix.
- QR join, no accounts.

## Out of scope
- Multiple measures/songs, per-phone audio, swing/velocity, leaderboards, latency compensation beyond basic prediction.

## Risks & unknowns
- WS clock jitter vs. musical timing — is loop-boundary resolution forgiving enough?
- Is the 'move your slot' chaos fun or frustrating across only 6 loops?
- Audio echo when phones sit near the host mic (phones don't listen, host emits — likely fine).

## Done means
3 phones join, tap simultaneously into the scrolling bar, at least one same-slot clash clangs and voids both taps, the room either fills all 8 slots with unique owners before loop 6 (win) or fails, with all audio emitted from the host in time — one round in under 60 seconds.
