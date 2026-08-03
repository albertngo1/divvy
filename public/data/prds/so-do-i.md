## Overview

A 15-minute cooperative trust game for exactly 5 people in a living room. Everyone writes one true, slightly exposing sentence about themselves. Nobody wins points. The room collectively produces a small printed zine of unattributed confessions — and the only failure state is a line standing alone on the TV with no one willing to claim it.

## Problem

Confession games (Never Have I Ever, Truth or Dare) extract vulnerability and then throw it away — the reward is a laugh and nothing survives the night. And they punish honesty: the moment you say a true thing, you own it forever. There's no mechanic that lets a room *cover* for each other, which is the actual social behavior that makes disclosure safe.

## How it works

**Phase 1 — Write (90s).** Every phone privately shows the same prompt ("something true about you that nobody in this room knows") and a 140-char box. Submissions land face-down. The TV shows only an aggregate counter ("4 of 5 in") — never a name, never a "still typing" indicator.

**Phase 2 — Cover (2 min).** The TV shows all five confessions at once, shuffled, unattributed. Each phone privately shows **only the four confessions that aren't yours** and exactly **3 cover tokens**. You tap "So do I" to spend one. You cannot claim your own line — your survival is entirely in other people's hands. Five lines, fifteen tokens, three needed per line to feel safe: the math guarantees somebody gets left out unless the room spends deliberately. Talking out loud is legal and is the whole game — but every hint of "cover the third one" narrows down who wrote the third one.

**Phase 3 — Bind.** Any line with ≥2 claims goes into the zine. Lines with 0 claims go to the **Open File**: displayed alone on the TV, unattributed, while the room gets one free out-loud guess. The host renders a printable zine page — the surviving lines, in random order, with the date and five sets of initials on the back — and every phone gets a QR to the same file.

## Technical approach

Host browser tab + phone PWAs + one authoritative Cloudflare Durable Object per room (WebSocket). Data model: `Room{code, phase, players[], confessions[{id, authorId, text}], claims[{confessionId, claimerId}]}`. `authorId` **never leaves the server** — the DO filters per-socket, so each phone's Cover payload is server-constructed from its own identity. Client-side hiding is disqualifying.

Sync is trivial in volume (5 clients, ~20 messages). The genuinely hard part is **anonymity under side-channels**: submission order leaks authorship (shuffle with a server seed, batch-reveal), per-player progress indicators leak authorship (aggregate counters only), reconnects must not re-key player order, and claim counts must stay hidden until Bind or Cover becomes a visible auction. A phase-advance timer lives on the DO, not the host tab, so a host refresh can't strand the room.

## v1 scope

- Exactly 5 players, one round, one fixed prompt
- One confession each, 3 cover tokens each, ≥2 claims to survive
- Host screen: counter, shuffled wall, Open File, zine render
- Zine = one printable HTML page + QR download
- 4-letter room code, no accounts, no persistence after the room closes

## Out of scope

Prompt decks, 4–10 player scaling, multiple rounds, editing/retracting a confession, real print fulfillment, saved zine history, moderation.

## Risks & unknowns

A room of close friends may recognize handwriting-by-voice instantly, collapsing anonymity. Token scarcity may be mistuned — 3 tokens might be too generous with 4 targets. The Open File could land as genuinely cruel rather than tense; it may need to be opt-out at room setup. Groups may also just write jokes, which is fine but makes the zine forgettable.

## Done means

Five phones on one hotspot complete a round in under 15 minutes; the host renders a zine page containing exactly the lines with ≥2 claims in randomized order; a WebSocket frame inspection on any phone shows zero authorship data for any confession other than its own; and a 0-claim line correctly appears in the Open File without the app ever naming its author.
