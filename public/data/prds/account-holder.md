## Overview

A four-player cooperative improv panic game in the Devils & the Details lineage. The TV is a phone call: a synthetic support agent asks six questions out loud, a transcript scrolls, and a suspicion meter climbs. The four players are collectively one caller. No one player knows enough to get through the call, and only one phone is connected to the line at any instant.

## Problem

"Everyone shouts fragments" games all put the fragments in *parallel* — shout them and the puzzle resolves. Real coordination pain is *serial*: one channel, one voice, and a handoff that is audible to the other side. That specific comedy — covering for a seam in real time — hasn't been built.

## How it works

The agent asks: "Can I get the last four on the account?" That fact is in somebody's pocket, and probably not in the pocket of whoever currently holds the line.

The **host screen** (shared): the agent's spoken questions, the live transcript of what the room actually said, a colored bar showing which player is on the line right now, a hold timer, and the suspicion meter.

**Each phone** (private): one or two facts about the account (last four, the date of the disputed charge, the security-question answer, the billing address), plus one secret constraint — "never say the word refund," "do not admit anyone else lives at this address" — and a big HOLD-TO-SPEAK button. Grabbing the button takes the line from whoever had it, immediately.

Suspicion rises from: dead air over four seconds; two players grabbing within 500 ms of each other (crosstalk); a wrong or contradicted fact; and a **speaker change mid-utterance** — which the server knows for free, because it knows which phone the mic stream came from. So the room learns to stall verbally, hand off cleanly between sentences, and paper over the seams out loud: "—sorry, that's my husband, one second."

## Technical approach

PartyKit Durable Object holds the call state machine: `{callStep, lineOwner, suspicion, facts: {playerId: [fact]}, constraints, transcript[]}`. Line ownership is a single authoritative CAS on the DO — sub-200 ms, last-grab-wins, with a grab log used to score crosstalk.

Agent lines are pre-rendered TTS clips played by the host tab. Only the phone that currently owns the line opens an audio stream; the server runs one streaming ASR session at a time (Whisper over WebSocket via Tailscale Serve), which is cheap precisely because the one-line constraint is the game.

The hard part is latency shape, not throughput: ASR endpointing lands ~700 ms after speech ends, so the agent must run on a fixed script clock rather than waiting for a confident final transcript, or it feels broken. Fact checking in v1 is substring matching against the six expected answers — no LLM in the loop.

## v1 scope

- Exactly 4 players, one scripted six-question call, one round
- Facts and constraints dealt from a single hand-written deck
- Suspicion from four sources only: dead air, crosstalk, wrong fact, speaker change mid-utterance
- Win = all six questions answered with suspicion under 60
- Chrome/Android phones; host is a laptop tab

## Out of scope

An LLM-driven agent that improvises, hold-music minigames, multiple calls or campaigns, voice-similarity ML, score history, iOS Safari.

## Risks & unknowns

ASR latency may make the agent feel unresponsive enough to kill tension. Six scripted questions may be funny once and dead on replay. The suspicion meter may read as arbitrary punishment rather than pressure. The whole thing may be better as pure improv with no checkable answers — in which case v1 tells us that cheaply.

## Done means

Four phones and a host: a group that has never played completes the six-question call, at least one mid-answer handoff visibly spikes suspicion and the room audibly covers for it, and a second group plays the same call immediately after without a reset or a crash.
