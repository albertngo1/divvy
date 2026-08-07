## Overview

A 3-player cooperative deduction game where one phone holds a city map and the other two are lost in it. The twist: the Holder's map is *consumable*. Every question they answer permanently erases the region of the map they answered about. A round is a race between the Pieces getting oriented and the Holder going blind.

## Problem

Asymmetric-info games treat the knower's knowledge as a static resource — they know it all round, so the tension is only about phrasing. The itch is to make the private map a depleting resource, so that asking a question has a cost the *asker* can't see and the *answerer* has to swallow. It turns "just ask them everything" into a real decision.

## How it works

**Holder's phone (private):** a 5×5 city grid of 25 landmark tiles (BAKERY, FOUNTAIN, DOG PARK…), each with an icon and name. Two colored pins mark where the two Pieces are. One gold pin marks the meeting point. As the round proceeds, answered tiles get physically blacked out — the Holder can no longer see what was there, only that something was.

**Each Piece's phone (private):** no grid. Just the name and icon of the *one* landmark they're currently standing next to, four movement arrows, and a text box to send exactly one yes/no question per turn. Each Piece also privately holds three landmark names they know are **not** adjacent to them — a small private negative clue, different per Piece, that they can share verbally or hoard.

**Host TV (shared):** the transcript. Every question and its YES/NO, in order, big. Plus a burn meter: 25 tiles, filling black as the map is consumed. The TV never renders the grid layout.

**Turn loop:** Pieces alternate. A Piece types a question. The Holder's phone shows it with two buttons — YES / NO — and, critically, a preview of exactly which tiles will be destroyed by answering (the tiles the question references). The Holder may answer or REFUSE. Refusing costs the team 30 seconds off the 5-minute clock but burns nothing. So the Holder is constantly weighing "this answer helps them but I'll never see that corner again."

After answering, the Piece may move one tile. Win: both Pieces stand on the gold tile before the clock ends or the map fully burns.

The Holder's agony is legible to nobody. The TV shows the transcript, so the room sees the *questions* but not the cost. The Holder refusing looks stubborn until the reveal.

## Technical approach

Single Cloudflare Durable Object per room. State: `{ grid: Landmark[25], burned: Set<int>, pieces: {id, tile, negClues[]}, goal: int, transcript: [], clock }`.

Questions are constrained-grammar, not free text: a Piece composes from dropdowns — "Is [LANDMARK] [north/south/east/west] of me?" — so the server can deterministically compute both the answer and the burn set. This is the load-bearing simplification; free text would need an LLM adjudicator and would make burn scope ambiguous.

The server computes three projections: `holder_view` (grid minus burned tiles), `piece_view` (adjacent landmark name + own neg clues + composer options), `tv_view` (transcript + burn count). Burned tile *contents* are deleted from the Holder's payload entirely, not hidden client-side — the Holder genuinely cannot recover them by inspecting anything.

Hard part: the burn preview must be computed server-side and pushed to the Holder *before* they commit, which means a two-phase question — a speculative `resolve_preview` and then a `commit_answer` — with a lock so the other Piece can't interleave a question during the pending window.

## v1 scope

- 3 players exactly: 1 Holder, 2 Pieces
- One hand-authored 5×5 map with 25 landmarks
- One question template only: "Is X <direction> of me?"
- One 5-minute round, alternating turns
- Win/lose screen showing the burned map, no scoring

## Out of scope

Free-text questions, multiple maps, Holder rotation, more than two Pieces, partial burns, hints, any rematch flow.

## Risks & unknowns

Burn may be too punishing and Holders refuse everything, stalling the round — tune burn to 1–2 tiles per answer. The dropdown grammar may feel stiff. Two Pieces may just coordinate verbally so thoroughly that the Holder is redundant; the per-Piece negative clues are the hedge against that and may need strengthening.

## Done means

Three phones join with a code. The Holder answers a question, and the referenced tiles visibly and irreversibly black out on their device only. The TV shows the transcript growing with no grid ever rendered. A test group finishes at least one round, and at least one Holder audibly refuses a question and is questioned about it by the room.
