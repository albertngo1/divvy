## Overview
Marginalia is a cozy, non-competitive party game for 3–6 players who share a host screen and each hold a phone. The group collaboratively marks up a single short passage of text — underlining, circling, scrawling margin notes and doodles — until it looks like a secondhand book that's been read to death. The win condition is the artifact itself: a marked-up page everyone exports and keeps.

## Problem
Most party games are combative and disposable. There's an itch for something warm that produces a *thing* at the end. And there's a specific delight in a used book full of strangers' annotations — arguments in the margins, hearts around a line, a bored kid's doodle. Marginalia manufactures that palimpsest live, in five minutes, with your friends' voices in it.

## How it works
The host screen shows one short public-domain passage (a poem stanza, a paragraph of a story). Each phone loads the SAME passage but privately receives a secret **persona card** — "the lovesick reader," "the furious professor," "the doodling bored kid," "the conspiracy theorist," "the pedantic proofreader" — plus a private ink color and a small toolset (underline, circle a word, tap a margin to leave a scribbled note or doodle).

A 90-second timer starts and everyone annotates simultaneously. Each phone shows your own passage with YOUR marks emphasized so you can work; the host screen shows the communal page filling up in real time with everyone's anonymous, color-coded marks accreting on top of each other. At the buzzer the group reads the page aloud together and reveals personas one at a time ("who was the lovesick one?"). The host exports a PNG keepsake.

Private per phone: your persona, your ink, your working canvas. Shared host: the accreting communal page and the final reveal.

## Technical approach
PartyKit / Cloudflare Durable Object room. Data model: the passage is a list of tokens with stable ids; annotations are append-only events `{playerId, type, tokenId | lineIndex + normalizedOffset, text, color, ts}`. The server keeps an ordered op log and broadcasts deltas; both host and phones render an SVG overlay atop the passage. The genuinely hard part is coordinate stability across wildly different screen sizes and text reflow — solved by anchoring every mark to a token id (for underlines/circles) or a line index + normalized margin offset (for notes/doodles), never raw pixels. Annotations are purely additive, so last-write conflicts don't exist.

## v1 scope
- 3 players, one hard-coded passage
- 3 personas, two tools (underline + margin note)
- 90-second timer, then persona reveal
- PNG export of the finished page

## Out of scope
- Erase/undo (no mark wars), freehand doodling, multiple pages, accounts/saving, custom passages.

## Risks & unknowns
- Reflow/anchoring across screen sizes is the main engineering risk.
- Is it fun with zero competition? Bet the payoff on persona comedy + the reveal + the tangible page.
- Mobile text-selection UX for underlining is fiddly.

## Done means
Three phones annotate one shared passage simultaneously; each mark appears on the host within ~300ms; the reveal names each persona; the host exports a single PNG all three players can save.
