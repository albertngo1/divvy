## Overview

A quiet cooperative concept game for three players, one TV, three phones. A hidden rule exists — "things that come in pairs," "things you'd find in a coat pocket" — and it is never told to anyone. Each phone privately receives a *different* handful of examples of that same rule. The TV shows a shared pool of nine candidate items. Everyone silently locks one pick. Win only if all three picked the same thing. Five minutes.

## Problem

Concept-matching party games give everyone identical information, which turns them into vocabulary tests or, worse, into a discussion the loudest person wins. Codenames-likes need a clue-giver — a talker — which kills the silence. The itch: convergence where each player reasons from *evidence nobody else has seen*, so agreement has to be earned by guessing at the shared prototype rather than by reading the room.

## How it works

The server draws one rule from a small deck and deals each player three positive examples of it — disjoint sets, so no two phones show the same word.

**Phone (private, different per player):** your growing list of example words, the same nine pool items as tappable buttons, and a LOCK button. That's it. Your examples are yours alone; the shared pool is common.

**Host TV (shared):** the nine-item pool in a grid, and three padlocks that fill as players lock. Never a choice, never a tally, never a heat map.

When all three lock: unanimous → the rule is revealed and the room wins. Otherwise the TV says only **NOT THE SAME** and nothing else. Then each phone quietly receives *one new private example* (still disjoint from everyone else's), the pool stays put, and everyone picks again. Up to three attempts.

The design's whole bet is the feedback channel: there is deliberately **no vote heat map**, the reflex move in this genre. The only thing that changes between attempts is that your private evidence gets richer, which sharpens the rule and pulls three independent players toward the same prototype without a single signal passing between them. Final reveal shows the rule, all five examples per player side by side, and every attempt's picks.

The disjoint private evidence *is* the game. Passing one phone around collapses it into a conversation.

## Technical approach

Content model: `Rule { id, label, positives: [12 words], pool: [9 words] with 4 hits and 5 near-misses }`. Eight rules hand-authored as JSON. A dealer shuffles `positives` and deals three per player disjointly, holding two in reserve per player for attempts two and three.

Server (Durable Object / PartyKit): `{ rule, deals: { pid: [words] }, attempts: [{ pid: choice }], phase }`. Phones send `{ type: 'lock', item }`. The server withholds every choice until the last lock lands — a simultaneous-reveal barrier, which is the easy part. Traffic is a few messages per minute; the host subscribes only to a lock count.

The genuinely hard part is **not networking, it's content calibration**. A pool with two equally-good prototypes is unwinnable by skill. Build a small offline harness that samples random three-example deals and asks an LLM (50 samples, temperature 1) or twenty humans to pick from the pool; keep only rules whose modal pick clears 60% across deals. Rules that fail get their pool re-cut, not shipped.

## v1 scope

- 3 players, one rule, one game, three attempts, win/lose only.
- Eight hand-written rules in a JSON file, picked at random.
- Host: pool grid, three padlocks, a NOT THE SAME banner, the final reveal.
- Phone: private examples list, nine buttons, LOCK.
- No timer, no scoring, no reconnect.

## Out of scope

Player-authored rules, negative examples, images instead of words, streaks or scoring, 4+ players, multi-round campaigns, difficulty tiers.

## Risks & unknowns

- **Content is the product.** Every failure mode traces back to a badly cut pool. The calibration harness is mandatory infrastructure, not a nice-to-have.
- Three attempts with zero vote feedback may feel like shouting into a void. First playtest knob: after a failure, reveal only whether there were two distinct picks or three — no words, no attribution.
- Vocabulary and cultural skew will make some rules land unevenly across a friend group.
- Players will absolutely try to signal with eyebrows and pointing. That's not a bug; it's the pressure that makes silence funny.

## Done means

Three phones join a room; each displays a *different* three-word example list drawn from one hidden rule. The host shows the shared nine-item pool and three padlocks that fill as players lock. Socket logs confirm no client receives any information about anyone's pick before the final lock. A unanimous pick ends the game with the rule and all deals revealed; a split pick deals exactly one new private example to each phone and reopens picking, for at most three attempts.
