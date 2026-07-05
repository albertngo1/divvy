## Overview
Deadclick is a small SaaS that continuously audits a website's interactive elements for the 'if you're a button, you have one job' failure modes: fake affordances, silent failures, and overloaded controls. It's sold to SMB e-commerce shops and web agencies who need both conversion hygiene and a defensible accessibility report.

## Problem
Static a11y linters check markup, not behavior. Real revenue leaks come from buttons that *look* clickable but do nothing, submit buttons with no loading/disabled state that let anxious users double-charge, and 'Save' buttons that also silently navigate away. These only show up when something actually clicks them and watches what happens.

## How it works
You enter a URL (and optionally a login recipe). Deadclick crawls key pages, enumerates every element that *looks* interactive (cursor:pointer, role, button/a tags, ARIA), and drives each one with Playwright in an isolated context. For each click it records: did any DOM/network/navigation change occur (else → ghost button)? Does rapid double-click fire two identical requests (else good; if yes → double-submit risk)? Does one click trigger more than one distinct side-effect (→ multi-job)? Results become a ranked report with screenshots and a shareable PDF; a nightly cron re-runs and diffs, alerting via email/Slack on regressions.

## Technical approach
Stack: Playwright (Chromium) workers in a queue (BullMQ + Redis), Node/Fastify API, Postgres for runs/findings, S3 for screenshots. Detection heuristics: wrap each candidate in an instrumentation harness that snapshots `MutationObserver` deltas + intercepted `fetch`/XHR + URL before/after click, with a short settle timeout. Double-submit: fire two clicks 80ms apart, hash outbound request bodies, compare. Multi-job: cluster side-effects (navigation vs mutation vs network) and flag >1 category. The hard part is candidate selection without exploding — computed-style + role heuristics generate false positives, so a per-site allow/ignore list and confidence scoring are essential. Why now: the EU Accessibility Act's 2025 enforcement makes interactive-element correctness a legal line item agencies can bill against.

## v1 scope
- Single-URL scan (no crawl), manual page list
- Ghost-button + double-submit detection
- HTML report with screenshots
- One-page pricing, Stripe checkout

## Out of scope
- Full-site crawler, auth-walled flows
- Multi-job clustering (v2)
- CI/GitHub integration
- Non-Chromium browsers

## Risks & unknowns
Heuristic false positives erode trust fast; needs tuning against real sites. SPAs with heavy async make 'settle' timing tricky. Agencies may want white-label, changing the product. Legal-report framing must not overpromise compliance.

## Done means
Pointed at a demo store with one deliberately dead `<div class="btn">` and one no-loading-state submit button, Deadclick's report correctly lists exactly those two findings with screenshots and no false positives on the working buttons.
