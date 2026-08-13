## Overview

Three players, one repeating four-beat bar at 60 BPM, one minute. Each phone privately holds a single rule constraining where voices may and may not appear in the bar. The room must produce one bar that satisfies all three rules, three times running. Coordination and gameplay are the same physical act, and that act is making noise.

## Problem

Most silence games meter *how much* you talk. None of them care *when*. Timing turns silence from a tax into a shape — and a shape can be composed, deduced, and grooved into. The itch: get a room to arrive at a wordless rhythmic pattern by pure inference, with no one ever being allowed to say what they need.

## How it works

**Host screen:** a 4-beat bar with a click track, looping. After each bar it appends a row to a growing truth table: the measured voice-count per beat (`0 · 2 · 1 · 0`) and a verdict — PASS, or FAIL with the *number* of rules violated, never which ones. Ten bars in, the TV is a legible deduction board of everything the room has tried.

**Each phone, privately:** your one rule, in plain words. Examples from the fixed v1 deck of eight: *"Beat 2 must be completely silent."* *"Exactly one voice in beat 1."* *"I must be the only voice in beat 4."* *"Beats 3 and 4 must have equal voice counts."* Plus one single-use STRIPE token: publicly mark one beat on the TV as "keep this empty" for one bar — the only non-verbal channel in the game.

**The bind:** a bar is four seconds. A sentence covers all four beats and fails nearly everything. So the room compresses to grunts placed on specific beats, reads the histogram rows, and infers. Win condition: three consecutive PASS bars within fifteen bars. The payoff is that winning *sounds* like a groove.

## Technical approach

Authoritative metronome in a Cloudflare Durable Object. Clock sync first: each phone runs 20 ping-pong rounds at join to estimate offset and one-way delay, then timestamps its own voicing events in server time. Phones run the same AudioWorklet voicing gate as any mic-gated Divvy title and emit 20 ms voiced/unvoiced frames with corrected timestamps; the server bins frames into beats.

The genuinely hard part is boundary honesty. A grunt straddling beats 2 and 3 must land somewhere, and a wrong bin makes the verdict feel arbitrary. Mitigations: a ±60 ms guard band assigning to the nearest beat centre, and — more importantly — publishing the *measured* histogram on the TV every bar. The room may disagree with the machine, but it can always see exactly what the machine believed, which is what keeps a fail from feeling like a lie. Cross-bleed attribution is argmax-with-margin; two simultaneous voices only count as two when both clear the floor independently.

## v1 scope

- 3 players, one 60-second session, 60 BPM, 4 beats, 15 bars
- Fixed deck of 8 rules; v1 only deals pre-verified satisfiable triples
- Verdict = PASS / FAIL(n), one STRIPE token per phone
- Rules revealed on the TV at the end, win or lose

## Out of scope

Tempo changes, more than four beats, scoring, rule drafting, rematch, spectators, reconnection, any speech recognition.

## Risks & unknowns

Phone rhythm precision across Android devices may be worse than the guard band. Rule sets can be technically satisfiable but socially undiscoverable in 15 bars — needs playtesting to tune the deck. Boundary disputes are the main fun-killer. Mic bleed between phones held close together may inflate voice counts.

## Done means

Three phones and a TV: the histogram matches human-audible ground truth for ten consecutive bars; the room reaches three straight PASS bars at least once in five test sessions; using a STRIPE visibly annotates the host bar for exactly one loop; all three rules print on the TV at the end.
