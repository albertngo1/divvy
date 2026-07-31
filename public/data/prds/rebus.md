## Overview

A 4-player cooperative picture-building game, riffing on *Concept*. Two **Builders** know a secret phrase and must convey it by silently placing pictograms onto a shared canvas on the TV. Two **Readers** shout guesses and privately gamble on when to commit. One round, about eight minutes.

## Problem

*Concept* gives you a giant board of every icon you could want, which sounds generous and is actually the flaw: with the whole vocabulary available, the game becomes a solo exercise in careful indexing, and the second clue-giver is decorative. There's no scarcity, no need to lean on your partner, and nothing hidden — the board is face-up on the table for everyone.

## How it works

The **host screen** shows a 5×5 canvas, empty, plus the placement counter (0/8) and a live "locked" indicator per Reader.

Each **Builder's phone** privately shows a tray of 12 pictograms drawn from a 60-icon set. **The two trays are disjoint and neither Builder can see the other's.** Builders also privately see the secret phrase.

Builders alternate, eight placements total: drag an icon from your tray to a canvas cell; it appears on the TV instantly. You also share a budget of three connector lines between placed icons. Builders may not speak or gesture.

The scarcity is the game. You want CROWN and you don't have it, so you place KING and hope your partner has a hat. You place WATER in the corner and pray she extends it. You genuinely do not know whether the symbol you need exists anywhere in the room.

Each **Reader's phone** privately holds one guess field and one LOCK button. Readers argue out loud freely, but locking is private and irreversible, and the TV only reports *that* you locked. Lock before placement 4 → 5 points; before 6 → 3; before 8 → 2; after → 1. Wrong → 0, and you're out while your partner keeps working with fewer heads. So one Reader can quietly cash a hunch and abandon the other.

## Technical approach

PartyKit Durable Object per room. State: `{phrase, trays: {a[12], b[12]}, canvas: {cellId → {icon, by}}, connectors[], turn, locks: {readerId → {guess, atPlacement}}}`.

Sync: phones send `PLACE {icon, cell}`; the server validates turn order, tray ownership (you cannot place an icon you don't hold — trust nothing from the client) and cell vacancy, then broadcasts the canvas patch. Icon placement is turn-alternating, so there's no drag-conflict race; connectors are first-write-wins on an (a,b) pair. Reader guesses are held server-side and revealed only at the end, so an early locker can't tip the table.

The genuinely hard part isn't sync — it's **tray partitioning**. For each phrase the authoring pipeline must guarantee the union of the two trays can plausibly express it while neither half alone can, otherwise one Builder solos it and the other is decoration. v1 does this by hand: each phrase ships with a curated 24-icon pool split into two 12s, hand-checked so the two most-obvious icons land in different trays.

## v1 scope

- Exactly 4 players, roles picked at join. One round, one phrase.
- 10 hand-authored phrases, each with a pre-split 24-icon pool.
- 60 static SVG icons, no search, no scrolling tray.
- 8 placements, 3 connectors, no undo.
- Score screen showing the canvas, the phrase, and both Readers' locked guesses.

## Out of scope

Icon search, custom phrase packs, more than 4 players, undo, drawing, timers, rounds, persistent scores, any real-time audio.

## Risks & unknowns

The biggest risk is that eight icons is simply not enough bandwidth and the Readers flounder — the placement count needs playtesting from 8 up to 14. Icon legibility on a living-room TV at 5×5 is unproven. Silent Builders may find the constraint frustrating rather than delightful. Hand-authoring pools does not scale past a demo, and the mechanic dies if the split is lazy.

## Done means

Four phones join, each Builder's tray is verifiably disjoint from the other's (checked in the room state dump), a placement from a Builder appears on the host canvas in under 200ms, a Reader's lock is invisible to the room except as a lock indicator, and a table of four playtesters solves at least 4 of the 10 phrases without anyone speaking out of turn.
