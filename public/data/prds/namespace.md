## Overview

Namespace is a 60-second simultaneous-typing round for 3–5 people in one room, with a TV as the shared collision detector and each phone as a private keyboard. It's Scattergories run in real time, where you can watch the crash coming letter by letter and still not get out of the way.

## Problem

"Unique answers score" games (Scattergories, Family Feud inverted) resolve all their tension at reveal time — you write in silence, then find out you were the fourth person to say "penguin." All the drama is retrospective. Meanwhile every party word game treats a word as an atom, when the interesting shared resource is the *prefix*.

## How it works

Host TV shows one category: **things in a kitchen**. A 60s clock starts. Everyone types at once.

**Private (phone):** your own draft text, a big backspace, and a single status bar behind your letters. That bar is cool grey while your current prefix is yours alone, and glows hot red the instant another player is typing down the same prefix. You never learn who, and you never learn their next letter.

**Public (host TV):** a growing trie — but with one rule that makes the whole game: **a node is rendered only once two or more players occupy it.** Solo branches are invisible. So the TV is literally a live map of contested letter-space: `P → E → N` blooms on screen, everyone in the room sees that two people are three letters into the same word, and nobody knows if they're one of them until their own bar goes red.

Swerving costs seconds, and the swerve itself is a trap — both players bail off `PEN` and both reach for `PEPPER`.

**Scoring at lock-in:** your score is your word length minus the depth of the longest prefix you share with any other player. `PENGUIN` vs `PENDULUM` → shared `PEN`, so 4 and 5 points. Identical words → 0 and 0 for both. Diverge early, score big.

## Technical approach

One PartyKit/Durable Object room is authoritative. State: `{category, players: {id, name, draft, lockedAt, score}, trie: Map<prefix, Set<playerId>>}`. Phones send debounced keystroke frames (`{draft}` every ~40ms, last-write-wins per player); the server recomputes that player's prefix set, updates the trie, and derives two very different broadcasts.

The genuinely hard part is the *derived* view. The server must never ship raw drafts to anyone. It emits (a) to each phone, a single boolean — is my deepest prefix shared — and (b) to the host, a diff of only those trie nodes with occupancy ≥ 2, plus counts. Both are recomputed at ~20Hz. Getting the redaction right matters more than the sync: one leaked branch and a player can read someone's word off the TV and deliberately collide.

## v1 scope

- 3 players, one category, one 60-second round
- Phone: text field, backspace, hot/cold bar, LOCK button
- Host: join code, live contested-trie, clock, reveal screen with shared prefix in red / unique tail in green
- No dictionary validation — the room adjudicates fake words out loud

## Out of scope

Multiple rounds, categories beyond a hardcoded three, spectators, reconnect, mobile keyboard autocorrect handling, persistent scores.

## Risks & unknowns

Mobile autocorrect/predictive text may fire whole words and wreck the letter-by-letter feel (v1: `autocomplete=off`, `autocapitalize=off`, and test on iOS Safari first). The trie may stay empty if players diverge instantly — needs a category with a strong obvious answer to bait collisions. Fast typists may lock in before anyone can contest them.

## Done means

Three phones join a code. All three type simultaneously; when two are on the same prefix, that branch appears on the TV within 200ms and both those phones — and only those phones — glow red. Final screen shows each word with its shared prefix struck in red and awards the correct tail-length score, with two identical words scoring zero.
