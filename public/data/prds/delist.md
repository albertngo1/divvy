## Overview
Delist is a play-money prediction market for digital media disappearing. Players wager on questions like "Will any StudioCanal title be pulled from PlayStation Video before Sept 1?" or "Which of these 10 Steam games gets delisted this quarter?" It turns the quiet dread of revocable licenses into a competitive spectator sport for collectors, cinephiles, and preservationists.

## Problem
Sony just deleted 551 movies people paid for; storefronts silently pull games and albums constantly. This is happening to everyone, yet it's experienced as isolated bad luck. There's no shared scoreboard, no foresight, no collective memory — just outrage after the fact.

## How it works
Each market is a yes/no or multiple-choice question tied to a specific title and deadline. Players spend a weekly allowance of "Vault Coins" to buy shares. Prices move via a logarithmic market scoring rule (LMSR), so the order book reads as a live probability. Resolution is automated: a scraper watches storefront catalog APIs and flips a market when a title's page 404s or loses purchasability. Winners cash out; a seasonal leaderboard crowns the sharpest "delisting oracle."

## Technical approach
Stack: SvelteKit + a small Postgres backend, deployed on a cheap VPS or Fly.io. Markets priced with an LMSR maker (a ~40-line implementation over a `positions` table). The hard part is *resolution as ground truth*: I'll poll public catalog endpoints — Steam's `appdetails` API, iTunes Search API, and the PlayStation Store's GraphQL catalog — on a daily cron, snapshotting availability into a `title_state` history table. A title is "delisted" when it goes from purchasable→unavailable across 3 consecutive scrapes (debouncing regional quirks and outages). Data model: `markets`, `positions`, `titles`, `title_state`, `users`. A resolver worker reconciles pending markets nightly. Anti-gaming: allowance is time-gated, not purchasable.

## v1 scope
- Steam-only markets (cleanest public API)
- ~20 hand-seeded markets on at-risk titles
- LMSR pricing + play-money wallet
- Daily availability scraper + auto-resolution
- One global leaderboard

## Out of scope
- Real money (legal minefield — never)
- PlayStation/iTunes scrapers (v2)
- User-created markets
- Mobile app

## Risks & unknowns
Storefront APIs are unofficial and rate-limited; regional availability makes "delisted" ambiguous. Real-money framing would be gambling — must stay play-money. Cold-start liquidity: markets need enough traders to be meaningful, so seed with a house maker.

## Done means
A visitor can browse ≥20 live Steam markets, buy/sell shares that move the price, and see at least one market auto-resolve correctly after a real delisting — with the leaderboard updating — all without manual intervention.
