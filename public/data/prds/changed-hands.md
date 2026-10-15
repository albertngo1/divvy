## Overview
Changed Hands is a small monitoring service for freelancers, agencies and small IT teams that run WordPress sites and managed browser fleets. It watches the *people* behind the code you depend on, not the code. When a plugin or extension changes maintainer, it alerts you and holds that update for review.

## Problem
A common supply-chain attack is to buy a popular plugin or extension from a tired solo developer, wait a few weeks, then ship an update with an ad injector or a backdoor. Vulnerability scanners like wpprobe and WPScan only catch known CVEs, after the damage is done. The ownership change itself is the warning sign, and it is public, but nobody is watching it.

## How it works
1. Paste a site URL, upload a `wp plugin list` export, or upload a Chrome policy JSON with extension IDs.
2. Changed Hands snapshots each dependency's provenance: committers, author profile, support-forum responders, homepage domain, WHOIS registrant, privacy-policy URL and the signing or publisher account.
3. Each night it diffs those snapshots. A new committer, a changed author URL, a homepage domain that moved registrars, or a jump in requested permissions raises a **custody event**.
4. Events are scored and sent by email, Slack or webhook. An optional WP mu-plugin blocks auto-update for flagged slugs until you click Accept.

## Technical approach
- **Sources:** the WordPress.org plugins API (`api.wordpress.org/plugins/info/1.2/`), plugins SVN logs (`svn log` on `plugins.svn.wordpress.org/<slug>` for committer usernames), profiles.wordpress.org; Chrome Web Store detail pages and CRX manifests via the update endpoint; RDAP for domains.
- **Data model:** `dependency(id, ecosystem, slug)`, `snapshot(dep_id, ts, facts_json)`, `custody_event(dep_id, kind, before, after, score)`.
- **Scoring:** weighted rules (new SVN committer = high, author domain changed = high, new permission `<all_urls>` = critical, a dormant plugin waking up after 18 months = medium), tuned against historical acquisitions you can rebuild from SVN history.
- **Stack:** Go worker plus Postgres, with a small Next.js dashboard.
- **Hard part:** separating benign handoffs (a company hires a second developer) from sales. The backtest corpus of known malicious acquisitions is the moat.

## v1 scope
- WordPress.org plugins only
- Signals: SVN committer set and author URL
- Email alerts
- Free for 10 plugins, $9/mo for 200

## Out of scope (for now)
- npm and PyPI
- Code diffing or malware analysis
- Firefox add-ons

## Risks & unknowns
- SVN log scraping at scale needs to be polite and incremental.
- Chrome Web Store has no official API, so scraping is fragile.
- False positives will cause alert fatigue.

## Done means
Given a list of 50 real plugin slugs, a backtest over the last 3 years of SVN history flags at least 3 documented ownership transfers. A live run sends an email within 24h of a committer change injected on a test plugin.
