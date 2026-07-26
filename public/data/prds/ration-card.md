## Overview

A 3-player cooperative panic game — TV plus one phone each. Every player holds a private ration book of words. Saying a word costs a punch; the room shares a fixed budget for the whole round; and the controls on your teammates' panels are physically dead until the word naming them has been spent aloud. For groups who like Spaceteam but want the shouting to *cost* something.

## Problem

In every game in this lineage, speech is free and infinite. The bottleneck is reading speed and lung capacity, so the optimal strategy is always "say everything, constantly, forever." That's a fine five minutes but it has no economy and no decisions. Make the utterance itself the scarce resource and suddenly there is triage: who gets to be understood, and what do we stop saying.

## How it works

**Each phone shows privately:**
- **A job card** — an instruction only you can see, naming another player and one of *their* controls: "MAYA: pump to 3." You can never satisfy your own card.
- **A panel** — four labeled controls (dial, toggle, slider). Each is greyed and unresponsive until its label word is unlocked.
- **A ration card** — eight words, each with 1–3 punches left. To say a word you tap it first; the tap spends a punch and unlocks that word **room-wide for 8 seconds**, waking every control labeled with it.

Words are distributed so each control word sits on exactly one player's card. So: you read your job, you tap the word to open the door, you shout the instruction, the owner finds the now-live control and sets it. The moment a word runs out of punches you have to route around it entirely — describing a HEATER using only words you can still afford, to someone whose panel is still dark.

**Host screen (public):** jobs-completed counter, the shared charge budget burning down, a 90-second clock, and an anonymous coupon-tearing animation per spend. It never shows the word — reading it off the TV would kill the voice channel.

## Technical approach

Host tab + phone PWAs + Socket.IO over Tailscale Serve (or PartyKit DO), server authoritative. Model: `Room {budget, jobs[], unlocks: Map<word, expiresAt>, tick}`, `Player {rationCard:[{word, charges}], panel:[{id, word, type, value}], job}`. Panels and ration cards go out per-connection only.

Hard parts: (1) **generation** — words must be laid out so every job is reachable, every needed word has exactly one owner, and the total punch supply is ~15% below a naive playthrough, forcing at least one circumlocution; that's a small constraint solve, not a shuffle. (2) **Spend races** — two players tapping the same word inside one 150ms tick should not burn two punches; server dedupes on tick and refunds the loser, which the phone must show without stealing attention. (3) Unlock windows must expire on the server clock and be rendered from `serverNow` with RTT offset, or the owner's control dies visibly early.

## v1 scope

- 3 players, one 90-second round, 6 jobs, 12-word vocabulary, 20 shared charges
- One hand-authored word/panel/job layout — no generator
- Three control types, integer values 0–4
- Host shows counters only; QR join; no scoring across rounds

## Out of scope

Speech recognition or any policing of words you say without tapping. Multiple rounds, difficulty tiers, more than 4 players, spectators, persistence.

## Risks & unknowns

Tapping a coupon while mid-sentence may be one input too many under pressure. The room may degenerate into pre-emptively tapping everything; the shared budget is the only brake and may need to be tighter. Whether "I can't afford that word" reads as funny constraint or dead end is the open question.

## Done means

Three phones, one laptop, one cold round in which the room hits at least one word with zero punches remaining and audibly talks around it, and completes ≥4 of 6 jobs. No player ever sees another player's ration card or job in a network payload.
