## Overview
Fire Sale is a co-op mobile game for roommates and households who own too much stuff. A faceless Company sets an escalating weekly resale quota; your crew ventures into your real rooms, photographs sellable clutter, and 'delivers' it for appraised cash. Miss quota and you're 'let go' (streak resets).

## Problem
Decluttering is a chore nobody finishes because there's no loop, no stakes, and no shared accountability. Meanwhile Lethal Company nails exactly the missing feeling: a Company that doesn't care about you, an escalating quota that forces you *out into the dark*, tense co-op, and the little dopamine of hauling scrap to the counter. Graft that loop onto real household objects and decluttering gets a spine.

## How it works
- The Company issues a quota (e.g. $60 this week, +25% next).
- Each player 'drops onto a moon' = picks a real room; the app shows a fog-of-war room grid.
- You photograph items; the app appraises each against eBay sold-comps and adds it to the haul.
- Hazard: **Attachment monsters** — sentimental items glow red and block the exit until you clear a snap keep/sell/donate decision (a 5-second timer, Lethal-Company-style panic).
- Deliver the haul before the timer; shortfall carries as debt. Co-op proximity chat while both players scavenge different rooms.

## Technical approach
Stack: React Native client, small Node/Postgres backend, shared room via WebSocket. Appraisal: eBay Browse API + Marketplace Insights (sold/completed medians) keyed off a title the user types or an on-device image classifier suggests; fall back to a category flat-rate when comps are thin. Data model: `household → week(quota) → haul → item(photo, appraised_value, decision)`. Quota escalation is a simple geometric curve tuned to the household's first-week haul. Hard part: appraisal accuracy — image→product→comps is noisy, so v1 leans on user-typed titles and shows a confidence band rather than a false-precise number.

## v1 scope
- Single player, single household.
- Manual item title entry → eBay sold-median appraisal.
- Weekly quota that escalates; streak + 'let go' fail state.
- Attachment-monster timed decision on flagged items.

## Out of scope
- Actual marketplace listing/checkout (you still sell manually).
- Real-time multiplayer proximity voice (text-only v1).
- Donation-value tax receipts.

## Risks & unknowns
- eBay API rate limits and comp sparseness for oddball items.
- Turning genuine sentimental attachment into a timed 'monster' could feel glib — needs a gentle donate path.
- Does the quota pressure actually motivate, or just add guilt?

## Done means
Two weekly cycles run end to end: the app sets an escalating quota, appraises at least ten manually-entered items against live eBay sold comps, enforces the timer, and correctly flips between 'quota met (streak++)' and 'let go (streak reset)'.
