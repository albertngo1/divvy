## Overview
Buffer Zone reframes personal cash-flow as a 7-Days-to-Die-style horde-night defense. Your recurring bills are enemy waves that arrive on their actual calendar due dates; your job is to build and maintain a cash buffer wall thick enough that no wave breaches zero. For people who have income and bills but no visceral feel for the *timing* of cash flow — the paycheck-to-paycheck-adjacent who get surprised by a due-date pileup.

## Problem
Budget apps show you categories and totals but flatten *time*. The real pain is sequencing: three bills landing before payday, an annual renewal ambushing you. A monthly pie chart doesn't make you feel an incoming wave the way a countdown does.

## How it works
You enter recurring bills (amount, cadence, due date) and income events. Buffer Zone lays them on a horizontal timeline as approaching 'waves' — each bill is a monster sized by amount, marching toward the due-date line. Your **buffer** is the wall height (current balance). When a wave hits, it subtracts; if the wall would drop below zero, it 'breaches' — a red event you must prevent. You defend by building **buffer** (skip/cut discretionary spend to raise the wall) and placing **traps** (schedule a transfer, move a due date, pause a subscription). Survive a month with no breach = you clear the night. A streak of clean months is your score. It's single-player, honest, and a little dramatic.

## Technical approach
Local-first PWA: Svelte + IndexedDB, no server, no bank credentials in v1 (manual entry — trust and simplicity). Model bills as recurrence rules (RRULE via `rrule.js`) expanded into a dated event stream; income likewise. A forward simulation walks the next 60 days summing events into a running balance to find the minimum (the thinnest point of your wall) and flags any negative dip as a predicted breach. Timeline render is SVG with waves positioned by `daysUntilDue`. **The genuinely hard part** is honest projection — irregular/variable bills and one-offs — plus keeping the game framing from trivializing real financial stress (tone matters; it should motivate, not mock). Optional later: import via OFX/CSV.

## v1 scope
- Manual entry of recurring bills + paydays with RRULE cadence
- 60-day forward timeline showing waves and the min-balance 'thinnest wall' point
- Breach prediction (any day the projected balance goes negative)
- Clean-month streak counter, fully local, no accounts

## Out of scope
- Bank/Plaid sync, multi-account, investments
- Variable-income modeling, forecasting AI
- Multiplayer/leaderboards

## Risks & unknowns
- Manual entry friction; people abandon before value
- Game framing could feel flippant about real money anxiety
- 'Gamified budget app' is a crowded, skeptical space

## Done means
Enter three bills and one payday, see them as dated waves on the timeline, watch the simulator correctly flag the pre-payday day your projected balance dips below zero, then pause one subscription and see the breach clear.
