## Overview

A 4-player writing game where the room co-authors one short paragraph — a toast, a birthday note to an absent friend, a house vow — live, simultaneously, on a shared screen. There is no scoring, no winner, and no reveal of who wrote which words. The output is a rendered card you download and send. It's for groups who want to make one true, slightly unhinged thing together and not know whose fault it was.

## Problem

Group writing IRL is captured by whoever holds the laptop; the funniest and kindest lines never get typed because saying them out loud has a social cost. Meanwhile every party game ends in a leaderboard and nothing you keep. Anonymity is the unlock — but real anonymity is hard, because in a room of four, *timing* is the tell. If your letters appear the instant you look down at your phone, you're identified.

## How it works

**Host TV shows:** the paragraph in one big serif block, a shared ink meter, and a four-segment SEAL ring. That is all. No names, no author colors, no cursors, no typing indicators.

**Each phone shows privately:** the same public text, *your* caret placed anywhere in it, a keyboard, your personal ink budget (120 characters for the whole game), and your pending buffer — the words you've committed that haven't surfaced yet — rendered ghosted so only you know they're coming.

You commit in chunks of at least one word. The server holds each commit for a random 0.6–3.0s, then drips it onto the TV one character at a time at a jittered ~40ms rate, interleaved with everyone else's drips. The page appears to be written by one invisible hand at an inhuman, drunk pace. You watch your own sentence arrive letter by letter alongside someone else's and quietly fight for the same clause.

Ink is scarce, so "the" is a real decision. The round ends when all four players hold SEAL simultaneously for 2s, or when ink runs out. The TV then renders the finished paragraph on a card credited to the room's first names in alphabetical order — one shared credit, no attribution — offers a QR download, and visibly destroys the authorship log.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs are equal clients.

**Data model:** the doc is a sequence CRDT (RGA/Fugue) of `{id:[siteId,counter], char}`. Ops are `{type:'insert', id, anchorId, char, authorId, releaseAt}`. Anchoring by character ID — never by index — is what makes the deliberate delay survivable: your insert lands after the character you actually clicked, even though the neighborhood mutated during the 2s it was held.

**Sync:** the server is the sole sequencer. It queues ops in a delay heap, then broadcasts in server order to every client at the drip rate. Clients apply their own ops only into the private pending buffer, never into the public doc, so phone and TV renderings of the public region are byte-identical.

**The hard part** is anti-de-anonymization, not throughput. Per-keystroke broadcast would leak identity through cadence, so commits are batched to word granularity and both the hold and the drip are randomized per op. Concurrent inserts at the same anchor spike under delay; tie-break deterministically by op id so all clients converge.

## v1 scope

- Exactly 4 players, one fixed prompt, one round
- Insert only — no deletion of any kind
- 120 characters of ink each, hard cap
- Fixed random delay band, no tuning UI
- Unanimous 2s SEAL to end; PNG export via QR

## Out of scope

- Deleting or striking other people's text (the obvious round-two drama)
- Prompt packs, room codes, spectators, more than 4 players
- Persistence, accounts, gallery of past pages

## Risks & unknowns

- Four people typing into one paragraph may produce mush rather than a keepsake; the ink cap is the mitigation but the band is unvalidated.
- The delay may read as lag rather than as an intentional anonymizer — the drip animation has to feel authored.
- Physical de-anonymization (watching someone's thumbs) is unsolvable in software; the delay only buys plausible deniability.

## Done means

Four phones on one LAN write one paragraph in under five minutes, the TV renders a downloadable PNG, and in a blind post-game attribution test players identify authorship of individual clauses no better than chance ±10%.
