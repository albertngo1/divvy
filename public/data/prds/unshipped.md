## Overview
Unshipped is a monitoring service that watches a target web app's shipped JS bundles and alerts you when new features, feature-flags, routes, or copy appear—before they're announced. For competitive-intel teams, indie founders sizing up rivals, and journalists on a beat. It does for any SaaS what the Discord-Datamining crowd does for Discord.

## Problem
Modern apps ship code behind flags; the implementation lands in production bundles days or weeks before the feature 'launches.' That leaked surface (route names, flag keys, i18n strings, endpoint paths) is a goldmine of roadmap intel, but reading minified bundles by hand is miserable and nobody bothers to do it continuously for the app they actually care about.

## How it works
You paste a URL. Nightly, a headless browser loads the page, captures every JS asset, beautifies it, and extracts a token set: route strings, object keys that look like flags (`enableX`, `x_v2`), i18n message IDs, API endpoint paths, and component names. It diffs the token set against the last snapshot, clusters genuinely-new tokens, scores them for 'featureyness,' and emails a digest plus an RSS feed. Each new token links to the surrounding beautified code.

## Technical approach
Playwright (Chromium) to load the page and capture network JS responses; hash and store each bundle. Parse with acorn/babel and walk the AST collecting string literals and object keys—more robust than regex against minification. Vendor churn is filtered by fingerprinting known libraries (webpack chunk signatures, package markers). Snapshots and token sets live in SQLite; a diff is a set-difference with trigram fuzzy grouping so renamed-but-equal tokens don't spam you. The genuinely hard part is noise suppression: webpack rehashing chunk names every build makes naive diffs 90% garbage, so each token gets a stability score across the last N snapshots and only tokens that are both new AND stable-looking surface.

## v1 scope
- One target URL
- Nightly cron fetch + snapshot
- Email/RSS diff of new route, flag, and i18n strings only
- Link each finding to beautified source context

## Out of scope
- Reconstructing feature logic or source maps
- Native/mobile app bundles
- Auth-gated internal bundles
- Slack/webhook integrations

## Risks & unknowns
ToS and legal gray area (public assets, but still). Heavy obfuscation or server-driven rendering can hide the surface. False-positive rate from build tooling is the make-or-break UX problem. Some teams gate everything server-side, yielding nothing.

## Done means
Point it at a real SaaS you don't control; the next time they ship a flagged feature, you receive the flag/route name in a digest before their public announcement, with a link to the code.
