## Overview
Sett is a 3-4 player cooperative keepsake game (a 'sett' is the repeating unit of a tartan). Each player privately authors one stripe-group of the pattern; the server weaves and mirrors every stripe-group into a single symmetric plaid revealed only at the end. The win condition isn't points — it's a named tartan PNG the group keeps.

## Problem
Group 'make something together' toys usually collapse into one loud person driving while everyone watches. Sett gives every player genuine private authorship over a slice of a shared object, then makes the finished pattern a surprise no single person could have predicted — the appeal of a Fair Isle reveal without knowing how to knit.

## How it works
The host TV shows an empty tartan frame and a shared palette. Each phone privately owns ONE stripe-group (a short sequence of colored bands, e.g. 5-8 bands) and shows only that player's own editor: pick a color per band and a width. Crucially, each phone also privately draws ONE secret 'heritage' color it must include somewhere in its stripe-group (like a birthstone) — so nobody can fully predict the palette even by talking. Players may talk out loud to coordinate a vibe ('let's go autumn') but cannot show screens.

When all lock in, the server concatenates the stripe-groups in seat order, then reflects the whole thing (tartans are symmetric) and weaves warp against weft to render the twill — the classic plaid crosshatch where every color meets every other. The TV reveals the finished sett for the first time; the group names it; the host exports a high-res PNG (and a mock 'registration card'). No scoreboard, no winner.

Private simultaneous authorship is load-bearing: the joy is that no one saw the composite or the secret colors until reveal. One passed phone makes it sequential and visible — you'd just be co-editing one pattern, and the surprise evaporates.

## Technical approach
Host tab + phone PWAs + WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, palette[], phase, seats[]}; StripeGroup{playerId, bands:[{color, width}], secretColor}. Weaving is deterministic client-side on the host: build the 1-D sett array, mirror it, then render an NxN canvas where pixel(i,j) picks warp or weft color by a 2/2 twill mask. Sync is phase-gated (design → lock → reveal); no real-time pressure. Genuinely hard part: making an arbitrary set of blind palettes read as a *pleasing* tartan — needs a light constraint (limited palette + width snapping + the twill blend) so random choices still look like cloth, not noise.

## v1 scope
- 3 players, fixed 8-color palette
- One stripe-group each, 6 bands, 3 width choices
- One secret heritage color per phone
- Host weaves + mirrors, renders plaid, Download PNG

## Out of scope
- Custom colors, thread-count realism, multiple setts
- Any scoring or voting
- Fabric-order / print-on-demand

## Risks & unknowns
- Blind palettes may clash into mud; palette curation is the whole risk
- Twill rendering perf on low-end host tabs at print resolution
- Is 'design a stripe' engaging enough for 90 seconds, or too passive?

## Done means
Three phones each lock a private 6-band stripe-group with a secret color; the host weaves them into one mirrored twill tartan revealed at once, the group names it, and the host downloads the pattern as a PNG.
