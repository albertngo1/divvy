## Overview
Sigil is a 3-6 player concurrent-room drawing game where the room co-creates one heraldic crest (a fake coat of arms) as a keepsake. Every player draws a single abstract glyph on their own phone, blind to the others, from a private prompt. The server arranges the glyphs into one composed emblem shown on the host TV. Win is the artifact plus staying anonymous: nobody should be able to reliably match glyph to author.

## Problem
Collaborative drawing games mostly funnel to a single passed device or a shared canvas where the first stroke anchors everyone. That kills surprise and makes per-phone architecture pointless. Sigil makes each phone a sealed booth: divergent private prompts drawn simultaneously mean the assembled crest genuinely surprises the whole room, including its own authors.

## How it works
The host TV shows an empty shield frame and a house 'motto' theme. Each phone PRIVATELY receives one heraldic 'charge' prompt drawn from a divergent set — e.g. 'something that bites,' 'a broken tool,' 'a thing that shouldn't fly' — plus a small drawing canvas with a fixed 3-color heraldic palette and a stroke limit. Players draw simultaneously and blind; no one sees any other glyph, and the TV shows only anonymized 'inked' progress pips. On lock, the server normalizes each glyph (crops, recolors to the shared palette, scales) and composites them into fixed quarters/bends of the shield with generated ornamental borders, producing one coherent-looking crest revealed on the TV. That emblem exports as a PNG/SVG keepsake. Then each phone PRIVATELY submits a guess attributing every quarter to a player. The group wins the anonymity layer if no glyph is majority-correctly attributed — you 'earned your place on the shield' as a ghost. No scoreboard.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: Room { theme, charges: [{playerId, prompt, strokes:[...], locked}], layout, guesses }. Phones send vector strokes (normalized point arrays), not bitmaps, so the server can recolor/rescale deterministically. The genuinely hard part is deterministic composition: packing N heterogeneous glyphs into shield regions with consistent visual weight and auto-generated borders so the result reads as one designed crest rather than a collage — plus keeping every glyph private until the single reveal broadcast. Rendering is SVG on the host for crisp export.

## v1 scope
- 3 players, one round, fixed 3-region shield layout
- One private charge prompt + palette-locked stroke canvas per phone
- Simultaneous blind draw, server normalize + composite, single TV reveal
- SVG/PNG export of the crest

## Out of scope
- The attribution guess-and-anonymity-win phase (add after artifact works)
- Variable player counts / dynamic shield subdivisions
- Motto text authoring, animation, galleries, accounts

## Risks & unknowns
- Auto-composition may look like a messy collage, not a crest
- Divergent prompts must reliably yield glyphs that read at small size
- Stroke normalization across phone screen sizes

## Done means
Three phones each draw one glyph blind from a distinct private prompt, and the host TV reveals a single composed shield combining all three into one crest that exports as an SVG/PNG — with no glyph visible to anyone until the reveal.
