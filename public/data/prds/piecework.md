## Overview
Piecework turns family chores into a tiny trading floor. Parents list chores as market instruments; kids place limit orders to do them for a price; a real price-time-priority matching engine clears the trades. It's a chore app for households that find allowance apps boring — and a stealth intro to how markets actually work.

## Problem
Chore charts are static and joyless: fixed points, no negotiation, no signal about what actually hurts to do. ccxt and every exchange prove that order books elegantly express supply and demand — but nobody's pointed that mechanic at the one marketplace every home already runs badly: who does the dishes. The itch is a chore system where undesirable jobs naturally get *more* valuable until someone bites.

## How it works
Each chore is an instrument (DISHES, TRASH, VACUUM). Parents post 'asks' with a reserve budget; kids post 'bids' (I'll do DISHES for 250 scrip). The matching engine clears when bid meets ask, assigning the chore and escrowing scrip that's released on parent verification. A surge rule raises the clearing floor when a chore sits unfilled past a deadline (Sunday dishes get expensive), and a recurring chore that nobody bids on visibly climbs in price — the market tells you what's genuinely hated. A simple depth view shows the current book; scrip cashes out to allowance or screen time.

## Technical approach
SvelteKit + SQLite (better-sqlite3), phone-first PWA, self-hostable on a homelab box. The core is a compact price-time-priority matching engine (a few hundred lines): two sorted books per instrument, `match()` on each new order, trades written to an append-only ledger table (`orders`, `trades`, `balances`, `settlements`). Surge is a scheduled job that bumps an instrument's reference price by a decay-adjusted step per elapsed deadline. Verification is a parent tap that moves escrow → balance. No real money; scrip is an internal integer ledger with double-entry invariants checked on every write. The hard part is social, not technical: keeping it fun instead of a cutthroat tax on affection.

## v1 scope
- Instruments, limit orders, one matching engine, escrow + parent verify
- Surge-on-deadline for unfilled chores
- Two roles (parent/kid), scrip balances, a plain order-book view

## Out of scope
- Real payments, multiple households, mobile push
- Shorting, futures, or any derivative a clever 12-year-old will request

## Risks & unknowns
- Gamifying chores can breed resentment or exploit siblings
- Kids may collude or refuse to bid, starving the book
- Needs guardrails (price caps, mandatory chores outside the market)

## Done means
Two accounts can post bid/ask on DISHES, the engine matches and escrows scrip, an unfilled chore surges past its deadline, and parent verification settles the ledger with balances that reconcile to zero.
