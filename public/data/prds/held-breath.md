## Overview

A 3-player cooperative round built on a single, brutally scarce resource: the room may contain exactly one sound-maker at any instant. Each phone holds a private script of syllables it must get spoken aloud, but no phone can see whether the shared channel is currently occupied. For small groups who enjoy the comedy of near-collisions.

## Problem

Silence games usually meter *volume*. But the real social texture of quiet rooms is **turn-taking** — the awkward double-start, the mutual deferral, the person who never gets a word in. No party game has made the shared speaking slot itself the contested object, and doing it without a visible "channel busy" light is what makes it squirm.

## How it works

One 2-minute round. The host TV shows a slowly-filling **Ledger**: a left-to-right transcript of syllables the room has successfully committed, plus a big red **COLLISION** stamp when two people overlap.

Each phone privately holds a queue of 5 nonsense syllables (e.g. *ka, ro, mim, sef, tuu*) drawn from a shared pool, and a private **turn cost** — the number of consecutive silent seconds that must precede your utterance for it to count. Costs differ per player: one player might need 2s of prior room silence, another 5s. Nobody sees anyone else's cost.

Speak your next syllable aloud. If the room was silent for at least *your* cost, the syllable commits and appears on the TV Ledger. If not, it's rejected — and your phone shows only "TOO SOON", never how short you were. If two players' utterances overlap within 350ms, both are rejected, both queues shuffle, and the TV stamps COLLISION.

The room wins by committing all 15 syllables in order-agnostic fashion before the clock. The expensive-cost player is a bottleneck who must be silently yielded to — but since nobody knows who that is, the group has to *infer it from the rejection pattern on the TV alone*, without discussing it, because discussion is itself sound that resets everyone's silence counter.

## Technical approach

PartyKit Durable Object; phones as PWA clients. Data model: `Room {ledger[], silentSince, collisions, clock}`, `Player {id, queue[5], turnCost, lastAttempt}`. Each phone streams a 20Hz voiced/unvoiced flag (zero-crossing rate + RMS gate, computed locally in an AudioWorklet) — no audio leaves the device.

The hard part is **collision detection across unsynchronized clocks with variable network latency**. Two phones 300ms apart on the wire look identical to a genuine 300ms-apart double-start. Fix: NTP-style offset estimation at join (8 ping exchanges, take the min-RTT sample), then every voiced-onset event carries a device-local timestamp corrected to server time. Server buffers onsets in a 500ms reorder window before adjudicating, which costs us half a second of TV latency but makes collisions honest. Room silence is the AND of all phones' unvoiced flags, so one player's rustling phone can starve everyone — a real failure mode we accept as flavor.

## v1 scope

- Exactly 3 players, one 2-minute round
- 15 syllables, 5 per private queue
- Turn costs fixed at {2s, 3.5s, 5s}, randomly assigned
- TV shows Ledger + COLLISION stamp only
- Phone shows: next syllable, queue count, TOO SOON / COMMITTED

## Out of scope

- Speech recognition — we detect *that* you spoke, never *what*
- More than 3 players, multiple rounds, difficulty scaling
- Revealing turn costs at end-of-round
- Any reconnect story beyond a rejoin-and-lose-your-queue

## Risks & unknowns

Voiced-onset detection may false-trigger on chair scrapes and laughter, which could be funny or could be ruinous — needs a live-room trial. The 500ms adjudication buffer may make the TV feel laggy enough to break the read-the-pattern loop. Three players may be too few to make inference interesting; four may make collisions constant. Unknown whether players will just count silently in unison and trivially solve it — the randomized costs are the only defense.

## Done means

Three phones join; each shows a different first syllable and never shows another player's cost. Speaking after a long silence commits and the syllable appears on the TV within 700ms. Speaking 1s after someone else shows TOO SOON. Two players speaking simultaneously produce exactly one COLLISION stamp, not two. A full 15-syllable clear is achievable by a room that figures out the yield order.
