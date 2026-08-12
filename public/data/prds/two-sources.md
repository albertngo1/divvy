## Overview

Four friends, one shared past event, one page. A cooperative round with no score: the output is a printable page of the night, written by nobody in particular. It runs about six minutes and is aimed at people who were all there — a trip, a wedding, a bad New Year's.

## Problem

Group memory is dominated by whoever tells the story loudest, and the version that survives is theirs. The journalistic two-source rule is a better filter than confidence — but you can only apply it if the recollections are genuinely independent, which is exactly what a table conversation destroys in the first ten seconds.

## How it works

The room types candidate events into their phones; the host screen picks one and starts a 90-second silent recall.

During recall each phone privately shows an entry field, a 5-line cap, and a **different prompt ladder** — one phone is nudged toward what things cost, another toward what people wore, another toward what was said, another toward what went wrong. The divergent ladders are what makes independent overlap meaningful. Your phone shows only your own lines. The TV shows only four filling bars — counts, no text — so nobody can read the room and converge.

When time is up the server clusters lines across players. A detail is **corroborated** when at least two players produced it independently. The TV then assembles the page: corroborated details in clean prose, everything else rendered struck through, all of it unattributed.

Then the last move. Each phone privately shows every struck line, with its own struck lines quietly marked, and exactly one VOUCH token. Spend it and the line prints — but with a footnote, *on the word of Priya*. Thirty seconds, simultaneous, nobody sees anyone else's choice until reveal. If two people vouch the same line, it prints as corroborated after all, with both names, which is the moment the game exists for.

The page is the win condition. The strikethroughs are the charm.

## Technical approach

Host tab + phone PWAs + one Durable Object per room. State: `{event, phase, entries[]{playerId, text, ts}, clusters[], vouches[]}`.

Sync is low-rate; the hard part is **matching**. "Dan's car wouldn't start" and "we jumped the Corolla" are the same detail; "it rained" and "it snowed" are not. v1: normalize, stopword-strip, then cosine similarity over MiniLM embeddings (transformers.js in the host tab, results sent to the server) with a tuned threshold plus a hard block on numeric mismatch. False merges are worse than misses — a wrongly-merged line prints a memory nobody actually had. Second constraint: `playerId` never leaves the server for any entry, so no client can attribute a line even in a stale frame. Render with satori → resvg → PNG, QR to all four phones.

## v1 scope

- Exactly 4 players, one event, one round
- 90-second recall, 5 lines max per phone, 4 fixed prompt ladders
- Server-side clustering, ≥2 sources = corroborated
- One vouch token each, 30-second window
- One PNG page, QR-delivered, server copy purged after 10 minutes

## Out of scope

Photo import, multiple events, editing the page, player counts other than four, persistent history, any points.

## Risks & unknowns

Threshold tuning is the whole game — too loose and the page lies. Groups with no strong shared event fall flat. Recall may skew toward things people expect to be corroborated, which is fine or is a failure mode depending on taste.

## Done means

Four phones recall in silence; the page prints with at least three corroborated lines and visible strikethroughs; no line carries an author except a vouched one; a deliberate near-miss pair ("blue coat" / "navy jacket") merges and a deliberate contradiction ("$40" / "$400") does not.
