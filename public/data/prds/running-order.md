## Overview

A 4-5 player negotiation game where the group must order everyone's clause into one paragraph the model reads smoothly. The model's pairwise "seam cost" table is computed in full — and then deliberately shredded, one row to each phone. For groups who like arguing with incomplete numbers.

## Problem

Perplexity party games nearly all end at "write text, get a score." The model's output is a *matrix* here, not a scalar, and a matrix can be cut up. Splitting it turns a solitary optimization into a table full of people who each hold one honest fact and one reason to lie about it.

## How it works

1. **Write (60s).** The TV shows a topic. Each phone privately types one clause, ≤8 words. All clause texts then go public on the TV, labelled by author.
2. **Shred.** The host model computes `S[i][j]` = per-token surprisal of clause *j* when it directly follows clause *i*, for all ordered pairs. The full table is never shown.
3. **Deal rows.** Your phone shows only *your* row: "after your clause — Ana costs 1.2 bits, Ben 4.7, Dana 2.1." You know what follows *you* well. You have no idea what follows *Ben* well. Only Ben does.
4. **Secret goal.** Each phone is also privately told one adjacency worth personal points: *"end up immediately after Dana."*
5. **Talk (90s).** Say anything. Read your row aloud, or misread it. Your goal is the only reason to lie, and lying is the only way to buy your slot.
6. **Commit.** Every phone simultaneously drag-orders all clauses and submits. The server resolves the ballots by Borda, ties broken by lowest total bits.
7. **Read-out.** The TV streams the assembled paragraph word by word with a live surprisal skyline. Under the bit threshold, everyone banks the team bonus. Then secret adjacencies reveal — who steered the room into a bad seam for a personal point.

## Technical approach

Host tab (transformers.js, distilgpt2) + phone PWAs + PartyKit Durable Object. For n=5 clauses, 20 short forward passes, ~2s total, done once.

Data model: `Room { phase, clauses: [{pid, text}], matrix (server-only), goals: {pid}, ballots: {pid: order[]} }`. The server stores the full matrix and pushes only `matrix[pid]` to each phone — row hiding is enforced server-side, never by hiding fields in a client payload a player can open devtools on.

The hard part isn't frame sync — it's the reveal. Word-level surprisal must stream at ~4 words/sec so the skyline draws in time with the TV read-out, which means the host emits a token-timed stream the phones and TV both render off one server clock.

## v1 scope

- 4 players, one round, one hardcoded topic
- Goals limited to "immediately after <player>"
- Borda resolve; per-token normalized surprisal with the first token dropped
- Score shown as raw bits, no polish

## Out of scope

Multiple rounds, Kemeny resolve, custom topics, >6 players, a hidden saboteur role, persistence.

## Risks & unknowns

Seam costs from a tiny model may track clause length and punctuation more than meaning — per-token normalization plus dropping the first token is the mitigation, and may not be enough. The talk phase could collapse into everyone honestly reciting their row; if one secret goal isn't enough friction, deal two conflicting ones.

## Done means

Four phones each display a different 4-number row of one server-held matrix, the room negotiates, simultaneous ballots resolve to a single order, the TV draws the surprisal skyline over the assembled paragraph, and the reveal shows whether each player's secret adjacency landed.
