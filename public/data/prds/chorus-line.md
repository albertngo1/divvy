## Overview

A 150-second cooperative shouting game for 4 players, on a shared host screen plus phone PWAs. Every player is simultaneously conducting their own chant and being conscripted into everyone else's. For groups who liked Spaceteam but got tired of one loud person doing all the work.

## Problem

In every voice co-op game, mouths are interchangeable — the only scarce resource is attention, so play collapses onto whoever yells loudest. Nobody has ever made *your literal mouth* a capacity-1 resource that three people are bidding for at the same instant. And cooperative games almost never ask you to *refuse* help. "Exactly N, not at least N" turns teamwork into traffic control.

## How it works

One round, 150 seconds, room goal: land 8 chants.

**Private, on your phone only:** a CALL CARD with three things nobody else can see — a LINE ("BRACE BRACE"), a VOICES count (exactly 2 or exactly 3, *including you*), and a 25-second expiry bar. Below it, one huge TALK button.

**Public, on the TV:** anonymous call chips — one per open call — showing only that somebody, somewhere, needs voices, and how long they have. Never the line. Never the count. Plus a MOUTHS bar showing how many phones are held down right now, which is pure ambient chaos.

The TALK button is push-to-talk: press-to-release is your "voicing" interval. You must actually say the line out loud — that's how anyone learns it — but the button is what the machine reads.

A call lands when, inside a 700ms window, **exactly** VOICES phones are held down and the conductor taps CLAIM during that overlap. One voice too many and the TV flashes CROWDED, the call's timer drops to 60%, and the conductor has to reassemble. Since your thumb can only be in one chorus at a time, joining Ana's chant means being deaf-and-mute to Ben's, whose line you only half-heard anyway.

End of round: chants landed out of 8, and a wall of shame listing who crowded whose call.

## Technical approach

PartyKit Durable Object per room, fully authoritative. Model: `Room{phase, epoch, calls[], players[]}`, `Call{id, ownerId, line, needVoices, expiresAt, state}`, `VoiceEvent{playerId, t0, t1}`.

Phones emit `talk_down` / `talk_up` / `claim` with a client monotonic timestamp. The server maps each client onto a shared timeline using a per-connection offset from a 5-sample ping/pong (Cristian's algorithm), keeping a rolling median offset and a live jitter estimate. A CLAIM at T evaluates `[T-350, T+350]` and counts distinct players whose voicing interval intersects it, with ±120ms grace.

**The hard part is fairness of simultaneity** under mobile wifi jitter and mobile-Safari timer throttling. Mitigations: PTT events are sent immediately *and* replayed in a 1s heartbeat batch, so a dropped packet can't silently void a chorus; if any participating phone's jitter exceeded 150ms in the last 3 seconds the server refuses to judge and shows LINE BUSY (a rejudge) rather than issuing a false negative. Deliberately zero speech recognition — the robustness budget goes entirely into clock sync.

## v1 scope

- Exactly 4 players, one 150s round, goal of 8 chants.
- 12 hand-written LINEs; VOICES drawn from {2, 3} only.
- One open call per player at a time; new card deals on success or expiry.
- Host screen: call chips, MOUTHS bar, chant counter, end-of-round crowding summary.
- 4-letter room code, no accounts, no reconnect (refresh rejoins the same seat).

## Out of scope

Any speech recognition or word verification (humans police whether you actually said it), cross-round scoring, VOICES=4, spectators, sabotage roles, host audio, mobile Safari parity.

## Risks & unknowns

Silent button-mashing trivially fakes a chorus — v1 relies on social policing; a later mic-RMS gate could require real volume while held. Exactly-N may read as punishing rather than funny if crowding happens constantly; the 60% timer haircut is a guess. Phones held aloft get dropped. Screen wake lock is mandatory or PTT dies mid-round.

## Done means

Four phones and a laptop on one wifi: a player who has never seen the game can, inside a single 150s round, land at least one exactly-3 chant they conducted *and* verbally turn away a fourth joiner mid-chant. The end summary correctly names who crowded which call, and on 10 out of 10 spot checks the server's judged overlaps match a video recording of the room to within 200ms.
