## Overview

A four-player riff on **Herd Mentality** for a TV plus four phones. Everyone answers one public prompt. But each phone privately holds a different *quota* — the exact size of the answer-cluster you must land in — and a live, private counter showing how many other players are currently typing the same thing as you. It's a matching game where matching harder isn't always better, played in real time against a room you can only see one number of.

## Problem

Matching games (Herd Mentality, Fibbage's audience round, Psych) have one dominant strategy: type the most obvious answer. Everyone optimizes the same direction, the 60 seconds of typing are dead air, and all the fun is compressed into the reveal. There's nothing to *do* while you answer.

## How it works

1. **TV (public):** one prompt — "Name a bad wedding gift." A 60-second bar. Four blank answer slots. Nothing else, ever, until reveal.
2. **Phone (private):** your **Quota card** — *"You score only if EXACTLY 2 players end with your answer (including you)."* Quotas are dealt from the fixed multiset {1, 2, 2, 3}, so they're mutually unsatisfiable. You never learn anyone else's.
3. **60s of open table talk.** You may lie freely about your quota.
4. **Typing phase.** Everyone types simultaneously into their own phone. As you type, your phone shows one private number: **MATCHES: 2** — how many of the other three players' *current drafts* normalize to what's in your box right now. Nobody sees any text but their own. The Quota-3 player watches their meter climb and relaxes; the Quota-1 player watches it hit 2 and flees to something weirder.
5. **Blind finish.** At T-5s all meters go dark and freeze. This kills the infinite last-second chase and forces one real commitment.
6. **Reveal.** TV flips all four answers, draws the clusters, and pays only the players whose cluster size equals their quota.

The private meter is the whole game: it's four *different* views of one distribution, and it makes typing an act of chicken.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object per room. State: `{prompt, players:[{id, quota, draft, normalized, locked}], phase, deadline}`. Phones emit `draft:update` debounced at 150ms; the server normalizes (lowercase, strip punctuation/articles, collapse whitespace) and recomputes cluster sizes, then fans out to each phone **only its own integer** — the answer text never leaves the server except at reveal. Server clock is authoritative; phones render a locally-interpolated bar corrected by periodic `sync` pings.

The genuinely hard part is thrash: four people reacting to four meters that react to them creates oscillation, and a naive per-keystroke broadcast makes the number strobe unreadably. Fix is threefold — debounce, a 400ms minimum meter hold time, and the blind window. Second hard part: normalization is the game's referee. If "toaster" and "a toaster" cluster differently, the meter lied to someone.

## v1 scope

- Exactly 4 players, exactly 1 prompt, one round, then a final screen.
- Fixed quota multiset {1, 2, 2, 3}, randomly dealt.
- Exact-match normalization only (no synonyms, no fuzzy).
- Meter = a single integer. No names, no hints, no history.
- Blind window hardcoded at 5s.

## Out of scope

Multiple rounds, running score, embedding/synonym clustering, >4 players, spectators, custom prompt packs, reconnect handling beyond a page refresh.

## Risks & unknowns

Does the private meter actually change behavior, or do people just type and stare? Normalization misses will feel like bugs. Quota-1 may be trivially easy (type gibberish) — may need a plausibility gate. Fast typists leak advantage by settling early.

## Done means

Four phones on one room code, one prompt, meters update within 400ms of a remote keystroke, meters go dark at T-5s, and the TV reveal correctly pays only quota-matching clusters. Playtest bar: at least one player visibly abandons a good answer mid-typing *because of their meter*.
