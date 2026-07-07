## Overview
Roach Motel is a browser extension that turns a serious research topic — deceptive/dark patterns — into a scored, shareable toy that's also dangerously useful. Its narrow obsession: exit friction. It measures and grades how hard a site makes it to cancel a subscription, delete an account, or unsubscribe, and turns each site into a report-card "rap sheet" fed to a crowd leaderboard of the worst offenders. For everyday consumers and consumer-protection nerds.

## Problem
Signing up takes one click; leaving takes a phone call, a chat bot, five confirm-shaming screens, and a prechecked "actually keep it" box. The arXiv work on deceptive patterns across age groups shows these tricks disproportionately snare the young and old. There's no ambient, gamified pressure that names and shames the specific flows — reviews are about products, not about how hard the exit is.

## How it works
As you browse, the extension quietly scans the DOM for exit-friction signals: countdown timers near cancel buttons (fake urgency), buttons whose visual weight pushes "stay" over "leave" (confirmshaming), prechecked opt-ins, cancel links buried below the fold or requiring N clicks, and detected "contact us to cancel" dead-ends. It scores a site A–F on an Exit-Friction index and pops a small badge. Completing a real cancellation (detected heuristically) lets you tag the flow and auto-generates a shareable rap sheet card (screenshots redacted, patterns annotated). Opt-in submissions build a public leaderboard of the shadiest cancel flows, Wordle-share style.

## Technical approach
Manifest V3 extension (Chrome/Firefox). Content script runs a heuristic rule engine — a versioned JSON pack of CSS/text patterns (`/cancel|unsubscribe|delete account/i`, timer-node proximity, contrast-ratio comparison of paired CTA buttons via `getComputedStyle`, `checked && hidden` inputs). Scoring is weighted-sum → letter grade. Backend is a tiny Postgres + a `/submit` endpoint storing `{domain, flowSteps, patternsHit[], grade}`; leaderboard is a static aggregate view. The hard part is precision without server-side crawling: heuristics over live DOM are noisy, and "detecting a completed cancellation" from client signals alone is genuinely fuzzy — needs a curated per-domain override pack for the top 200 subscription sites to keep grades trustworthy.

## v1 scope
- Content-script rule engine with ~8 exit-friction heuristics
- A–F badge on subscription/checkout pages
- Local-only "rap sheet" generation (no backend)
- Curated override pack for ~30 well-known offenders

## Out of scope
- Auto-cancelling for you (that's DoNotPay territory)
- Crowd leaderboard/backend (v2)
- Mobile browsers

## Risks & unknowns
- False positives will erode trust fast; heuristics need heavy tuning.
- Sites A/B test and obfuscate cancel flows, breaking selectors.
- Legal/defamation exposure from a public wall of shame — needs evidence, not accusation.

## Done means
Visiting a known roach-motel cancel page (e.g. a gym or streaming trial) shows an F badge listing the specific patterns hit; a clean, one-click cancel page scores an A; the rap-sheet card renders with annotated screenshots and copies to clipboard.
