## Overview
Autopay grafts the 'symbol-synergy slot machine' loop of Luck Be a Landlord onto your real recurring spend. You import your subscriptions; each becomes a slot symbol with a cost and a quirk. Every 'month' the reels spin, symbols pay out or drain based on adjacency, and you must clear a rising rent (your target savings). It's a budgeting audit disguised as a greedy little roguelike.

## Problem
Subscription budgeting is the definition of passive: money leaves on autopay and you never *look*. Spreadsheets are a chore and shame-based finance apps get uninstalled. Reframe the audit as a game where deleting a subscription is a satisfying build decision, not a guilt trip.

## How it works
Import recurring charges (CSV/manual). Each becomes a symbol: Netflix (steady small payout — you 'use' it), that ghost gym (pure drain), a bundle that pays *more* when adjacent to a related symbol (Adobe next to Adobe). Spins are monthly; between spins you 'shop': cancel a symbol (remove from reel = stop paying it), or discover synergies the game surfaces ('these three overlap — merge?'). Rent (your savings goal) ratchets up each round. Lose a run and it hands you a plain-language verdict: the symbols that only ever drained, ranked by annualized bleed, with cancel links where known. The 'game' is really a Monte-Carlo argument for which subs to kill.

## Technical approach
Stack: React + Zustand, all client-side (finances never leave the device). Import via manual entry or CSV from a bank export; optionally Plaid recurring-transactions endpoint for the brave (opt-in, tokens local). Symbol quirks come from a small curated JSON catalog (~200 popular services tagged: passive-drain, usage-based, bundle-family, annual-spike). Unknown merchants get a generic symbol. The reel engine is a tiny deterministic RNG (seeded) computing per-spin payouts from an adjacency rule table; annualization is straightforward arithmetic. The genuinely hard part is honest fun: the game must reward *cancelling* (shrinking the reel) as the winning strategy, so rent scaling and drain math are tuned so bloated reels reliably lose.

## v1 scope
- Manual/CSV import of recurring charges
- Curated symbol catalog for ~100 common services + generic fallback
- Monthly spin, adjacency payouts, rising rent, lose condition
- End-of-run 'kill list' ranked by annualized drain

## Out of scope
- Live bank sync, actual cancellation automation, multi-account, mobile app.

## Risks & unknowns
- Making 'cancel = win' feel good rather than preachy (core tuning risk).
- Symbol catalog upkeep as services change.
- Privacy optics of any bank integration — default to fully manual.

## Done means
A user enters five recurring charges, plays a run, loses or wins against a rising rent target, and receives a ranked list of which subscriptions drained the most per year — computed entirely in-browser.
