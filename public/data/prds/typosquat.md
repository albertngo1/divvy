## Overview
Typosquat is an educational red-team puzzle that inverts a phishing *detector* into a phishing *sandbox opponent*. You, a security learner, craft lookalike domains against a target brand; the actual eth-phishing-detect ruleset scores your attempts and explains why it flagged (or missed) each one. The goal is defensive literacy: understand detection heuristics by probing them, never touching real infrastructure.

## Problem
Most people can't articulate *why* a phishing domain looks wrong — homoglyphs, TLD swaps, subdomain padding, brand-in-path. Detectors are black boxes. Blue-teamers and everyday users learn detection best by seeing the attacker's move space and where the defenses draw lines.

## How it works
Each level gives a legit target (e.g. `metamask.io`) and a mutation budget. You apply transforms — homoglyph substitution (`ɑ`→a), typo insertion, TLD swap, hyphenation, subdomain prefixing, unicode confusables — to produce a candidate string. The candidate is scored by the real blocklist/heuristics: 'FLAGGED' (detector wins, you learn the tripwire) or 'MISSED' (highlighted as a gap for defenders to note). Puzzles invert too: 'find a mutation the current rules miss' teaches where blocklists are weak, feeding a defensive takeaway card each level. Everything is strings in a sandbox — no registration, no network, no live sites.

## Technical approach
Stack: plain TypeScript, runs fully in-browser. Import the eth-phishing-detect blocklist + fuzzy-match logic (its published lists and the levenshtein/homoglyph checks) as the scoring oracle; supplement with a homoglyph confusable table (Unicode TR39) and a typo-generator. Data model: level = {target, allowed transforms, budget}; candidate scored by (exact blocklist hit, edit-distance-to-known-brand, confusable normalization match). Hard part: making 'MISSED' cases genuinely instructive without becoming an actual evasion cookbook — cap it to well-known public heuristics, always pair a miss with the defensive fix, and keep everything offline/sandboxed.

## v1 scope
- 3 target brands, 4 transforms (homoglyph, typo, TLD swap, hyphen)
- Score candidates against the imported blocklist + edit-distance check
- Per-level 'defensive takeaway' card explaining the heuristic

## Out of scope
- Any real domain registration or network calls
- Serving/hosting content of any kind
- Automated bulk generation of evasions

## Risks & unknowns
- Dual-use framing: must stay clearly educational/defensive and offline
- Detector logic changes over time; keep the ruleset pinned
- Balancing instructive misses vs. an evasion how-to

## Done means
I mutate `metamask.io` three ways, see which the real eth-phishing-detect rules flag and which slip through, and each result teaches me a concrete detection heuristic — with zero network activity.
