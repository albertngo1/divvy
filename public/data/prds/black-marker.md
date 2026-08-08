## Overview

A 3-player, 6-minute cooperative game for people who like found poetry. The output is a blackout poem: a real page with fourteen words left standing and everything else covered in marker. No score, no winner, one image everybody keeps.

## Problem

Erasure poetry is a lovely solo craft and a terrible group activity — everyone crowds one page and whoever holds the marker holds the poem. Meanwhile most "make a thing together" party games are additive: everyone contributes a piece and the machine glues them up. Almost nothing is *subtractive*, and subtraction is where the tension lives, because deleting is irreversible and the budget is shared.

## How it works

- The TV shows one fixed page of dense real prose — an appliance manual, a lease, a Wikipedia section — about 200 words, laid out once and never reflowed.
- The server secretly assigns **every word on the page to exactly one player**, roughly evenly, content words dealt round-robin first so nobody gets stuck holding only prepositions.
- Each phone shows the same page geometry, but only *your* words render as text. Everyone else's words are gray dashes at the correct width, in the correct position. You see the page's shape and your own scattered vocabulary inside it.
- The room shares a **KEEP BUDGET of 14 words**. Tapping one of your words keeps it. Kept words appear instantly on the TV, in place, in black.
- Talking is the whole negotiation: "I've got a *because* halfway down line four." You may not show your phone. Misremembering your own inventory is the comedy.
- Reading order is always page order, so a word kept late can land *before* a word kept early — the poem's meaning shifts under you as the budget drains.
- Any player may propose SEAL; all three must hold a button simultaneously (300ms grace). The TV renders the true blackout — kept words in black, everything else under solid bars — and a QR gives all three the identical PNG. Timing out seals whatever you had.

**Private vs shared:** phone = your word inventory as text, everyone else's as dashes, your keep toggles. TV = the composite poem in page position and the budget counter. Ownership is never shown, ever, to anyone.

## Technical approach

PartyKit Durable Object. `Page{id, tokens:[{i, text, x, y, w, ownerId, kept}]}`, `Room{pageId, budget, phase, sealHolds}`. Each phone receives its own tokens' text plus `(i, x, y, w)` tuples only for everyone else's — other players' strings never cross the wire to you. Three hard parts: (1) the budget is a server-side compare-and-swap — two keeps racing at budget 13 must not both land; the loser gets a distinct "budget lost" buzz. (2) Phone and TV must agree on page geometry across wildly different aspect ratios: fix the page as one SVG with a shared `viewBox` so token coordinates are layout-independent and both clients just scale. (3) The seal handshake needs the grace window or perfect simultaneity becomes the game.

## v1 scope

- Exactly 3 players, one hardcoded page (~200 tokens), budget 14, 6-minute clock
- Tap-to-keep only; no undo
- One seal, PNG export via QR
- No accounts, no rejoin, no page selection

## Out of scope

Uploading your own text, 4+ players, undo/history, a saved gallery, printing, any keyboard input at all.

## Risks & unknowns

The corpus is everything — a page of pure legalese may contain no poem; needs 3–5 hand-curated pages and real playtesting. 14 may be the wrong budget. The no-peeking honor rule is load-bearing and unenforceable; if a group ignores it the game evaporates.

## Done means

Three phones, one page. Each phone renders only its own ~70 words as text and the rest as dashes, verified in devtools — no other player's string is ever in a payload. The room seals inside six minutes and all three scan one QR to receive the same blackout PNG.
