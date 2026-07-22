## Overview
A hidden-role photo game for 3–5 players plus a shared host screen. Everyone believes they're looking at one identical photograph. Secretly, exactly one player's private copy has a single detail retouched. Nobody is told their own status. The room talks about the picture until it can point out the person unknowingly describing a photo that doesn't exist.

## Problem
Social-deduction games usually hand the imposter a *known* secret and ask them to lie well. That rewards confident liars and punishes quiet players. Airbrush flips it: the imposter is sincere. The itch is the creeping self-doubt — *am I the one seeing the doctored version?* — and the comedy of someone earnestly defending a detail nobody else can see.

## How it works
The server picks a busy, detail-rich stock photo (a cluttered desk, a street scene) and generates ONE altered variant with a single plausible edit: a clock hand moved, a mug recolored, an extra pigeon, a sign's word changed. One random player is dealt the altered variant; everyone else gets the original.

**Private (each phone):** the player's own full-res photo, pannable/zoomable. No indication whether it's original or altered. A one-line secret framing: *"One of you sees a retouched copy. It might be you."*

**Shared (host TV):** never shows any photo. It shows a turn order, a countdown, and — at the end — a vote tally and the big reveal (both images side by side with the diff circled).

Flow: three quick rounds of testimony. On your turn you say ONE concrete true-to-you sentence about the photo ("the cyclist's helmet is yellow"). You want to sound grounded without accidentally naming the edited region — but you don't know where the edit is, so every statement is a small gamble. After testimony, each phone privately casts one accusation. Majority-accused player is revealed alongside the images.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, turnOrder}`, `Player{id, imageVariant:'orig'|'alt', vote}`, `Photo{origUrl, altUrl, diffRegion}`. Images are pre-generated pairs shipped as static assets (a curated pack of ~12), so no live editing. Sync strategy: server holds phase + turn pointer, broadcasts transitions; phones request their own image URL over an authenticated channel so no phone can peek at another's variant. The genuinely hard part isn't real-time — it's **asset curation**: the single edit must be subtle enough to miss on your own screen yet unambiguous at reveal. That's hand-tuning, not code.

## v1 scope
- 3 players, exactly one round of the full loop.
- One hand-made photo pair, one edit.
- Text-typed testimony (no audio), one accusation vote each.
- Host reveal screen with diff circle.

## Out of scope
- Multiple photo packs, procedural edits, difficulty tiers.
- Scoring across rounds, spoken/transcribed testimony.
- More than one altered player.

## Risks & unknowns
- Edit calibration: too obvious and the imposter spots it themselves; too subtle and reveal feels unfair.
- With 3 players a 2-vs-1 split can out the imposter fast; may need 4–5 or two edited players to hold tension.
- Zoom/pan on tiny screens must feel good.

## Done means
Three phones each load a different-URL image (one altered), players type testimony in turn on the host TV, everyone votes on their phone, and the reveal correctly shows who held the retouched copy with the diff highlighted — end to end, no phone ever able to load another's variant.
