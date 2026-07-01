## Overview
Cherry Pick is a browser inspection game — Papers, Please, but for code crossing the border between two repositories. It's for developers who've felt the paranoia of being the last gate before something bad merges. It inverts google/copybara, which silently and cleanly moves code between repos; here a human bottleneck must scrutinize every commit and decide what gets through.

## Problem
Code review is tedious and its real stakes — leaked secrets, GPL contamination, supply-chain payloads — stay invisible until it's far too late. Nobody has ever made the felt experience of being the final checkpoint into a *game*, where a wrong stamp has consequences you watch unfold.

## How it works
Each in-game day, a queue of incoming commits arrives at your booth. For each you see the diff, the author's papers (commit metadata, signature status), and today's rulebook — which drifts daily: "no AGPL-licensed files," "no hardcoded API keys," "author must be GPG-verified," "no binaries over 1MB." You stamp APPROVE or REJECT. Approve a leaked key and it scrolls across a red "breach ticker"; reject legitimate work and throughput drops and a dev files a complaint. Rules stack, signatures get forged, shifts are timed — the squeeze between speed and correctness is the game.

## Technical approach
Web app: TypeScript + Vite, DOM/canvas booth UI, diffs rendered with diff2html. Commits are synthetic, generated from templates against a seeded RNG (mulberry32) so each day is deterministic and shareable. A commit is `{files:[{path,patch,size,license}], author:{name,verified,gpgOk}, message}`. The rule engine is an array of predicate functions over that object. Contraband detectors: regexes for secret patterns (AWS keys, PEM blocks), SPDX license-id checks, size thresholds. Scoring is precision/recall against ground-truth labels baked into each generated commit. The genuinely hard part is authoring commits that are *plausibly ambiguous* — the fun lives in the judgment call, so contraband must hide inside realistic diffs with fair red herrings, which demands a strong generator, not just random noise.

## v1 scope
- One repo border, one booth
- ~15 handcrafted + templated commits across 3 seeded days
- 4 stackable rules
- Stamp mechanic + breach ticker
- End-of-day precision score + shareable seed

## Out of scope
- Real git integration
- Multiplayer
- Forged-signature detective minigame
- Procedural infinite mode

## Risks & unknowns
Generating convincing-but-fair commits *is* the whole game — too easy is boring, too obscure is unfair. Diff readability on small screens. Balancing timer pressure against careful reading.

## Done means
A player can play 3 seeded days, each presenting a diff queue and an evolving rulebook, receive a precision-based end score, and share a seed string that reproduces the exact same day for a friend.
