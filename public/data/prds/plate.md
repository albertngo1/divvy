## Overview
Plate is a 3-5 player hidden-role deduction game built around Ishihara-style color-dot plates. Everyone stares at what looks like the same plate on their own phone; one player (the imposter) is secretly shown a plate that resolves to a DIFFERENT embedded number. For groups who like Spyfall/Werewolf but want something visual, fast, and perceptual rather than talky.

## Problem
Most hidden-role games hand the imposter a secret WORD or ROLE outright, so the imposter always knows they're the odd one and simply lies well. The itch: a deduction game where the divergence lives in PERCEPTION itself. The imposter reads a genuinely different private view and may not realize they've been fed a lie — so the tells are honest confusion, not acting. Good liars lose their edge.

## How it works
Round start: host TV shows a title card and a countdown. Each phone PRIVATELY renders an Ishihara plate — a dot field with an embedded digit. Real players' plates all embed the same number (say 8); the imposter's plate embeds a sibling number (3) using the same palette and dot layout family. Nobody sees anyone else's plate.
Phase 1 (blind clue): each phone prompts "one-word clue about your number — not the number itself." Everyone types simultaneously; nothing is shared until all are in.
Phase 2 (reveal): the host TV lists every clue in random order — e.g. "infinity", "hourglass", "snowman" … "trident". One reads off.
Phase 3 (vote): each phone shows the player list; everyone secretly votes the imposter. Host reveals votes, the true number, and whether the group caught the divergent view. Imposter scores by surviving; the group scores by catching them.
Host screen: title, timer, anonymized clue list, vote tally. Phones (private): your plate, your clue box, your vote — never another player's plate.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one object per room code). Data model: Room{code, phase, players[], paletteSeed, imposterId, trueNumber, imposterNumber, clues{playerId}, votes{playerId}}. Plates are generated client-side from a seeded generator given (number, paletteSeed), so the server only ships small integers, never images. Sync: server owns phase transitions; phones POST clue/vote, server gates on all-submitted, then broadcasts. The genuinely hard part: generating plates that are siblings — identical dot layout and count, differing ONLY in the figure mask — so the sole tell is the clue, not "my plate just looks weird." A naive generator leaks the number via dot density.

## v1 scope
- 3-5 players, one room, one round
- Two hardcoded plate pairs (8/3, 6/5)
- Single imposter, text clues only
- One shared TV, LAN/Tailscale play

## Out of scope
- Multi-round scoring, streaks
- A true accessibility mode for color-blind players (irony noted)
- Voice clues, custom numbers, public matchmaking

## Risks & unknowns
Actually color-blind guests can't read plates (need an opt-out / high-contrast alt-figure mode). Plate-generator quality IS the game. If the number pair is too semantically distant, the clue phase outs the imposter instantly — tune pairs to be visually and semantically close (8/3, both curvy).

## Done means
Four phones join by room code, each sees a private plate (three identical, one divergent), all submit blind clues, the host shows an anonymized clue list and a working secret vote, and the reveal correctly names the imposter and both numbers.
