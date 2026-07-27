## Overview

A 4-player, three-minute game that ends with four printable cards — one per person, written entirely by the other three, permanently unsigned. No points, no winner. The win condition is that everyone leaves holding a complete card and the authorship map is genuinely destroyed.

## Problem

Saying a specific, generous, slightly strange thing to a friend's face is expensive. Written anonymously it costs nothing and lands harder. But the paper version of this — a card passed around a table — fails for two reasons: you see everything everyone already wrote, so people pile on and converge, and you can read the handwriting.

## How it works

Four blank cards, one per player, circulate **simultaneously** on a hidden derangement schedule. At any instant each phone holds exactly one card, never its owner's.

**Each phone shows privately:** the recipient's first name, one assigned slot prompt, a text field, and a filled-slot counter (`2 of 3 written`) — but *not the text of the other slots*. You write blind. That's the whole trick: no piling on, no matching tone to someone else's line, and nothing to compare handwriting against later.

**The host TV shows:** four card backs on a table, a 60-second turn clock, and a flip animation as cards fly to their next holder. Never any content, never any routing.

Slot prompts are drawn from a small deck — *a moment*, *an adjective nobody would guess*, *a prediction for next year*, *a lie*. Exactly one slot on each card is secretly the lie; only its author knows which.

Three 60-second turns give every card three contributions, one from each other player. Then the reveal: the TV shows one card at a time, the owner reads it aloud and guesses which line is the lie. Right or wrong, nothing is recorded. The TV shreds the authorship map — and the server actually deletes it — then each phone gets a QR to download its own card as a PNG.

One phone passed around breaks this completely: you'd see every card, every line, and the routing.

## Technical approach

Cloudflare Durable Object per room, phone PWAs plus a host tab over WebSocket.

**Data model:** `room {players[], turn, schedule}` and `cards {ownerId, slots[{type, text, authorId, isLie}]}`. `schedule` is a precomputed Latin square of turn→(playerId→cardId) with the diagonal (own card) excluded, generated once at start.

**Sync:** the turn clock is server-authoritative. Slot text is *never* broadcast — the blind-write rule is enforced server-side by projection, not by hiding fields in the client. A phone requesting a card it isn't scheduled to hold gets nothing. Turn flips broadcast a 3s "pens down" grace; text arriving before the flip message is still accepted.

**The hard part** is two invariants under failure. First, real deletion: the persisted render must drop `authorId` and `isLie` before the PNG is generated, and the in-memory map must be cleared on the same tick as the shred animation. Second, routing under disconnect — if a phone drops mid-turn, its card must be re-routed without ever landing on its owner. v1's answer is deliberately dumb: the card skips that turn and ships with two slots instead of three, and the TV says so out loud.

## v1 scope

- Exactly 4 players, 4 cards, 3 turns of 60s
- One fixed slot deck of four prompts; one lie per card
- Reveal reads on TV, owner guesses the lie, nothing scored
- PNG card render + per-phone QR download

## Out of scope

- Drawings, photos, audio slots; 5+ players; multiple rounds
- Any tally of who guessed their lie correctly
- Accounts, saved cards, sending cards to absent people

## Risks & unknowns

- Blind writing may produce three near-identical adjectives — the slot-type assignment is the mitigation, and it's untested at 4 players.
- The lie mechanic could sour a warm game; it may need to be cuttable.
- "Anonymity" is only as strong as the room's discretion; four players is a small enough set that voice-matching a phrase is easy.

## Done means

Four phones complete three turns in under four minutes, each player downloads a PNG containing three lines they didn't write, and an automated assertion confirms `authorId` is null in every persisted artifact and absent from the room's post-shred state.
