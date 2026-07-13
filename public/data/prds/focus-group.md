## Overview
Focus Group is a phone-passed party game for 4–8 people that weaponizes a real cognitive quirk: humans reliably drift toward the *median* option when picking among AI-generated variations (the "central tendency bias" from recent HCI work). Everyone plays a market-research focus group rating design variants; most players are rewarded for blending in, but one secret Contrarian is rewarded for standing out without getting caught.

## Problem
Most social-deduction games invent an arbitrary hidden goal. Here the hidden goal is a genuine, documented human bias — so the tension ("be honest and beige" vs. "be interestingly wrong") is real, and the game doubles as a live demo of how AI variation collapses everyone's taste toward mush.

## How it works
Each round the host screen shows a prompt ("a logo for a funeral-home taco truck") and 5 AI-generated variants labeled A–E. Every player privately picks their favorite on their phone. Scoring:
- **Panelists** score points equal to how many others picked the same variant (rewards convergence on the crowd-favorite — usually the median-safe one).
- **The Contrarian** (one secret role) scores when their pick is the *rarest* non-empty choice — but if a majority vote correctly fingers them at round end, they lose it all.
After picks are revealed, everyone gets 20 seconds to accuse. The friction: to win as Contrarian you must justify a weird pick as if it were the safe one.

## Technical approach
- **Stack:** SvelteKit + a tiny WebSocket room server (Bun/uWebSockets); host screen is a browser, players join by QR to a phone web view. No installs.
- **Content:** variants pre-generated offline in batches via an image model (SDXL/Flux) or cached from an API, stored as static packs so gameplay is zero-latency and offline-capable at the venue. Each pack ships ~40 prompts × 5 variants.
- **The interesting bit:** pack curation must *engineer* a median. For each prompt set we embed the 5 images (CLIP), compute the centroid, and label the nearest-centroid image as the "beige attractor"; playtesting tunes packs so the beige option isn't *too* obvious, or the game degenerates.
- **Data model:** rooms {code, players[], round, roleAssignments}; votes are hashed+committed then revealed to prevent last-look copying.

## v1 scope
- One hosted room, one device as screen, phones as controllers.
- 3 curated packs (~120 prompts total), text + image variants.
- Roles: N Panelists + 1 Contrarian; 8-round match; running scoreboard.
- Commit-reveal voting and a single accuse phase.

## Out of scope
- Live on-the-fly image generation.
- Accounts, matchmaking, cross-venue play.
- More than one hidden role.

## Risks & unknowns
- If the beige option is too obvious, Panelist play is trivial; tuning packs is the real work.
- Contrarian may be too easy to catch at small counts — may need a second decoy role.
- Image-model licensing for redistributed packs.

## Done means
8 people in a room finish a full match on their phones with no installs, the Contrarian wins at least some rounds by hiding, and post-game players can see the "beige attractor" reveal showing the centroid pick almost always drew the plurality vote.
