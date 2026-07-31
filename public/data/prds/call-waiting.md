## Overview

A frantic four-player switchboard game for a living room: a shared host screen shows a ring of phone lines, and every player's phone is a handset with two lines and exactly one mouth. Facts have to travel around the ring by voice, but only between two people who are *both currently on each other's line*. For groups who already burned out Spaceteam and want a new kind of yelling.

## Problem

Spaceteam and its descendants make everyone shout into one shared broadcast channel. Within ninety seconds the room degenerates into a single loud bus where the loudest player wins and quiet players vanish. But the actual pain of real-time coordination isn't volume — it's *availability*. Nobody has modeled attention as a scarce, switched, device-enforced resource. Call Waiting makes the question "is this person even able to hear me right now?" the whole game.

## How it works

Four players sit in a ring. Each has exactly two LINES: left neighbor and right neighbor. Your phone is a two-tab handset; you tap to put yourself on one line, and you are on exactly one at a time.

**Private, on your phone:** your two line tabs. Each tab holds either a JOB ("get the FUSE COLOR from this line") or a HOLDING ("you know FUSE COLOR = OCHRE; only your *other* line needs it"). Each tab also shows whether that neighbor currently has *you* selected — GREEN if they're on you, HOLD if they're elsewhere. Below that: an eight-item ANSWER PAD where you tap what you just heard.

**Public, on the host screen:** the ring, four cords that light only when a pair is mutually connected, three packet-progress pips, a 3:00 clock, and a red VOID flash when someone transmits into a held line. Contents are never shown.

A fact transfers only if (a) both players are on each other, (b) the sender actually speaks during that alignment window, and (c) the receiver taps the right item. Otherwise your phone plays hold muzak at the listener and your sentence evaporates. The comedy engine: you're mid-secret when your listener flips to HOLD because their *other* neighbor grabbed them, and the only way to get them back is to yell — which is precisely what they cannot receive.

## Technical approach

Data model: `Room {code, seats[4], phase, deadline}`, `Player {id, seat, lineSelection: 'L'|'R', holdings[], needs[]}`, `Packet {id, valueId, holderSeat, targetSeat, hops}`, plus a server-owned line-state grid.

Authoritative Socket.IO (or a Cloudflare Durable Object) over Tailscale Serve. Clients send `{selectLine, seq, clientTs}`. Each phone runs local VAD (Web Audio `AnalyserNode` RMS with hangover) and emits speech-start/stop events; clock offsets come from an NTP-style ping (`offset = ((t1-t0)+(t2-t3))/2`). The server converts everything to its own clock and arms a transfer iff the speech interval overlaps the mutual-alignment interval by ≥250 ms. Host is a dumb subscriber to a 10 Hz state broadcast.

The hard part is the switch race: A selects B at the same instant B selects C. Alignment intervals are computed *only* server-side from a monotonic per-client `seq`; phones render an optimistic "ringing" state and reconcile. Second hard part is VAD inside a room where four people are shouting: capture with `echoCancellation:false, noiseSuppression:false, autoGainControl:false`, calibrate a per-player noise floor during a 3-second silent pre-round, threshold at floor + 12 dB. Cross-talk still leaks, which is why the receiver's tap — not the audio — is the real ack.

## v1 scope

- Exactly 4 players, fixed ring, one 3:00 round.
- 3 packets drawn from one shared deck of 8 candidate values.
- Hold muzak, mutual-line light, answer pad, packet counter, VOID flash.
- Score = packets delivered. Room code in the URL, no accounts, no persistence.

## Out of scope

More than 4 players or arbitrary line graphs; conference calls; call transfer/forwarding; ASR checking of what was actually said; earbud audio routing; reconnect-after-disconnect; cosmetics; multi-round scoring.

## Risks & unknowns

VAD false-positives in a loud room may arm transfers nobody made. Players may ignore the line UI and just shout — mitigated by hold muzak plus visible VOID attribution. iOS Safari needs a user gesture before muzak will autoplay; capture it at join. Old Android clock drift could smear the 250 ms overlap test; re-ping every 15 s.

## Done means

Four people who have never played it complete one 3:00 round: all three packets delivered at least once, every void utterance visibly attributed on the host screen, median select-to-both-phones-lit latency under 200 ms on LAN, and nobody in the playtest asks "wait, whose turn is it?"
