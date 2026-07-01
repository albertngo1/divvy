## Overview
Squint is a reflex arcade game disguised as a security drill. Domains flash on screen and you snap-judge SAFE or FAKE before the timer runs out. It's for anyone who lives online, and it quietly trains the exact instinct that stops homoglyph and typosquat phishing — a toy that's dangerously useful.

## Problem
Homoglyph attacks (`аpple.com` with a Cyrillic а), typosquats, and TLD swaps beat tired human eyes, and corporate anti-phishing training is boring slideware nobody retains. The itch: turn 'spot the fake' into a score-chasing twitch game so the skill sticks because you *wanted* to play.

## How it works
Each round flashes a domain for a window that shrinks as your combo grows; you tap SAFE or FAKE. 'Safe' domains come from a curated real-brand allowlist; 'fakes' are generated live via three trick families — Unicode confusable swaps, edit-distance typos, and TLD swaps — plus real in-the-wild phishing domains pulled from a blocklist. Misses cost lives; combos accelerate the reveal. The end-of-run screen replays every domain you missed and names the exact trick that fooled you, so each death is a lesson.

## Technical approach
Static web app, Vanilla JS + Canvas, no backend. Brand seed = a top-domains list. Fake generation: a Unicode TR39 'confusables' table for homoglyph swaps, Levenshtein-1 typos, and a TLD-swap list; each fake carries a `trickType` tag. Web3 rounds mix in real entries from MetaMask's `eth-phishing-detect` blocklist for authenticity. Data model: `round = { shown, isFake, trickType }`; runs are date-seeded so everyone gets the same daily gauntlet for a shared score comparison. The hard part is generating fakes that are genuinely *confusable but fair* and rendering homoglyphs consistently — normalize input and pin a single bundled webfont so a trick isn't unfairly obvious or invisible depending on the OS font.

## v1 scope
- 30-second daily run, date-seeded
- 3 trick types (homoglyph, typo, TLD swap)
- Homoglyph rendering pinned to one bundled webfont
- Local best-score persistence
- Post-run 'here's what fooled you' recap

## Out of scope
- Accounts and a global leaderboard
- A live browser-extension mode that scores real links you hover
- Generating fakes of arbitrary user-supplied brands

## Risks & unknowns
- Font rendering making homoglyphs unfairly easy or impossible
- Ethics: keep it strictly defensive — teach detection, not phish-crafting
- Trademark optics of flashing real brand names

## Done means
A 30-second run flashes at least 15 domains mixing real allowlist entries and generated fakes, scores both accuracy and speed, and the post-run screen correctly names the trick behind every domain the player missed.
