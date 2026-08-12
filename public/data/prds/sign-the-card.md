## Overview

A five-player, one-round game for a group that already has an inside joke and an occasion. Four Signers co-write a real greeting card on the shared screen; the fifth player is the Recipient, sitting in the room, watching the card get written and trying to catch the payload. The prize is the card itself — a printable PNG that reads as a genuinely nice card and secretly carries a six-letter phrase. Nobody's name goes on any line.

## Problem

The office card is passed around and each person writes the same four words. It's a keepsake nobody feels ownership of and nobody enjoys making. The itch: make card-signing a conspiracy, and make the resulting object worth keeping — with an authorship that belongs to the room, not to whoever wrote the funny line.

## How it works

The host screen picks an occasion ("congrats on the new job", "sorry about your car") and shows a blank card with six numbered lines and a signature block that will read *everyone*.

Each Signer's phone privately shows three things nobody else sees: (1) which lines they own — most own one, one Signer owns two; (2) one letter of the hidden phrase, plus a *placement rule* unique to them ("your letter must be the initial of the 4th word"); (3) a cover constraint ("mention the weather") that makes the line read like a person wrote it. No Signer ever sees the whole phrase — the card's punchline is assembled from six people-shaped fragments.

The Recipient's phone shows a strictly reduced view: the card as lines land, and three FLAG tokens. Flagging a line that carries payload is a hit.

Lines open in three waves (1–2, 3–4, 5–6) and appear on the TV as they're submitted, so later writers must make their smuggling *fit* the sentence above it. Your phone green-checks your own rule locally; the server validates.

At the end the TV decodes the phrase down the card. The card exports clean and unsigned if the Recipient landed 0–1 flags. Two or more, and the PNG prints a burned-in footer: *and a secret we blew*.

## Technical approach

Host browser tab + phone PWAs + one PartyKit Durable Object per room. State: `{occasion, phrase[6], lines[6]{ownerId, text, letter, ruleIdx, submittedAt}, flags[], phase}`.

Sync is simple — six text fields and a wave timer. The genuinely hard part is **role-scoped state**: the Recipient's socket must never receive `phrase`, `letter`, `ruleIdx`, or `ownerId`, so the server serializes a different view per connection rather than broadcasting one state blob and hiding fields client-side. Rule validation (nth-word initial after punctuation stripping) is server-side and returns only a boolean to the owner. Render with satori → resvg to PNG; QR-deliver to all five phones.

## v1 scope

- Exactly 5 players: 4 Signers, 1 Recipient
- One occasion, one card, six lines, one six-letter phrase
- Three placement rules total, three cover constraints total
- Three flags, three waves, six minutes
- One PNG export, QR to phones, server-side copy deleted after 10 minutes

## Out of scope

Multiple rounds, variable player counts, real mail/print fulfillment, longer or multi-word payloads, custom occasions, accounts, any scoreboard.

## Risks & unknowns

The placement rule may be too tight to write naturally around — needs playtesting for word-position leniency ("3rd or 4th word"). The Recipient may find flagging boring if the room is good. Payload words that are hard to spell around (Q, X) need a curated phrase list.

## Done means

Five phones join by QR; four write; the Recipient sees no letters in their websocket frames (verified in devtools); the exported PNG reads as a plausible card to an outsider, decodes to the phrase down the initials, and carries no author names.
