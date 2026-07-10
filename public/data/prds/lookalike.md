## Overview
Lookalike is a daily browser word-game about Unicode confusables (homoglyphs): a serious anti-phishing technique turned into a toy, whose scorecard is a genuinely useful artifact. It crosses the '18 Words' daily-word-game format with MetaMask's eth-phishing-detect ethos and the surveillance-scanning zeitgeist of Chat Control. For word-puzzle people and security-curious folks alike.

## Problem
Homograph attacks — `аpple.com` with a Cyrillic а, `l` vs `I`, zero-width joiners — fool humans constantly, and most people have never trained their eye to spot them. Meanwhile the actual defensive skill (recognizing a confusable) is dry and buried in Unicode TR39 tables. There's no fun daily rep that both teaches it and produces something you can act on.

## How it works
Each day: a grid of ~12 domains/words, some pristine, some spiked with a single confusable character. You tap the impostors before the timer runs out; a miss reveals which glyph was swapped and its real vs lookalike codepoint. Wordle-style emoji share ('🟩🟩🟥 3/4, 0:41'). Every domain you correctly flag accretes into your personal 'catch list,' exportable as a punycode/hosts blocklist. A practice mode drills specific confusable families (Cyrillic/Latin, Greek, digit-letter).

## Technical approach
Pure client-side static site: Vite + vanilla TS, no backend for play. Core data: Unicode TR39 `confusables.txt` (the official skeleton-mapping table) loaded as a compact JSON map. Puzzle generation (offline, seeded by date via a PRNG over the ISO date so everyone gets the same board): take real popular domains from a bundled top-list, for spiked entries substitute one character with a confusable from its skeleton class, verify the result renders visibly-different-but-plausible and normalizes back to the original under `toASCII`/punycode. Scoring compares taps to the spiked set. Export builds a `0.0.0.0 xn--...` hosts file from caught entries via the URL/punycode API. The genuinely hard part is picking substitutions that are *tricky but fair* — filtering confusables that most fonts render identically (impossible) or obviously wrong (trivial).

## v1 scope
- Bundled TR39 confusables JSON + top-200 domain list
- Date-seeded daily 12-tile board, tap-to-flag, timer
- Reveal panel: swapped glyph + both codepoints
- Emoji share string

## Out of scope
- Accounts, server leaderboard, streak sync
- Live/real threat feed of actual phishing domains
- Browser-extension enforcement of the blocklist

## Risks & unknowns
- Font rendering varies by device — a confusable that's obvious on one OS is invisible on another; fairness is font-dependent.
- Could read as edutainment fluff without the blocklist export to give it teeth.
- Bundled domain list ages.

## Done means
On a fixed date the board is identical across two browsers; a spiked tile with a Cyrillic 'а' is catchable, the reveal shows U+0430 vs U+0061, and exporting my catches yields a valid `xn--`-encoded hosts entry.
