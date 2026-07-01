## Overview
Adblock Arena is a browser-based competitive puzzle where players are dropped onto a deliberately hostile web page — banners, sticky cookie walls, newsletter modals, a fake 'download' button, one phishing link — and race to hide every offending element by writing filter rules. It's for the EasyList-curious: devs, privacy nerds, and anyone who's ever right-clicked → Inspect on an ad in anger. The passive act of *benefiting* from an ad blocker becomes an active timed sport.

## Problem
Millions run uBlock Origin and never learn how it works. Writing a good cosmetic filter is a real, teachable skill (CSS selectors, `:has()`, specificity, avoiding collateral damage) but there's zero fun on-ramp. Meanwhile phishing detection (MetaMask's eth-phishing-detect, EasyPrivacy) is treated as invisible plumbing. Nobody practices the muscle.

## How it works
Each round loads a fixture page in a sandboxed iframe. A HUD lists 'targets' (junk elements) and 'protected' elements (real content you must NOT hide). You type element-hiding rules in EasyList syntax (`##.ad-banner`, `##div:has(> .sponsored)`). Each rule applies live; the target counter ticks down. Score = (targets cleared) − (protected elements broken) × penalty, tiebroken by time and *fewest rules* (elegance bonus). A 'phishing round' hides a lookalike link among real ones — spot-and-block it for a multiplier. Daily fixed seed = everyone plays the same page = a real leaderboard and shareable Wordle-style result grid.

## Technical approach
Static site, no backend needed for v1. Fixtures are hand-authored HTML/CSS bundles under `/fixtures/<date>.html`, loaded into a same-origin sandboxed iframe. Rules are parsed with a tiny EasyList-subset parser (support `##selector`, `#@#`, `:has`, `:not`) that compiles to `element.matches()` checks — reuse the actual selector engine via `document.querySelectorAll` inside the iframe, then `display:none`. Elements are tagged `data-arena="target|protected"` so scoring is deterministic. Daily seed picks the fixture; results hash to an emoji grid. Leaderboard v2 = a Cloudflare Worker + KV storing `{seed, name, score, rulecount}`. The genuinely hard part: authoring fixtures that are *ambiguous* enough to punish lazy selectors (`##div` clears everything) without being unfair — you need protected elements structurally entangled with targets so brute-force over-blocking self-penalizes.

## v1 scope
- 5 hand-made fixtures, one live at a time by date
- Live rule editor + instant apply
- Deterministic score with over-block penalty + rule-count tiebreak
- Shareable emoji result grid
- Local-only best score

## Out of scope
- Server leaderboard / accounts
- Real EasyList import
- Network-level (request) filters — cosmetic only
- Mobile layout

## Risks & unknowns
- Fixture authoring is the whole game; bad fixtures = trivial or frustrating
- `:has()` selector-engine edge cases across browsers
- Teaching syntax without a tutorial wall

## Done means
On the daily fixture, a player can type `##.promo-strip`, watch that banner vanish and the target counter drop, get penalized for `##div`, and copy a shareable score grid — all offline in a single static page.
