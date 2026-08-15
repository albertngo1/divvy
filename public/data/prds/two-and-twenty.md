## Overview

A 7-minute party game for exactly 4 people watching a clip together. Two players are **traders** with private betting terminals. Two are **backers** who never see a single prop or wager — only two live equity curves, unlabeled, not even matched to a friend's name. Backers reallocate capital at halftime. It's a hedge fund with a couch.

## Problem

Group betting games make everyone do the same thing at once, so the room converges on one read and the game becomes a trivia race. The genuinely underused seat is the *allocator* — the person consuming someone else's performance through a squiggly line, with no access to the reasoning. That's the actual passive-to-active flip: you stop watching the show and start reading a P&L.

## How it works

1. TV plays a 3-minute clip in two 90-second halves. Everyone watches.
2. **Traders (private phone).** Every ~15s a prop appears ("does she pick up the phone?") with 8 seconds to size a bet from a 100-chip book. Bets resolve on screen a few seconds later. Your terminal is yours alone.
3. **Backers (private phone).** Two curves, labeled only **Fund I** and **Fund II** — which friend is which is hidden. You see the equity line move, and that's *all*: no props, no bet sizes, no win/loss log.
4. **Carry.** Traders earn 20% of profits and eat none of the losses. A trader who is down has every reason to shove — and that shows up in curve *volatility*, not level. Backers must learn to distrust a straight climb that's actually one lucky whale.
5. **Halftime (20s).** Each backer privately splits 100 chips between Fund I and Fund II — 100/0 is legal. The TV shows total capital per fund, never who allocated it. A defunded trader watches the second half with a dead terminal.
6. Second half runs. Final: backers score their capital, traders score carry, and the TV reveals which friend was which fund.

## Technical approach

Host tab + phone PWAs on a PartyKit / Durable Object room. Model: `Trader{bookId, chips, openBets[], curve:[{t,equity}]}`, `Backer{allocation:{I,II}}`, `Prop{id, text, openAt, resolveAt, outcome}`. The DO is the only writer of equity; phones send `BET{propId, size, side}` and get back their own terminal state. Backers receive a **downsampled, name-stripped** curve stream (one point per 500ms) — the redaction happens server-side, so no client holds a secret it could accidentally render.

Hard part: **prop timing must ride the video, not the wall clock.** The host tab is clock master and emits `PROP_OPEN` keyed to media time; a paused or buffering video must freeze the betting window, or a trader loses their book to a stall. Second: settlement fairness — a bet arriving in the same 100ms as `resolveAt` is accepted or rejected by DO sequence number, and both traders see the identical cutoff.

## v1 scope

- Exactly 4 players, fixed roles assigned at join (first two in are traders), one 3-minute clip
- 8 hand-authored props with hardcoded outcomes fired at fixed media timestamps — no live resolution
- One halftime reallocation, one settlement screen, one identity reveal
- Backers get one 8-character anonymous note to send to a fund

## Out of scope

Role swapping, more than 2 funds, margin calls, shorting, multiple rounds, a clip library, live human resolution, 5+ players.

## Risks & unknowns

Backer boredom is the whole risk: 90 seconds of watching a line move may be dead air, and the anonymous note may not be enough. Two traders may also produce indistinguishable curves on a short clip, making the allocation a coin flip — curve legibility needs a real playtest. Role envy is likely; traders look like they have the fun job.

## Done means

Four phones join, roles split automatically, both traders place at least three bets each without ever seeing the other's terminal, both backers reallocate at halftime from curves alone, a defunded trader's terminal actually goes dark, and the final screen reconciles carry plus capital to the same totals on all five devices.
