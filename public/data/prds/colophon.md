## Overview
Colophon is a 4–6 player writing game for a couch full of people who like being clever in print. The room co-writes one short public document on the TV — say, the house rules for an imaginary top-floor apartment — and then tries to *fail* to identify who wrote which line. There is no score. The prize is a printed broadside whose credits are deliberately, provably wrong, and which every phone leaves with.

## Problem
Quiplash and its descendants end in a scoreboard nobody screenshots. Worse, every group writing game secretly punishes having a voice: the funny one is identifiable from line one, so the game collapses into a popularity vote. Colophon inverts the incentive — your voice is the liability — and it hands the room an object instead of a winner.

## How it works
The host screen shows a title ("HOUSE RULES — 14 ELM, TOP FLOOR") and twelve numbered blank slots.

Each phone privately holds:
- a **Tic** — one mandatory micro-constraint ("exactly one semicolon", "starts with a verb", "contains a number spelled out", "no letter Y")
- a **Quota** — you must fill 3 slots, at least 2 honoring your Tic
- a slot picker and keyboard

The host screen shows each slot's text the instant it locks, never the author. Everyone writes at once; slots are claimed first-come, and a slot greying out mid-keystroke on your phone while someone else takes it is half the chaos. Because the document fills in live and publicly, you can spot a rival's Tic forming and **forge** it — your one un-Tic'd line is free ammunition for framing. The round ends only when all twelve slots lock.

Then the ballot: each phone privately assigns an author to all twelve lines. No ballot is ever shown.

The room wins together if total attribution accuracy is at or below chance. On a win, the host renders a typeset broadside whose colophon credits every line to whoever the room *voted* — a handsome, wrong artifact, QR'd to every phone. On a loss it publishes with correct credits, which is the real punishment.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object as authority. Model: `Room{docId, title, slots[12]{state: free|held|locked, text, authorId}, players[]{id, tic, quota, ballot}}`. Slot claim is a compare-and-swap on the DO — the client optimistically greys and rolls back on reject. While held, only the holder's keystrokes flow (throttled 100ms, host shows a typing shimmer, not the text). On lock, text broadcasts to all with `authorId` stripped server-side — the author field must never leave the DO, since a leaked field ruins the whole game. Ballots are write-once and only aggregated after the last one lands. The hard part is the claim race under four thumbs plus flaky phone Wi-Fi: the DO is the only clock, and a rollback must not eat typed characters — buffer locally, replay into the next slot.

## v1 scope
- One document prompt, 12 slots, 4 players
- 8 hand-written Tics, dealt without repeat
- Live public text, private Tic, private ballot
- One PDF broadside via `@react-pdf` and a QR to download it

## Out of scope
Multiple rounds, custom prompts, difficulty tiers, per-player scores, spectators, any LLM tic-checking (Tics are regex).

## Risks & unknowns
Tics may be too easy to spot at four players (chance is 25%), making losses constant — tune by adding decoy Tics nobody holds. Forging may not occur to first-timers; the host screen should whisper it once. Typing on phones is slow; 12 slots may want to be 8.

## Done means
Four people on four phones fill twelve slots in under six minutes, submit ballots, see a pass/fail attribution readout, and at least one player says "wait, *you* wrote that?" while looking at the printed PDF on their own phone.
