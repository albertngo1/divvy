## Overview

A 3-player cooperative party game for a living room with a TV and three phones. The room is cataloguing a fragile, newly-discovered photograph. Every private inspection physically damages it. The only output is one postcard PNG — the photo, faded exactly where you looked, with your catalogue notes typeset underneath. There is no score.

## Problem

Co-op party games make information free: you look, you learn, you win. Nothing in the room ever costs anything. Museums have known the opposite for a century — works on paper live at 50 lux because *seeing is consuming*. No party game has made curiosity itself the currency, and none has made the group's greed visible on the thing they take home.

## How it works

The host screen shows: the photograph at ~3% brightness (effectively a black rectangle), a shared budget of **120 lux-hours** ticking down, and three empty catalogue fields. It never shows who is spending or where.

Each phone privately shows: (a) one catalogue question only that player must answer — "what is the sitter holding?", "how many figures are in the doorway?", "what's written on the chair back?"; (b) a draggable **loupe**; (c) a **LAMP** button. Holding LAMP requests image tiles under the loupe from the server. Each 128px tile costs 3 lux-hours off the shared budget and permanently accumulates exposure on that region.

So the entire game is negotiation with no ledger: "I need eight more seconds, I swear I only lit the corner." You can lie. The TV only shows the total falling. When all three press CLOSE THE CASE, phones type their answers, the host renders the postcard — the photo with real bleached patches, the three answers (right or wrong, printed forever), and a condition note ("light damage: moderate") — and QRs it to every phone.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object per room.

State: `{ budget, exposure: Uint8Array(32*32), answers, phase }`. Phones never receive the source image. They request tiles (`{x,y}`) over WS; the server bills, increments the exposure accumulator, and returns a JPEG tile. Billing is therefore authoritative by construction — there is no client-reported duration to trust and no way to look without paying. Phones render the loupe optimistically over a black canvas and paint tiles as they land.

The hard part is not sync — it's *fairness under lag*. A phone on bad wifi must not pay for tiles it never saw, so tiles are billed on send but refunded if unacked in 2s. The exposure grid stays server-side until reveal; broadcasting it live would leak *where* people looked, which deanonymizes who.

## v1 scope

- 3 players, exactly one bundled photograph, three hardcoded questions
- 120 lux-hours, 3 per tile, one continuous round, ~6 minutes
- One 1200px postcard PNG, delivered by QR, deleted after 15 minutes
- No lobby polish: 4-letter room code, no reconnect

## Out of scope

Multiple photos, uploading your own, >3 players, physical print fulfilment, grading answers for correctness, persistent gallery, rematch.

## Risks & unknowns

Budget tuning is everything: too generous and nobody negotiates, too tight and the card prints three wrong answers and feels bad. Does near-black read as "fragile" on a bright TV in a lit room, or just as broken? Does the fade render as beautiful (silver-gelatin bleaching) or as an ugly washed-out JPEG? Phone brightness varies wildly and no calibration exists.

## Done means

Three phones and a host, one 6-minute run, ends with all three phones showing the same PNG whose bleached regions visibly correspond to where the loupes were held; the host meter equals 120 minus tiles served; and devtools confirms no phone can obtain a tile without a billed server round-trip.
