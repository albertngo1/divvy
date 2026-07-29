## Overview

A 3-player cooperative real-time game where the room becomes a message pipeline. Players sit in a fixed directed chain; each phone is a one-slot buffer. Cargo enters at the head at an accelerating rate and must reach the tail intact. Transmission is done by *saying the payload out loud*; receipt is done by tapping. Nobody can see anyone else's buffer, so backpressure must be negotiated verbally — the game is literally RTS/CTS handshaking performed by humans.

## Problem

Most voice party games punish overlapping speech. That's a rule bolted on top. Here, the reason you can't all talk at once is structural: your neighbor can only accept one thing, and you have no way of knowing when. The nagging question "are you ready for this yet?" — the thing that actually makes real coordination hard — becomes the whole game.

## How it works

Host TV shows the chain (A → B → C → OUT), a delivered/corrupted/dropped tally, and the intake pressure meter. It never shows anyone's buffer contents or occupancy.

Each phone privately shows: your single buffer slot (a payload word like FOXTROT-SEVEN, or EMPTY), a big CLEAR TO SEND button, and — when incoming — a RECEIVE prompt offering six candidates that all sound alike (FOXTROT-SEVEN, FOXTROT-ELEVEN, OXFORD-SEVEN…). You transmit by speaking your payload to your downstream neighbor; they tap RECEIVE and pick what they heard. Correct pick: clean handoff, your slot empties. Wrong pick: the payload is corrupted and travels onward wrong, only revealed at the tail. Tap while already full: the packet is dropped and both phones buzz.

So the loop is: your downstream neighbor announces "CLEAR!" when their slot empties, you fire immediately, and meanwhile upstream is yelling at you. Head-of-chain intake accelerates until the pipeline stalls.

## Technical approach

Socket.IO or PartyKit; one authoritative room object with `chain[]`, `buffers{playerId: payload|null}`, `intakeRateMs`, `ledger[]`. Only a player's own buffer is ever serialized to their socket. RECEIVE is a server-side CAS: accept iff `buffers[me] === null`, then set to the *chosen* candidate (not the true payload) and clear the sender. Payload sets are generated per round from a confusable-phrase table with controlled edit distance.

The genuinely hard part is not latency but fairness under it: two players can tap in the same tick, and a receiver whose slot cleared 80ms ago on the server but not yet on their screen will feel robbed. Server timestamps are RTT-normalized per client, and any rejected RECEIVE within 250ms of the slot actually clearing is upgraded to a success rather than a drop — generous is correct here.

## v1 scope

- 3 players, fixed chain, one 90-second round
- 10 payloads from a hand-written table of 20 confusable phrases
- One-slot buffers only, no queue depth
- Intake starts at 8s, ramps to 3s
- Host screen: chain diagram, three counters, pressure meter

## Out of scope

Branching topologies, rings, variable buffer sizes, retransmission requests, roles, multi-round scoring, any mic/ASR — receipt is a tap, not speech recognition.

## Risks & unknowns

With three players the middle seat may be the only interesting one. The confusable-phrase table has to be tuned so mishearing happens perhaps one time in six, not constantly. And a chain may just feel like a queue simulator if the accelerating intake doesn't bite hard enough to force people to interrupt each other.

## Done means

Three players run one 90-second round; the tail reports at least one corrupted payload traceable to a specific mid-chain mishearing, at least one drop caused by transmitting into a full buffer, and playtesters spontaneously start announcing "clear" without being told to by the rules card.
