## Overview

**Return Address** is a ~15-minute keepsake game for 3–5 people sharing a room, a host screen, and their own phones. Together you write a single short letter to yourselves one year from tonight. There is no score. The letter is only *sealed and sent* if, at the end, the group cannot reliably tell who wrote which line. The win condition is an artifact with no signatures on it.

## Problem

Group keepsakes are either sentimental performances (everyone signs the card, everyone writes the same nice nothing) or competitions with a winner nobody remembers a week later. Meanwhile, the things actually worth putting in a letter to your future selves are exactly the things people won't say with their name attached. The itch: an artifact worth keeping, made possible *because* authorship gets stripped.

## How it works

**1 — Draft (120s).** The host TV shows letterhead — "To us, one year from tonight —" — and four empty numbered slots. Each phone *privately* shows a **different** prompt spine: "one thing I hope is different" / "one thing I hope survives" / "the thing I wouldn't say out loud" / "a joke only we'll get." You type one line, ≤120 chars. Your phone shows only your prompt and your draft. The TV shows only which slots are filled.

**2 — Launder (120s).** The server deals every phone exactly one line that is *not* theirs (a derangement). Your phone privately shows that orphan line and one instruction: *rewrite it so it sounds like the letter, not like a person.* You may change wording, not meaning. Meanwhile the TV shows all four current lines in shuffled order — so your own line is up there, being rewritten in front of you, and you must not react.

**3 — Seal.** Every phone simultaneously and privately attributes each final line to a player. The server computes collective accuracy. Below the chance threshold the letter **seals**: the TV stamps it, and every phone receives the finished letter as a PNG plus a "mail this to all of us in a year" button. At or above, the letter comes back unsealed — the TV marks *which* lines were legible, never by whom.

Individual guesses are never revealed to anyone. Failure tells you a line had a fingerprint on it, not whose.

## Technical approach

Host browser tab + phone PWAs + one PartyKit Durable Object per 4-letter room code (Socket.IO over Tailscale Serve is a drop-in equivalent). DO state: `{players[], phase, lines: [{id, authorId, text, launderedBy, history[]}], attributions: {guesserId: {lineId: playerId}}}`. **`authorId` never leaves the server** — not to phones, not to the host. Clients receive `lines` projected without authorship; the host additionally gets a `shuffleSeed`.

Sync is phase-gated, not continuous: drafts and rewrites are buffered server-side and released only on phase transition.

The genuinely hard part is **metadata anonymity**. Real-time systems leak authorship through submission order, typing cadence, length, and idle state. Mitigations: hold all submissions to the phase boundary, randomize display order, suppress per-player "typing…" indicators, normalize whitespace/capitalization/terminal punctuation server-side, and deal launder assignments to every phone in a single tick. Derangements must be re-rollable on mid-phase disconnect without exposing the prior mapping.

## v1 scope

- Exactly 4 players, one room, one letter, four lines.
- Four hardcoded prompt spines. No packs.
- One launder pass. No retry loop.
- Seal threshold hardcoded: ≤1 of 4 collective correct attributions.
- Keepsake = canvas render → PNG download, plus a prefilled `mailto:`. No delivery scheduling.
- No accounts; room state dies with the room.

## Out of scope

Multi-round letters, voice or handwriting input, real one-year delivery infrastructure, spectator mode, multiple concurrent rooms, and any per-player score whatsoever.

## Risks & unknowns

With four players, chance-level attribution is noisy — sealing may feel arbitrary. Laundering may flatten lines into mush and kill the keepsake's charm; the meaning-preservation guard is unproven. Prompt spines that are too person-specific make authorship obvious no matter how well laundered. Players will sometimes just confess out loud; treat that as a house rule, not something to police.

## Done means

Four phones join by room code, draft four lines blind, each rewrite exactly one line that isn't theirs, submit attributions simultaneously, and the TV either stamps and seals — with all four phones downloading the identical letter PNG — or returns it unsealed with the legible lines marked. Inspecting the WebSocket frames shows no client payload ever containing `authorId`.
