## Overview
Yardstick is a four-player, ten-minute draft for one TV and four phones. The pool is public. Every tableau is public. The only private thing is **how you measure** — each phone holds a secret scoring rule, and your phone continuously scores *every player's* tableau under that rule. You win by leading your own yardstick, which means you can win by building or by wrecking whoever currently leads it.

## Problem
Variable end-game objectives are the best idea in modern board games and the most tedious to execute: you squint at a hidden card, do arithmetic on five tableaus you can barely see, and mostly guess. Hate-drafting is theoretically the sharpest move in a draft and practically impossible — you can't hold four rival scoring functions in your head and recompute them after every pick. In person the recompute is unbearable, so players default to building selfishly. Give each phone a live private evaluator and the whole hidden layer becomes playable in real time.

## How it works
Sixteen cards face up on the TV, each with a color, a shape, and a number. Snake draft, four players, three picks each (twelve cards taken, four left as a public tell).

**Private on your phone:** your secret rule in plain language ("pairs of matching shapes", "your single highest number, doubled if it's the only one of its color", "total of your two lowest"), the same sixteen cards but *annotated with your rule's marginal value* — a heatmap only you can see — and a live four-name leaderboard scored under your rule alone. Plus one nudge: "this card is worth 6 to the player leading your rule." That's the hate-draft, computed for you.

**Public on the TV:** the pool, the four tableaus, whose turn it is, and one anonymized readout — the **Tremor**: after each pick, how many of the four private leaderboards changed hands, shown as a 0–4 bar. Nobody learns whose rule moved, but the room learns *that something just mattered a lot*, and a pick that tremors 3 marks you as a thief.

At the end, each player's score is their rank under their own rule. Reveal all four rules on the TV last — the joke is watching four incompatible games resolve on one board.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room).

Data model: `Room {code, pool: Card[], taken: {cardId → playerId}, turnIdx, tremorLog[]}`, `Player {id, ruleId}`, `Card {id, color, shape, num}`. Rules are a tiny data DSL (`{kind:'pairs', attr:'shape'} | {kind:'topN', n, tiebreak} | {kind:'unique', attr}`) evaluated by one pure function `score(rule, tableau) → number`, so all sixteen rule×tableau evaluations after a pick cost microseconds.

Sync is turn-based and trivially cheap; the hard part is **per-socket payload filtering that must never leak**. One state change fans out five different messages: four private (your rule, your heatmap, your leaderboard) and one public (tableaus + tremor count). The heatmap is the leak-iest object in the system — it must be computed server-side and shipped as opaque per-card numbers, never as the rule itself, or a curious player reads their rule out of devtools and, worse, infers nothing about others but breaks the reveal.

Second hard part: **the Tremor is a real side channel.** With four players a tremor of 4 plus a visible pick sharply constrains what everyone's rules could be. v1 ships the raw count and playtests whether that's spice or solvent; the fallback is coarse buckets (quiet / stirred / upheaval).

Third: rule assignment must guarantee *contested* cards. Deal rules from a hand-tuned set of six with known overlap on a fixed 16-card pool rather than generating anything.

## v1 scope
- Exactly 4 players, one draft, 3 picks each, one score screen.
- One hand-authored 16-card pool and six hand-authored rules.
- Phone: rule text, private heatmap, private leaderboard, one hate-draft nudge.
- TV: pool, tableaus, turn indicator, tremor bar, final reveal.
- Room code join, no accounts.

## Out of scope
- Generated pools or rules, difficulty tuning, multiple rounds.
- 3 or 5+ players, spectators, rejoin, bots.
- Trading, passing packs, any auction layer.

## Risks & unknowns
- If your phone tells you the optimal pick, is there a decision left? The bet is that the tension moves from arithmetic to *concealment* — taking the obviously good card exposes you.
- Tremor may deanonymize with only four rules.
- Rank-under-your-own-rule can produce ties or four simultaneous "winners"; needs a tiebreak that isn't deflating.

## Done means
Four phones join, each shows a different rule and a different heatmap over the same sixteen cards. A pick by player A visibly changes player C's private leaderboard while the TV shows only a tremor of 2. Every phone's leaderboard is correct against a hand-checked worksheet for a scripted twelve-pick game, private payloads contain no other player's rule, and the final reveal shows all four rules with each player's rank.
