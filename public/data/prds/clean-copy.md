## Overview

A 4-player deduction game that inverts the imposter. The room is handed a nine-card evidence file and asked which of four suspects did it. Three phones hold a copy in which exactly one card has been altered — a small, load-bearing word flip ("the window was **locked**") that cleanly redirects the deduction to the wrong suspect. The fourth phone holds the clean copy. The player with the truth wins by steering the room to the correct answer without being identified as the odd one out. Being right is the tell.

## Problem

Hidden-role games train one instinct: find who's lying. That instinct is cheap and it's the same every game. Flip it — make the deviant the only honest reader in the room, and suddenly the group's job (spot the outlier) is in direct tension with the group's other job (get the answer right). You have to be persuaded by the person you're about to convict.

## How it works

Phone (private): your nine evidence cards, tappable to read full text. Nine short factual lines about a scene, four suspects listed. You are told the room contains one Clean Copy holder; the Clean Copy holder is told they are it, but is **not** told which card was altered for everyone else.

Host screen (shared): the four suspects, a public READ LOG, and the vote UI. It never shows card text.

Players talk freely, but the only way to put a card's exact wording into the room is a READ: tap a card, read it aloud verbatim, and the TV logs the index publicly. Each player gets two reads. This is the accusation engine — if two players read card #4 and the wording differs, the room now knows one of those two is the deviant, narrowed from four to two. The Clean Copy holder faces a live risk calculation on every read: they don't know which card is corrupted, so each read is a 1-in-9 dice roll, and the corrupted card is exactly the one everyone most wants read.

Meanwhile the Clean Copy holder is arguing for a suspect the other three can see the evidence contradicts. From inside the corrupted view, the truth-teller looks like a crank.

Then a single simultaneous ballot: pick the guilty suspect, and pick who holds the clean copy. Honest players: +2 if the group's majority suspect is correct, +2 if they named the Clean Copy holder. Clean Copy: +3 if the group's answer is correct, +3 if fewer than half named them.

## Technical approach

PartyKit / Cloudflare Durable Object per room. State: `{ roomCode, phase, caseId, corruptedCardIndex, cleanPlayerId, readsRemaining: {playerId: n}, readLog: [{playerId, cardIndex}], ballots }`.

Sync: on assignment the server pushes each socket only its own nine-card array — corrupted or clean — over a per-connection message, never a broadcast. The read log and vote state are broadcast; card text never is. Phase machine is server-authoritative with absolute-epoch deadlines so phones render clocks locally.

The genuinely hard part is authoring, not networking. A case must have exactly one card whose flip produces a *clean, confident, wrong* conclusion — not an ambiguous one — while the other eight cards read as equally relevant so the corrupted card isn't obvious by salience. v1 hand-authors a single case and playtests it rather than generating.

## v1 scope

- Exactly 4 players, one hand-authored case, one round, one ballot.
- Nine cards, four suspects, two reads per player.
- Public read log on the TV; card text never leaves the phone.
- Free-form spoken discussion with a single 6-minute clock.

## Out of scope

Multiple cases, procedural case generation, running scores, 5+ players, two corrupted variants, in-app chat, timers per speaker, rematch.

## Risks & unknowns

The biggest risk is that duplicate reads solve it too fast — if the room coordinates to read all nine indices twice, the deviant is mechanically exposed. The two-read budget (8 reads across 9 cards) is the counterweight and needs playtest tuning. Second risk: honest players may correctly deduce the wrong suspect *and* correctly convict the Clean Copy holder, and feel cheated rather than delighted. The reveal screen has to sell the joke hard — show the two card versions side by side.

## Done means

Four phones join, three receive an identical corrupted deck and one the clean deck (verifiable from the four socket payloads). Reads log publicly by index with no text leaking. After the ballot, the host screen reveals the true suspect, the Clean Copy holder, and the altered card shown in both versions side by side — and at least one playtest group has convicted the person who was right.
