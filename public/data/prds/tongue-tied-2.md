## Overview

A 3–4 player cooperative voice game for a couch, a TV, and everyone's phone. A single sentence scrolls across the host screen like a karaoke line. The room must read it aloud, contiguously, start to finish. The catch: each player is privately forbidden from voicing certain words, and only one mouth counts at any instant. The sentence has to be handed off mid-clause, in real time, without a gap and without two people grabbing at once.

## Problem

Spaceteam and its descendants make you shout *jargon at* each other. Almost nothing makes the act of speaking itself the scarce, contested resource. The result is games where voice is a transport layer for button-pressing. We want a game where the mouth is the mechanism: where "I can't say the next word, somebody take it" is the entire strategic conversation, and it has to happen while a teammate is mid-syllable.

## How it works

**Host screen (public):** the sentence (~18 words), a read cursor that advances as words are recognized, a colored ring showing who currently holds the mic, a break counter (3 breaks = fail), and a 90-second timer. The host screen never reveals anyone's constraint.

**Phone (private):** your constraint, stated plainly — *"you cannot voice any word containing an S sound."* Below it, a live 5-word lookahead from the cursor, each word pre-colored **green (safe for you)** or **red (poison)**. A giant HOLD TO TALK button. Your phone is the only place that computes which upcoming words are yours — nobody else's phone shows your mask.

**The loop:** whoever holds the mic reads. Every word they voice while holding advances the cursor. Three ways to break: (a) you voice one of *your* red words while holding, (b) a silence gap over 600 ms, (c) two players grab within the same arbitration window (STEPPED ON). Chatter while you *don't* hold the mic is free and uncounted — that's the coordination channel, and it's why the room ends up yelling "I die at 'shipment', you take from 'six'" over a teammate's reading voice.

## Technical approach

Host browser tab + phone PWAs + one authoritative room object (PartyKit / Cloudflare Durable Object). State: `{sentence: Word[], cursor, holder, holderSince, breaks, bans: {pid → phonemeRule}, mask: {pid → bool[]}}`. Masks are computed server-side at deal time and pushed only to their owner.

Speech recognition runs **on the host tab only** (Web Speech API, continuous, interim results), so there's one transcript and no per-phone audio upload. The server fuzzy-matches recognized tokens against the word at the cursor and advances on match.

The genuinely hard part is **aligning word timings to mic ownership**. ASR word timestamps are coarse and lag speech by 200–600 ms; grab/release events arrive from phones with their own jitter. We keep a per-phone RTT estimate from a ping loop, normalize grab/release into host-clock intervals, and attribute each recognized word to whoever owned the mic at the word's *midpoint*, with a ±250 ms grace band that resolves ambiguity in the players' favor. Simultaneous grabs inside 250 ms of each other (RTT-corrected) are a STEP ON for both.

## v1 scope

- Exactly one sentence, one round, 3–4 players, 90 seconds.
- Constraints are letter/sound bans only (S, R, hard-K, words over 6 letters). One per player, dealt so every word is safe for at least two people.
- One hand-authored sentence with a known-good hand-off structure.
- Host screen: line, cursor, holder ring, breaks, timer. That's it.
- Phone: constraint text, 5-word colored lookahead, hold-to-talk. No avatars, no scores, no lobby art.

## Out of scope

Multiple rounds, difficulty curve, generated sentences, per-phone audio streaming, non-Chrome ASR fallback, spectating, reconnect handling, scoring beyond pass/fail.

## Risks & unknowns

Web Speech API accuracy in a loud room is the existential risk — if it can't follow a shouting reader, the cursor stalls and the game dies. Mitigation: aggressive fuzzy matching, and a tested fallback where the mic holder's *voice activity* advances the cursor at a fixed word rate while ASR only adjudicates ban violations. Second risk: the 600 ms gap threshold may be brutal or trivial; it needs live tuning. Third: ban rules that are too easy make hand-offs rare and the game boring.

## Done means

Four people who got 30 seconds of explanation complete one sentence cleanly, with at least three hand-offs between mouths, and at least one moment where someone verbally dumps an upcoming word on a teammate *while another player is still reading*. If they finish it without ever talking over the reader, the design failed.
