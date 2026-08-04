## Overview

"Mountain Valley" is a ~12-minute cooperative game for exactly 4 people, one square sheet of paper, one TV, and four phones. The room folds a paper fortune teller from a diagram that no single person can see. It ends with a real object on the table containing eight handwritten fortunes and no way to know who wrote which.

## Problem

Party games leave behind a screenshot at best. And co-op information-split games always split *a screen* — the shared state is pixels, so the whole thing collapses into reading text at each other. Splitting a physical instruction puts hands, paper, and voice in the middle, and every failure state is visible on the table, in creases you can't take back.

## How it works

Seven folds. Each step has one **Folder** (hands full, phone face-down) and three **Readers**, rotating one seat per step so everyone folds.

- **Reader M** sees only the *mountain* creases on the current sheet state — red, unnumbered, several of them.
- **Reader V** sees only the *valley* creases — blue, same.
- **Reader O** sees an arrow showing *which* crease this step folds and where the corner lands — drawn grey, with no direction.

O can say "the one from the top-left corner to the middle." Only M *or* V has that crease. The other one says "not mine" — and that negative fact is half the information. The Folder sees no diagram at all and works purely from what's said aloud.

The TV shows step counter (3/7), a 90-second timer, and a CONFIRMED stamp. Never a crease.

Each Reader's CONFIRM button shows only their own layer. All three confirm → the step locks, the Folder folds, roles rotate. Any Reader can call UNDO.

**Fortunes.** Once the object exists, each phone privately shows two of the eight flap positions ("inner flap, top-left, under the 4"). There is no text field — you write it on the paper, in pen. Nobody is told anyone else's assignment. The TV then renders a certificate: date, four first names alphabetized, no roles, no attributions. Photograph it next to the object. No score.

## Technical approach

PartyKit room or one Durable Object. `Room { code, step, roleRotation, confirms: Set<playerId>, timerStartedAt }`. The diagram is static content: 7 steps × 3 pre-rendered SVG layers. The server sends each socket **only its assigned layer** for the current step — other layers never reach that device, so view-source can't cheat.

Sync: confirms are a server-side set; the third confirm broadcasts the advance and the rotation. The timer is server-owned — phones render from a server timestamp and drift-correct, never from a local `setInterval`.

The genuinely hard part isn't sync, it's **divergence between the physical and digital state**. If the Folder mis-folds, every subsequent diagram is a lie about the paper in the room. v1's answer: any Reader can UNDO, rolling the room back one step and showing all three the same "unfold this" layer. No computer vision — the paper is the source of truth, and the server's only job is to be cheap to rewind.

## v1 scope

- Exactly 4 players, one square sheet, one 7-fold fortune teller
- 3 Reader layers, fixed rotation table, server-owned 90s per-step timer
- All-three-confirm to advance; any-one UNDO to step back
- 8 private flap assignments, written by hand
- One certificate PNG on the TV. No score, no rounds, no lose state

## Out of scope

- Any other model (crane, box); camera or CV fold verification
- Player-authored diagrams; difficulty tiers
- Digital fortunes or storing fortune text server-side (it never leaves the paper)
- 3-player or 5+ role mappings

## Risks & unknowns

- Real paper, real squares. A non-square sheet fails at fold 3. Mitigation: a "make a square" pre-step on the TV.
- The split may be trivially solvable by one loud person reading their whole layer aloud. Fix if so: make O's arrow ambiguous between two creases so M and V *both* must answer.
- Handwriting partly de-anonymizes the fortunes. Likely charming rather than broken, but it does soften the claim.
- Unknown whether 90s per step is generous or cruel for people who have never folded anything.

## Done means

Four phones join; the TV never displays a crease; at step 3 the three phones show three visibly different images and the step will not advance until all three CONFIRM; UNDO from any phone returns all four devices to step 2 within 200ms; after the 7th confirm each phone shows two flap positions no other phone has; and twelve minutes after start there is a folded fortune teller on the table with eight handwritten fortunes in it.
