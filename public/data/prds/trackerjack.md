## Overview
Trackerjack is a browser-extension idle/tower-defense game where every tracker your ad-blocker stops becomes in-game currency and monsters to defend against. The more you browse the modern web, the more 'trackers' spawn as enemies — and the resources you harvest from blocking them let you build defenses. It's for privacy nerds who want their EasyList subscription to feel like it's *doing* something.

## Problem
Ad-blocking is invisible and thankless — a counter that ticks up and nothing else. People have no visceral sense of how relentlessly they're tracked, and no reward loop for the blocking already happening in the background.

## How it works
The extension observes blocked requests (matched against EasyPrivacy/EasyList rules). Each blocked tracker domain becomes an enemy 'type' — Google Analytics is a common grunt, an obscure fingerprinter is a rare mini-boss. Blocking them yields 'scrap' you spend on towers in a small always-running lane. It's idle: the game advances while you browse, so a heavy-browsing day funds a wave of upgrades. A weekly leaderboard ranks players by trackers-slain — turning 'I'm the most-surveilled' into a badge of honor.

## Technical approach
Stack: a Manifest V3 browser extension. Use the `declarativeNetRequest` API with EasyPrivacy/EasyList rulesets and the `onRuleMatchedDebug`/feedback path (or a companion `webRequest` listener where permitted) to count blocks by domain. Domains map to enemy archetypes via a hashed bucketing function so new trackers get deterministic-but-varied stats. Game state (scrap, towers, wave) lives in `chrome.storage.local`; the game itself is a tiny Canvas loop in the popup + an offscreen document for idle accrual. Data model: `TrackerKill {domain, category, ts}` aggregated into `resources` and `codex` (a bestiary of trackers you've encountered). The hard part is MV3's constraints on observing blocks — the count APIs are limited/sampled, so I'll reconcile estimates against ruleset match debugging.

## v1 scope
- Count blocked trackers via declarativeNetRequest
- One defense lane, 3 tower types, scrap economy
- Tracker 'bestiary' of domains you've encountered
- Local-only, single player

## Out of scope
- Actual leaderboard/backend (v2)
- Firefox port
- Real ad-blocking (piggyback on user's existing blocker)
- Multiple maps

## Risks & unknowns
MV3 severely limits observing network blocks — the core signal may be sampled or unavailable, forcing estimation. Store review scrutiny for anything touching requests. Must not degrade browsing performance.

## Done means
Browsing a tracker-heavy site visibly spawns enemies in the popup within a session, killing them accrues scrap that buys a working tower, and the bestiary logs at least the real distinct tracker domains encountered.
