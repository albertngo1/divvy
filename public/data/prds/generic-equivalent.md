## Overview

**Generic Equivalent** is a 3-player, one-round cooperative party game. One patient on the TV, three specialists holding three private formularies. Everyone must treat a different problem — and any two drugs from the same *class* stack into an overdose that kills the patient. The twist: the phones show brand names, and every phone's brand names are different for the same underlying molecule. You are anti-coordinating across a translation gap you can't see.

## Problem

"Don't pick the same thing" games fail because the collision is visible: you see the same word on the same list and just avoid it, which is a staring contest. The real-life version of this failure — three people independently solving the visible problem, all reaching for the same tool under three different names — has no party-game equivalent.

## How it works

**Shared TV:** one patient card with four vitals bars (fever, pain, breathing, heart) and three publicly visible symptoms. Nothing else. Under it, a one-word "consult log" that fills in live.

**Private per phone:** (a) one extra symptom only your instrument detects, invisible to the other two; (b) a formulary of five drugs, each shown as a brand name with a two-line effect blurb — vitals it improves, vitals it strains; (c) a private allergy note ("patient reacts badly to anything sedating") that only you were told. Crucially the server assigns brand names per-phone from a shared molecule table: molecule `M3` prints as *Bexatrol* on phone A, *Nurofast* on phone B, *Calmex* on phone C, with deliberately non-parallel blurbs.

**Flow:** 90 seconds. At any point each player may spend their single **consult token** to broadcast exactly one word to the TV log, attributed to them. That one word is the entire public channel — the whole game is inventing a shorthand ('sleepy?', 'lungs') that discriminates molecules your neighbor names differently. At the buzzer, everyone's locked pick reveals simultaneously. Any two picks sharing a molecule class = overdose, patient crashes, room loses. Three distinct classes covering three of the four vitals = save.

## Technical approach

Socket.IO server (Tailscale Serve) or a PartyKit DO. Content is one authored `case.json`: molecules with class + effect vectors, plus a `brandMap[playerSeat][moleculeId] → string` and per-seat blurb variants. Server holds truth; phones receive only their own rendered formulary — brand strings for other seats are never sent to any client, so a devtools-open player learns nothing.

Sync is easy (three sockets, one 90 s countdown, one atomic reveal). The genuinely hard part is *content*: authoring blurbs that describe the same molecule from three angles convincingly enough that a careful player can triangulate but a fast player can't. That's a writing problem masquerading as an engineering one, and it's where v1 will live or die.

## v1 scope

- Exactly 3 players, one authored case, one 90 s round, one reveal
- 5 drugs per phone, 4 molecule classes, one collision pair guaranteed to be tempting
- One consult token each, one word, max 12 chars
- Two endings on the TV: SAVED or CRASHED, with the molecule table revealed

## Out of scope

Multiple cases, scoring across rounds, 4+ players, doses/timing, any real pharmacology, text chat.

## Risks & unknowns

Players may solve it by shouting blurb text aloud — acceptable if the blurbs are long enough that reading three aloud burns the clock, but needs testing. Risk that one authored case is a coin flip; may need the collision to be discoverable via exactly two consult words. Medical framing may read as grim to some groups; a heist-safecracker reskin uses the same table.

## Done means

Three phones join by QR, each shows a demonstrably different brand name for molecule M3, and a first-time table crashes the patient at least half the time while a table that uses its consult tokens well saves them.
