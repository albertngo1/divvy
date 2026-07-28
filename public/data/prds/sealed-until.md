## Overview

A writing game for 5–8 friends that produces one shared keepsake: a dated card of anonymous predictions about the people in the room. There is no score and no winner. The only outcome is how much of the capsule survives — and lines survive only by staying unattributed.

## Problem

Everyone wants to say the true thing about their friend — *you're going to quit that job by spring* — and almost nobody will say it with their name attached. Existing party games either force attribution (that's the joke) or make anonymity free, so nothing is at stake in it. Nothing makes anonymity the actual win condition of a thing you keep.

## How it works

**Round 1 — Write.** Each phone privately shows one name: the player you've been assigned. You write one prediction about them for one year from tonight. The server guarantees you never draw yourself.

**Round 2 — Launder.** Every line is routed to a *different* phone, never its author, never its subject. That phone sees the line and the subject's name, and must rewrite it in different words without changing the claim. Here's the hook: you may deliberately rewrite it in a *third* player's voice to misdirect. You don't know whose line you're holding — only that it isn't yours.

**Round 3 — Attribution.** The host screen shows the laundered lines one at a time, grouped by subject ("about ALEX"). Every phone privately guesses **who originally wrote it**. If a majority lands on the true author, the line is **burned** — struck through on the TV and permanently deleted, never printed. If the room misses, it survives.

**The artifact.** The host renders a single card of the surviving lines, subject names intact, authors gone forever, dated for one year out. Screenshot it, print it, whatever. That's the whole game: a thinner card means the room read each other too well.

Private on phone: your subject, your draft, the stranger's line you're laundering, your guesses. Public on TV: only laundered text, subject names, burn animations, the final card.

## Technical approach

PartyKit Durable Object per room. Model: `Line { id, authorId, subjectId, rawText, launderedText, laundererId, guesses: Map<playerId, playerId>, burned: bool }`. `authorId` never leaves the server until the burn resolution, and even then only as a burned/survived boolean — the reveal screen never names an author, ever.

Sync is a simple phase machine (WRITE → LAUNDER → GUESS → REVEAL) with per-phase barriers and a soft timer. The hard part is the **routing constraint**: assigning launderers such that no one gets their own line or their own subject's line, with 5 players and stragglers, is a derangement problem that can dead-end on the last assignment — needs a retry-with-backtrack shuffle plus a graceful fallback. Second hard part: guaranteeing the author key is genuinely unrecoverable in the client bundle, network tab included, or the fiction collapses.

## v1 scope

- 5 players, one round, ~12 minutes
- One fixed prompt frame ("one year from tonight, ___ will…")
- Text only, 140 characters
- Simple majority burn rule, no ties handling beyond "tie = survives"
- Final card as an on-screen render; screenshot it yourself

## Out of scope

- Actual scheduled delivery in a year (email, ntfy)
- Multiple rounds, prompt decks, images, voice
- Accounts, saved capsules, cross-session history
- Any leaderboard whatsoever

## Risks & unknowns

- Laundering may flatten voice so much that attribution becomes a coin flip and burns never happen — the game needs some lines to die
- Or the opposite: five close friends nail everyone and the card ends up nearly empty
- Predictions about real people can land mean; needs a subject-side burn veto we haven't designed
- The laundering round is the most confusing to explain cold

## Done means

Five people finish one round in under 15 minutes; between 40% and 80% of lines survive the attribution vote; at least one player is visibly annoyed that their line got burned; and the group screenshots the final card without being prompted to.
