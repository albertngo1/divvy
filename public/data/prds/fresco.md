## Overview
Fresco is a 4–6 player concurrent-room party game riffing on *A Fake Artist Goes to New York*. The room collaboratively paints a single subject on the shared TV canvas — but one player is the Faker, and instead of drawing blind, their phone secretly fed them a *decoy* word from the same category. The room must spot whose contributions subtly don't cohere.

## Problem
Tabletop Fake Artist leaks constantly: the paper marker passes hand to hand, and the fake's floundering is obvious because they're drawing on pure nothing. Fresco fixes both — private role delivery and a decoy word that lets the fake paint something *confidently wrong* rather than flailing.

## How it works
The server picks a category (say ANIMALS) and a secret word (OCTOPUS). Every phone PRIVATELY shows OCTOPUS — except the Faker's phone, which privately shows a decoy from the same category (CRAB). Nobody knows their own role for certain beyond what their screen says; the Faker knows they might be off but not that they're *the* fake unless they notice the mismatch at reveal.

Turn order is server-assigned. On your turn, YOUR phone becomes the pen: you drag one continuous stroke, streamed live to the shared TV canvas. Two full rounds = two strokes each. You must contribute something recognizably octopus-ish without making it so obvious the Faker can copy — while the Faker paints crab-ish strokes hoping they blend.

After painting, every phone PRIVATELY votes for the suspected Faker. If the group fingers them, the Faker's phone gets one shot to guess the *real* word (OCTOPUS) for a steal. TV shows only the finished mural + vote tally; who-drew-which-stroke stays color-coded but roles stay hidden until the reveal card flips.

## Technical approach
Host browser tab renders an SVG/canvas mural. Phone PWAs connect over an authoritative WebSocket server (PartyKit / Durable Object). Data model: `{ room, category, realWord, decoyWord, fakerId, turnOrder[], strokes[{playerId, path, ts}], votes{} }`. `realWord`/`decoyWord` are delivered per-connection — never broadcast. During a turn the active phone streams pointer deltas (~30–60Hz, coalesced); server validates it's that player's turn, appends to `strokes`, fans out to all clients. The genuinely hard part is smooth low-latency stroke sync — interpolate points client-side, timestamp server-side, and lock the pen so only the current player can draw (prevents griefing and role leak).

## v1 scope
- 4 players, one round (two strokes each)
- One hardcoded category + word/decoy pair
- Continuous-line strokes only, three ink colors
- One private vote, one Faker guess, static reveal card

## Out of scope
- Scoring across multiple rounds, lobbies, reconnection grace
- Freeform multi-stroke drawing, undo, color picking
- Curated deck of dozens of category/decoy pairs

## Risks & unknowns
- Decoy might be *too* close or *too* far — needs playtest tuning per category
- Stroke jitter over WiFi could make the mural unreadable
- 4 players is thin for a hidden-role vote; may need 5+ to feel fair

## Done means
Four phones join, each privately sees octopus or crab, take turns drawing on the TV mural in enforced order, cast private votes, and the reveal correctly shows the Faker and their decoy — with no phone ever able to see another's word.
