## Overview
Markup turns dupe culture — the endless passive scroll of "$18 vs $180, can you tell?" hauls — into a competitive daily test of judgment. For people who *think* they can spot quality, and want a score that says whether they actually can.

## Problem
Dupe content is pure passive consumption: you nod along as an influencer reveals the answer, learning nothing about your own discernment. Nobody's keeping score, and nobody's honest about how often the $18 thing is genuinely indistinguishable. Markup makes you commit before the reveal and punishes bluster.

## How it works
Each day: five rounds. A round shows two anonymized listings side by side — material composition, dimensions, weight, a couple of blinded review snippets, warranty — with all brand/price tells stripped. You pick which is the premium original AND drag a confidence slider (50–100%). Scoring is a Brier score: confidently-right earns big, confidently-wrong is brutal, hedging at 50% is safe but low. After locking in, the reveal shows brands, real prices, and the actual markup multiple ("7.4× for a 6%-heavier zipper"). A global daily leaderboard ranks by cumulative calibration, and a personal "overconfidence meter" tracks the gap between how sure you were and how right you were. Wordle-style emoji share of your five confidence bars.

## Technical approach
Static front-end (Vite + TypeScript), daily puzzle JSON served from a CDN — no backend needed for play; scores posted to a tiny serverless function (Cloudflare Worker + KV) for the leaderboard. The real work is the dataset: hand-curate ~200 pairs from published dupe roundups, storing structured specs and 2–3 short cited review quotes per item, plus a `tells` field flagging text to redact for blinding. A deterministic per-day seed selects five unseen pairs. Brier scoring and calibration curves are trivial math. The genuinely hard part is *fair blinding* — scrubbing brand fingerprints from spec/review text without gutting the signal — and sourcing pairs whose "correct" answer is defensible rather than snobbery.

## v1 scope
- 40 curated blinded pairs (8 days of play)
- Two-choice + confidence slider, Brier scoring
- Reveal panel with real prices and markup multiple
- Local-storage streak; emoji share string

## Out of scope
- Live product-catalog scraping
- Images (text specs only, to dodge rights issues)
- Accounts, real-money stakes

## Risks & unknowns
- "Which is better" is partly subjective; some pairs will feel unfair.
- Curation doesn't scale by hand; content runs dry fast.
- Copyright on review snippets — must keep quotes short and cited.

## Done means
A player can complete a five-round day, receives a Brier-based score plus a calibration read ("you were 80% sure but 55% right"), and sees a shareable result; two players on the same day can compare leaderboard ranks.
