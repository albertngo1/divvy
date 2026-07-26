## Overview

A cooperative word-deduction game for 3 players, one TV, and three phones — a phone-native riff on *Letter Jam*. The server deals each player one secret letter. Your letter is rendered on everybody else's phone and never on yours. Players spell words out of each other's letters; you deduce your own from the shape of the hole you leave behind.

## Problem

"Can't see your own card" games are physically awkward at a table — card holders, no peeking, someone always cheats. But the mechanic is *made* for phones, where every screen can legitimately render a different truth. The itch: existing phone party games treat the phone as a private keyboard. Here the phone is a private *lens on the same object*, and that's the whole game.

## How it works

**Host TV (public):** three avatars, each with a blank tile beneath it, plus three grey **wildcard** letter tiles that everyone can see and anyone may use. The TV never shows a player letter — it's a public screen, so it can't.

**Your phone (private):** the other two players' tiles with their letters printed on them, the three wildcards, and your own tile rendered as `?`.

**Clue phase (simultaneous):** every phone composes a word by tapping tiles in order. You physically cannot use your own letter — it isn't on your board. Submit privately. The TV then shows all three candidates *anonymized and letterless*: word length, and which player-colors appear at which positions. The room votes with one tap for the candidate to reveal, without ever seeing the words.

**Reveal (per-phone filtered):** the TV shows the winning word as a row of colored chips only. Each phone shows the same row with letters filled in — except at positions occupied by *its own* letter, which stay `?`. If the word is C-A-K-E and you're the K, you see `C A ? E` and quietly realize you're a K.

**Lock:** after two clue rounds, each phone privately locks a guess of its own letter. The TV shows *that* you locked, never *what*. Group score = correct locks out of three.

## Technical approach

Socket.IO over Tailscale Serve, or a PartyKit Durable Object. State: `{ phase, players[{id,color,letter,locked}], wildcards[3], candidates[{authorId,tileIds[]}], votes{}, round }`.

Sync is per-connection redaction with a strict rule: a player's own `letter` must never cross that player's socket — not in the deal, not in candidate summaries, not in vote metadata, not in a reconnect snapshot. The genuinely hard part is that the *same* reveal event serializes three different ways (mask positions belonging to the recipient), and that anonymized candidate summaries must be information-safe: word length plus color positions can leak authorship if you're the only player who could have built it, so the server must reject or reshuffle degenerate candidate sets.

## v1 scope

- Exactly 3 players, two clue rounds, one lock phase
- Fixed letter deal from a curated common-letter pool, three wildcards
- Server-side dictionary check on submitted words (one small word list)
- Text score screen; no rounds, no persistence

## Out of scope

4–6 players, letter-stack progression, mid-game early locks that retire you as a clue source, hint economy, spectator mode.

## Risks & unknowns

With only two other letters plus wildcards, buildable words may be scarce — wildcard count needs tuning. Blind voting on letterless candidates may feel arbitrary rather than tense. Deduction may be trivially easy (`C A ? E`) or impossible; letter-pool curation carries the difficulty.

## Done means

Three phones join, each provably sees two letters and one `?`, a simultaneous clue round resolves through blind voting into a per-phone-masked reveal, and locked guesses score 0–3 on the TV — with a refresh restoring the correct masked view and never transmitting the refresher's own letter.
