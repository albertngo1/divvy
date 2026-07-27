## Overview

A 7-minute live market game played against an end-credits crawl scrolling on the host screen. Four players, 100 credits each, one 3-minute roll of names nobody has ever read. For groups who sit through the post-credits sting anyway.

## Problem

End credits are the purest passive consumption in existence — hundreds of human names, scrolling, ignored, every single time. And most prediction games resolve once, at the end, which is a terrible shape for a market: no tape, no price action, no panic. A crawl resolves *continuously*, line by line, for three straight minutes. That's a ticker.

## How it works

**Pre-roll (45s):** the TV shows 8 **instruments** with fixed listed prices. An instrument is a predicate over credit lines: `contains "ASSISTANT"`, `contains "PRODUCER"`, `a surname starting with M`, `a name that repeats`, `department: STUNTS`, `a line with 3+ ALL-CAPS words`. Prices are public. **Shares outstanding are hidden.** Each phone privately spends its 100 credits into a portfolio.

**The crawl (~3 min):** the TV scrolls the credits. Every line that matches an instrument fires a **dividend** — a fixed 12-credit pool split across *every share held by everyone* in that instrument. The TV highlights the matching line and flashes DIVIDEND with no attribution. Your phone pulses privately and shows your cut. So the obvious buy — PRODUCER — fires constantly and pays you almost nothing, because you're diluted by three other people who thought the same thing.

**Selling:** one tap liquidates a position at the current mark (listed price × remaining crawl fraction). Sells hit the TV tape anonymously: *"SOMEONE SOLD GAFFER."* That tape is the only public information channel in the game and it is the entire paranoia engine — is the seller dumping because they know the stunt department is coming, or baiting you off a position that's about to print?

**Private (phone):** portfolio, cash, per-instrument P&L, sell buttons. **Public (TV):** the crawl, the price board, the anonymous sell tape, cumulative dividends paid per instrument (you can infer dilution but never ownership).

## Technical approach

PartyKit Durable Object as the clock. The crawl ships pre-tokenized: an array of lines with per-instrument match sets precomputed at build time — zero regex at runtime. The server ticks `lineIndex` at a fixed rate and emits `tick` + `dividend` events; the host interpolates a smooth scroll between ticks with a fixed display lead, purely cosmetic. Phones never need a synced clock because the server owns line index.

The genuinely hard part is **sell fairness under lag**. A player must not sell after seeing a line that already fired on the TV. Dividends for line N settle against the share ledger as of line N−1's close, and sells arriving inside a 250ms guard band around a dividend are rejected with a visible TOO LATE on the phone. Model: `Room{crawlId, lineIndex, phase}`, `Instrument{id, price, matchLines}`, `Position{playerId, instrumentId, shares}`, append-only event ledger for settlement replay.

## v1 scope

- 4 players, one bundled 180-line hand-authored crawl, one run
- 8 instruments, 100 credits, 45s trading window
- Sell only — no re-buying mid-crawl
- Host = crawl + price board + sell tape; phone = portfolio + sell
- Final leaderboard, room code, no accounts

## Out of scope

Buying mid-crawl, shorting, volume-responsive prices, scraping real film credits, multiple crawls, spectators, reconnect.

## Risks & unknowns

The crawl may read too fast to feel fair — the highlight flash has to carry it. Instrument authoring *is* the game design, and a badly tuned set makes one instrument dominant. No-re-buy risks a dead final minute; late-weighted dividends are the obvious fix if playtest confirms it.

## Done means

Four phones plus a host finish one crawl in under 7 minutes; the ledger replay proves every dividend split matches share state as of the prior line; a sell inside the guard band is rejected and shown as TOO LATE; and at least one player dumps a position purely because the anonymous tape spooked them.
