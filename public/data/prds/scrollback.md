## Overview
A 4-player hidden-role game about a shared past that isn't shared. Everyone privately reads the same fictional group-chat thread on their own phone, then the phones lock and the arguing starts. One player's thread contained one extra, fabricated message — stylistically indistinguishable, but load-bearing on the answers. They were never told. This is a Mandela-effect engine for a living room.

## Problem
Most hidden-role games make the imposter *knowingly* lie, which turns the round into a performance contest that extroverts win. The far more interesting social state is sincere disagreement: two people who both genuinely remember a thing, one of whom is wrong and doesn't know it. That state is impossible to manufacture in a physical party game — you cannot hand four people slightly different memories of the same document. Four private screens can.

## How it works
**Host TV (public):** a title card only — "THE CABIN TRIP — group chat, 14 messages" — plus a read-phase progress ring, then question prompts, then anonymous answer tallies. The TV never shows the thread.

**Each phone (private):** the full scrollable thread, 14 messages with sender names and timestamps. One randomly chosen phone renders 15 — one authored phantom message inserted mid-thread, in the voice of an existing sender, that flips the answer to one question ("fine I'll drive, but someone else books"). Its message counter still reads 14, so the count itself is never a tell.

After 75 seconds every phone locks simultaneously and the thread is gone for good. The TV asks three questions in sequence ("Who agreed to drive?", "What did Priya refuse to bring?", plus one deliberately ambiguous question so honest players split too). Each phone answers privately from memory. The TV shows anonymous tallies — 3 for MARCUS, 1 for PRIYA — with no names attached, which is exactly enough to start a fight and not enough to end one.

Then 90 seconds of open argument with phones locked, followed by a private accusation from every phone plus a private CHECK YOUR OWN RECEIPTS self-call. Honest players score for naming the phantom-holder; the phantom-holder scores for going undetected, and double for correctly calling themselves.

## Technical approach
PartyKit Durable Object (or Socket.IO over Tailscale Serve) holds `{threadId, variantAssignment{pid: 'clean'|'phantom'}, phase, deadlines, answers{}, accusations{}}`. Thread content lives server-side only; each client is pushed exclusively its own rendered variant. Message IDs are per-client randomized so two players comparing network traces or screenshots cannot align them.

Sync: the read phase must be *phase-locked* — a phone that joins the read 3 seconds late gets 3 extra seconds of reading, a real competitive edge and a subtle tell. The server broadcasts a single absolute `readEndsAt`, phones ping/pong for offset, and any phone whose ack lands late gets the whole room's window extended before the phase starts, not after. Post-lock the thread payload is dropped from client memory and the socket refuses re-sends for that round.

The genuinely hard part isn't sync — it's authoring. The phantom line must be deniable in both directions: plausible enough that its holder never doubts it, and consequential enough that its absence changes an answer. That is a content-design problem with a very narrow window, and v1 solves it by hand, not by model.

## v1 scope
- Exactly 4 players. One round. One hand-authored 14-message thread and one hand-authored phantom line.
- Three fixed questions, one of them intentionally ambiguous.
- 75s read, 90s argue, one accusation round, one reveal screen.
- No accounts, no persistence, no scoring across rounds.

## Out of scope
LLM-generated threads or phantom lines, more than 4 players, multiple phantom variants (omission, name-swap), re-reading, spectator mode, reconnection mid-read.

## Risks & unknowns
- The phantom may be too weak (nobody notices, round is flat) or too strong (holder instantly knows). Narrow tuning band.
- 75 seconds of silent reading is dead air on a TV; needs an ambient host screen to not feel like a waiting room.
- Players holding phones up to each other trivially breaks it — a social rule, same as any hidden-role game.
- Memory load may simply exceed casual party attention; test with a shorter thread.

## Done means
Four phones join from a code, read simultaneously, lock together within 200ms of each other, answer three questions privately, and reach one reveal screen. Across 5 blind playtests the phantom-holder answers at least one question differently from all three others, and at least two of the four groups produce a genuine unscripted argument about what the chat said.
