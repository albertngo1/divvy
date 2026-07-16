## Overview
Marginalia is a 3–6 player concurrent-room game where the group turns one page of public-domain prose into a single, densely annotated "haunted library book" — the kind of secondhand paperback where every previous owner argued in the margins. The finished page is an exportable keepsake; nobody wins points. It's for friends who like wordplay, in-jokes, and low-stakes creative chaos.

## Problem
Group creativity games usually funnel everyone through one prompt at a time (Quiplash), so most players wait. And the artifacts they make are ephemeral score-fodder, forgotten by the next round. There's no cozy, simultaneous, everyone-writes-at-once game whose *output is a thing you'd screenshot and save*.

## How it works
The **host TV** shows one page of old prose (a paragraph of Poe, a dull Victorian etiquette manual — chosen for annotation potential). Every word/line is a tappable anchor.

Each **phone privately** shows the same page text plus a **secret persona card** dealt only to that player: *the lovesick reader*, *the furious professor*, *the bored teenager*, *the conspiracy theorist*, *the ghost of the previous owner*. Over ~3 minutes, all players simultaneously and blindly: (1) tap a word or line to anchor a note, (2) choose a mark type (underline, circle, arrow, margin scrawl), (3) type a short annotation in their persona's voice. Nobody sees anyone else's notes while writing — your own marks render on your phone; the shared page stays clean until reveal.

At reveal, the **host TV** animates every note into place — left/right margins, between lines, ink circles around words — producing one gloriously contradictory annotated page. It exports as a **PNG keepsake**.

Then an optional **anonymity phase**: each phone privately attributes each unsigned note to a player. You "win" by staying the most *unguessed* — the artifact and the reveal are the real payoff, not a scoreboard.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). One Durable Object per room holds `{page, players[], personas{}, notes[], phase}`. A **note** = `{id, playerId, anchorWordIdx, markType, text}`. Phones send notes incrementally; server echoes only *count* during compose (never contents) to preserve blindness, then broadcasts the full `notes[]` at reveal. Personas assigned once, dealt privately. The genuinely hard part is **margin layout**: packing N notes around fixed text without overlap — solved with a deterministic column-and-slot allocator keyed off `anchorWordIdx` so host and export render identically. Attribution guesses tallied server-side; "most unguessed" computed at end.

## v1 scope
- One hardcoded page, 3 players, one round.
- 4 persona cards, 3 mark types.
- Compose phase (blind) → reveal → single PNG export.
- One attribution round; show an "unmasked" tally.

## Out of scope
- Multiple pages / page selection.
- Custom marks, colors, drawn (freehand) annotations.
- Accounts, galleries, persistent keepsake history.

## Risks & unknowns
- Margin layout collisions with many notes on one word.
- Personas may not reliably produce funny clashes.
- PNG export fidelity (fonts, ink texture) on mobile Safari.

## Done means
Three phones join one room, each writes ≥2 blind persona-flavored notes, the host renders a single non-overlapping annotated page, and any phone can save it as a PNG. One attribution round runs and names the most-anonymous player.
