## Overview
Sunk Cost is a 3–6 player party auction played on a shared host screen with each player's phone as a private bidding paddle. It takes the most tedious part of a real auction — hidden simultaneous bids, tracked banks, and the agony of overpaying — and makes it clean, fast, and merciless. It's for people who like poker faces and hate math homework.

## Problem
In-person auction games drown in bookkeeping: everyone hides a fistful of chips, commits secretly, reveals at once, and someone has to reconcile who now owns what. Simultaneous sealed bids are basically impossible to run fairly with human hands. And the sharpest auction format — the all-pay auction, where you forfeit your bid whether you win or lose — is unplayable in person because nobody trusts the reveal. Phones fix the trust and the math in one stroke.

## How it works
Each player starts with a private bank of 100 credits. Each round the host screen shows one Lot worth a fixed point value (e.g. "Vase — 8 pts"). Every phone PRIVATELY shows: your remaining bank, a bid slider (0 → your bank), and a COMMIT button. Bids are simultaneous and secret. The host screen shows only a countdown and who has locked in — never the amounts.

When the timer ends the server resolves: highest bidder wins the Lot's points, but EVERY player's bid is deducted from their bank — win or lose, the credits are sunk. The host reveals bids dramatically ("You paid 40 for nothing"). Ties split the Lot. Because your bank is private, the whole game is reading whether a rival is about to blow their stack — and sometimes lobbing a bid you expect to lose purely to bleed them dry before the big Lot.

PRIVATE per phone: your bank, your slider position, your commit state. SHARED on host: the Lot, the clock, lock-in dots, and the post-round reveal + running point totals.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], lots[], currentLot, phase}; Player{id, name, bank, score, currentBid, committed}. The server is the sole authority on banks and resolution — clients never see another player's bank or live bid. Sync: phones send `{bid, committed}`; server broadcasts only redacted state (lock-in booleans + clock) until reveal, then emits full results. The genuinely hard part is fairness at the buzzer: late/last-millisecond commits. Solve with a server-authoritative deadline (server timestamp, not client), a soft ~300ms grace, and locked slider once committed. Reconnect restores bank from server; a disconnected player auto-commits their last slider value.

## v1 scope
- 3 players, one shared room code, no accounts.
- Exactly 3 Lots in a fixed sequence, then a winner screen.
- One bank size (100), integer bids via slider.
- All-pay resolution + dramatic reveal.

## Out of scope
- More auction formats (Vickrey, Dutch), variable bank sizes.
- Spectators, rejoin-as-new, persistent stats.
- Animations beyond a basic reveal, sound.

## Risks & unknowns
- All-pay may feel punishing to newcomers — needs a one-line rules card so the first sunk bid doesn't feel like a bug.
- 3-player bluffing might be too readable; may need 4+ to sing.
- Buzzer-fairness perception: players must trust the deadline is honest.

## Done means
Three phones join a host code, each privately bids on 3 Lots without ever seeing another's bank, the server correctly deducts every bid and awards points to the top bidder, and the host shows a correct final ranking — verified by a scripted 3-player run where hand-computed banks match the screen.
