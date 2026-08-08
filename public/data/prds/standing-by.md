## Overview

A 3-player cooperative panic game for a living room with a TV and three phones. Spaceteam's DNA — private panels, orders you can only fulfil by yelling — with one new axis bolted on: **time**. Orders aren't "do this now." They're "do this on beat 19." The room has to talk in the future tense.

## Problem

Every Spaceteam descendant is a flood: shout faster, tap faster, win. The only skill is throughput. Nobody in these games ever has to say *"hold that, it's not yet"* — and holding an instruction in your head while three more arrive is a completely different, funnier kind of hard. Verbal scheduling under load is an untouched mechanic.

## How it works

The host TV shows one thing big: a **beat counter**, 1→32 at 60 BPM, plus three anonymous station lamps and a chip rail where results land (GOOD / LATE / EARLY / DROPPED). It never shows any order text.

Each phone privately shows:
- **Your order queue** — 4 cards, revealed on a stagger. Each card: a target station ("BLUE"), an action ("CHOKE THE MANIFOLD"), and a **due beat**. Every card targets someone else. You can never execute your own.
- **Your panel** — 8 chunky controls with adjacent nonsense labels (MANIFOLD, MANIFEST, MANDREL). Only you can touch them.
- A thin pulsing bar, no number. The number lives on the TV, so everyone's head is up and pointed at the same clock.

So: you read "BLUE, choke the manifold, beat 19" — and you have to *time your own mouth*. Say it at beat 6 and Blue is holding it through four more incoming orders. Say it at beat 18 and Blue can't find the control. Actuation counts on due beat ±1; anything else chips LATE or EARLY.

The deck is seeded so that twice per round two orders land on the same beat for the same station. That's unfixable — the room has to *verbally choose a casualty*, out loud, before the beat arrives. Score is orders landed out of 12.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the single authority. Host tab and phones are PWA clients.

Data model: `Room {phase, beat, tempoMs, players[], orders[], chips[]}`; `Order {id, fromPid, toPid, controlId, dueBeat, state}`; `Actuation {pid, controlId, clientTs, serverBeat}`.

The server owns the beat and ticks it; clients never derive it locally. Each client runs a ping-pong offset handshake every 2s (median of last 5 samples, clamped) so the TV's rendered beat and a phone's tap can be placed on the same timeline. Judgement uses server receive-time minus RTT/2.

The genuinely hard part is *perceptual* alignment, not network alignment: the TV must feel like it flips to 19 at the same instant a player's thumb lands. At 60 BPM the ±1 window is a full second wide, which absorbs sub-200ms jitter — the tempo choice **is** the sync strategy. Anything faster and the game becomes a latency test.

No audio pipeline. The voice channel is the room's actual air.

## v1 scope

- Exactly 3 players, one 32-beat round, ~2 minutes total.
- 12 orders, hand-authored deck, one seeded double-booking.
- 8 controls per phone, static labels.
- TV shows beat number, 3 lamps, chip rail, final N/12.
- 4-character room code. No accounts, no reconnect, no lobby.

## Out of scope

Difficulty ramps, tempo changes, 4+ players, generated decks, per-player scoring, sound design beyond a beat tick, rematch flow, spectators.

## Risks & unknowns

- Verbal scheduling may read as *frustrating* rather than funny if the queue depth is even slightly too high — needs playtest tuning of reveal stagger, not code.
- Players may ignore due beats entirely and just spam, which collapses it into Spaceteam. The EARLY chip has to sting enough.
- Reading a beat number off a TV while shouting is a real cognitive load; may need a color-coded "beats remaining" ring instead of digits.

## Done means

Three phones and a TV join by room code. One round runs end to end. A tap on beat 19 for a beat-19 order chips GOOD; the same tap on beat 22 chips LATE. The seeded double-booking fires at least once and the room is observed arguing aloud about which order to sacrifice. Final screen shows N/12.
