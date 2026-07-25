## Overview

Structure Borne turns your furniture into a network. Four players set their phones face-down on real surfaces — coffee table, couch arm, bookshelf, kitchen counter, floor — and the phones' accelerometers become seismometers. Knocking on a surface is the only way to send a signal, and only phones resting on a structurally connected surface feel it. Each player is secretly paired with one other and must establish a private channel: both phones on the same surface, and nobody else's.

## Problem

Every phone-sensor party game treats the phone as a controller you hold and stare at. The accelerometer's weirdest capability is what happens when you *put the phone down*: it becomes a contact microphone for the building. That means the room's real construction — which table shares a hardwood floor with which, whether the couch is upholstered dead — becomes an undiscovered network topology. Nobody plays the furniture.

## How it works

**Setup.** The server secretly pairs the four players (A–B, C–D). Each phone **privately** shows three things: your CALLSIGN, a three-beat rhythm drawn as dots with distinctive spacing (`• ·· •`); a SET DOWN prompt; and a coupling readout that says only *how many* phones share your surface — "coupled: 2" — never which, and never who your partner is.

**Play (90s).** Put your phone flat somewhere. Knock your callsign on your surface with a knuckle. Every phone on a connected surface feels a matching impulse triplet; airborne knocks arrive far weaker and get filtered out. The server correlates onsets across phones and infers coupling edges.

The **host screen** shows a live anonymized graph: four unlabeled dots with edges appearing and vanishing as people move phones, plus a fat CROSSTALK lamp whenever any surface holds three or more phones. So the room can see the *shape* of the network but not the *labels*; only each phone knows its own callsign, only the server knows the pairing.

You may talk, but you may not speak your callsign or show your screen. So you negotiate by knocking: rap your rhythm and ask "did anybody feel that?" while watching an edge light up on the TV and trying to work out whether it's you. The losing texture is delicious: a coffee table and the floor may be acoustically one node, so two "different" surfaces are secretly the same, and the room refuses to give anyone privacy until someone moves to the counter.

**Win:** exactly two disjoint couples, each on its own surface, held stable for 10 seconds.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Sensing: `DeviceMotionEvent` (`requestPermission` behind a tap on iOS), `accelerationIncludingGravity` at ~60 Hz. High-pass, envelope, then onset detection when the envelope exceeds k× a running median with a 60 ms refractory. Phones send only `{t_local, peak}` onsets — a handful of bytes each.

Clock sync: NTP-style offset and RTT estimation over the socket every 2s, keeping min-RTT samples. Structure-borne propagation across a table is sub-millisecond, so co-onset is effectively simultaneous; the accuracy problem is entirely clock skew and JS timer jitter, and ~10 ms is enough.

Server state: `Room { phase, players[{id, callsign, onsetRing}], pairs, edges, crosstalk }`, recomputing edges every 250 ms over the trailing 4s of onsets. An edge requires two matched triplets (same inter-onset interval ratios within ±40 ms, onsets within a 15 ms window) and decays after 3s of silence — hysteresis, so the graph doesn't strobe.

The genuinely hard part: separating structure-borne knocks from airborne sound and from someone flopping onto the couch, and attributing a triplet when two people knock at once. Mitigation for the latter is the callsign design — each rhythm gets distinct interval ratios so triplets separate by pattern rather than by timing alone, exactly like radio callsigns.

## v1 scope

- Exactly 4 players, one round, two pairs, four fixed callsign rhythms
- One 90s timer, one win/lose end state
- Phone screen: callsign, coupled count, and a "tap your surface twice" sensitivity check
- Host screen: anonymized 4-dot graph, crosstalk lamp, countdown
- No reconnect handling, no scoring, no lobby beyond a room code

## Out of scope

Five-plus players and odd counts, a lone-wolf or saboteur role, multiple rounds and scoring, a mic-based fallback, phones held in hand, surface identification (the server never learns *which* table, only that two phones share one).

## Risks & unknowns

Thick carpet and upholstery may transmit nothing — the sensitivity check has to refuse a dead surface out loud. iOS suspends motion events when the screen locks, so Wake Lock plus screen-up-facing is mandatory, and screen-up conflicts with "face-down," which needs a UX answer. A shared hardwood floor may couple every surface into one node and collapse the game; the triplet pattern match, not bare co-onset, is the defense. Crosstalk detection could feel arbitrary if the threshold is opaque.

## Done means

Four phones, two hard surfaces. Two phones on the same table register an edge for ≥90% of knocks; a phone one couch away registers no edge for ≥90% of the same knocks. A group of four first-timers reaches the two-disjoint-couples win state inside 90 seconds in at least 2 of 3 playtests, with nobody having said their callsign aloud.
