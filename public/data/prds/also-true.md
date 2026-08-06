## Overview

A 4-player, one-round game for a living room with a TV. The room writes true things about itself and ends the night with a printed poster titled *Things That Are True of Someone in This Room* — where no line can be traced to anyone. It is not scored. You either leave with the poster intact or you leave having cut somebody's truth off it.

## Problem

Party games that get personal do it by exposure: confess, be identified, be laughed at. The pleasure of the intimate stuff is real, but the attribution is what makes people play safe and write nothing interesting. Nobody has built the opposite game — where the room's job is to *launder* each other's honesty so the risky lines survive.

## How it works

**Phase 1 — Write (90s, simultaneous).** Each phone privately shows a prompt frame ("Something you've never said out loud in this room…") and a text box. Two statements each; 8 total. The host TV shows only a filling progress bar — no text yet.

**Phase 2 — Cosign (open table, ~4 min).** The TV displays all 8 statements shuffled, unattributed, each with a **claim count** starting at 1 and a glowing red BARE badge. Each phone privately shows the same 8 statements with a COSIGN button on each — greyed out on your own two (server-enforced). You get **3 cosign tokens**, so the room has 12 tokens for 8 statements that each need at least one. Rule of the room: only cosign if it is genuinely also true of you. The TV updates counts live but never who cosigned. Players negotiate out loud — "number five still needs someone" — which is safe, because saying it doesn't mean you wrote it.

**Phase 3 — Print.** Statements with ≥2 claimants print. Bare ones are struck through on screen, then deleted. The TV renders a letterpress-style poster PNG, dated, with the room's first names along the bottom edge in one alphabetical block — collectively credited, individually anonymous. Everyone's phone gets the download.

## Technical approach

PartyKit Durable Object per room. Model: `room {code, players[], phase}`, `statement {id, authorId (server-only, never serialized to clients), text, cosigners: Set<playerId> (server-only)}`. Clients only ever receive `{id, text, claimCount}`. Sync is trivially small — the hard part is **leak-proofing**: claim counts must not be individually attributable, so cosigns are applied on a 2-second server-side jitter timer and batched, otherwise timing correlates a phone's tap with a count tick on the TV. Poster render is server-side satori→PNG so all phones get an identical file.

## v1 scope

- Exactly 4 players, one round, 2 statements each
- 3 cosign tokens per player, one fixed prompt frame
- One poster template, PNG only
- 4-letter room code, no accounts, no persistence after export

## Out of scope

- Multiple rounds, prompt decks, spectators
- Any scoring, any "guess the author" phase
- Print-service integration, profanity filtering

## Risks & unknowns

- Honor system on cosigning: a polite room cosigns everything and the tension evaporates. Token scarcity is the only brake; may need 2 tokens.
- Process-of-elimination outing when a statement is bare and only one person visibly isn't lobbying for it.
- Emotional weight: cutting a line could sting more than intended.

## Done means

Four phones join, write 8 statements, spend tokens, and the TV prints a PNG containing exactly the ≥2-claimant statements — and no client payload, anywhere in the session, ever contained an author or cosigner id.
