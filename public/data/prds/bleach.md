## Overview
Bleach is a live desktop wallpaper of a coral reef whose vibrancy mirrors your credential hygiene. Fresh secrets = vivid, teeming reef; certs and keys nearing expiry fade; expired or leaked secrets bleach bone-white or drift as dead fish. Built for homelabbers and devs who ignore ops dashboards but stare at their desktop for ten hours a day. It's the trending secrets-manager (Infisical) crossbred with Steam's #1 toy (Wallpaper Engine): a serious tool turned ambient, and a toy turned dangerously useful.

## Problem
Expired TLS certs and stale/leaked secrets cause real outages, and you always find out the worst way — TLS breaks, a key leaks, a token 401s in prod. Dashboards exist but get ignored; nobody opens Vault to check posture. But a signal you literally can't avoid seeing, that costs zero attention and carries zero guilt until it matters, actually nudges behavior.

## How it works
A small agent polls your secret sources and computes a per-secret 'health' scalar (mostly days-to-expiry, plus leak/overdue-rotation flags). Each secret is bound to a coral or fish: healthy = saturated color + lively sway; approaching expiry = desaturating and slowing; expired/leaked = bleached white or a fish rolling belly-up. Overall reef vibrancy is your posture at a glance. Crucially it's unlabeled — a shoulder-surfer sees decor, you read the reef. Clicking through opens the real ranked list.

## Technical approach
A Go or Rust agent + a WebGL/Canvas reef you set as wallpaper (via `swww`/Wallpaper-Engine web layer on Linux/Windows, or a macOS live-wallpaper shim). Sources: Infisical REST API, local x509 cert scan (`notAfter` parse), later Vault, AWS key `CreateDate`, and `gh api` secret-scanning alerts. A health function maps each source into a common [0,1] scalar via a days-to-expiry color LUT plus discrete bleach events. Render: instanced coral/fish sprites with Perlin-driven motion, each entity's color/energy driven by its secret's health vector, on a seeded stable layout so the reef is recognizable day-to-day and accretes like a tank you've kept for a year. The hard part is normalizing wildly heterogeneous secret sources into one comparable health scalar, and encoding status subtly enough to stay non-obvious yet legible to the owner.

## v1 scope
- Read-only, two sources: local cert files + Infisical
- 10 corals, days-to-expiry → color, one bleach state for expired
- Static web page you set as wallpaper, cron-refreshed JSON

## Out of scope
- Rotating/renewing secrets from the wallpaper
- Vault / AWS / GitHub sources
- Multi-machine aggregation, mobile

## Risks & unknowns
Encoding real security state into visible art is itself a tiny leak — anyone who learns the mapping learns your posture. Heterogeneous sources are genuinely awkward to normalize. It could tip more toy than useful if the signal is too subtle.

## Done means
A cert expiring in under seven days visibly bleaches its coral within one refresh cycle, and an observer without the legend cannot name which secret is failing.
