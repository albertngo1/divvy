## Overview

A 6-minute party game for 4 players who are already watching something together. "I cut, you choose" transplanted onto a betting line: every player privately holds one prop about a paused clip's ending, sets the odds on it themselves, and hands it to one named opponent — who picks which side they want. No house, no pool, no bookmaker who gets to be right.

## Problem

Every group betting game has the same failure: a house or a parimutuel pool absorbs all the tension, and the "skill" is guessing the show. That's a trivia game with chips. The interesting social object is *pricing a bet for one specific person in this room* — someone who knows this genre better than you, or who is definitely bluffing, and who gets the last word.

## How it works

1. The host TV plays a 60-second clip and freezes 20 seconds before the payoff.
2. **Privately, each phone** is dealt one prop about those unplayed 20 seconds ("the dog gets the sandwich", "nobody says a word"). All four props are different and secret.
3. **Placement (45s, simultaneous).** On your phone you pick one other player by name and set the line: drag a slider splitting a 12-chip pot (e.g. 9 pays YES / 3 pays NO). Send.
4. **Choice.** Their phone shows your prop text and your line — never who else got what. They tap a side. You are automatically the other side. Or they tap **MOVE IT**: the pot shrinks to 8, they re-split it, and it comes back for *you* to choose a side. One volley only.
5. **The TV** shows a live wiring graph — arrows between names, current pot size, a volley badge — and nothing else. The room watches four negotiations happening in dead silence and can only read intensity.
6. The last 20 seconds play. Props resolve on screen one at a time. Chips move.

## Technical approach

Host browser tab plus phone PWAs against one authoritative PartyKit room (Cloudflare Durable Object). Data model: `Room{clipId, phase, players[]}`, `Ticket{id, propId, fromId, toId, potSize, lineYes, chosenSide, volleyed, resolved}`. The DO owns all tickets; phones send `PLACE`, `CHOOSE`, `VOLLEY` intents and receive only tickets they are party to. The TV subscribes to a redacted projection — edges, pot sizes, volley counts, zero terms — so a leak is structurally impossible rather than a client-side hide.

Hard part: **clip playback and the phase clock must agree within ~200ms across five devices.** Solve by making the host tab the clock master, broadcasting `serverNow` heartbeats the phones offset against, and by hard-freezing the video at a known frame rather than trusting `timeupdate`. Second hard part: a volley arriving in the same tick as the deadline — the DO resolves by sequence number and pushes the authoritative ticket state back, so a phone can never believe it chose a side it didn't get.

## v1 scope

- 4 players, exactly one round, one hardcoded 60-second clip
- 4 hand-authored props with a human resolver: the host taps YES/NO on the TV
- Pot slider, one volley, one settlement screen
- Rejoin on refresh; no accounts, 4-letter room code

## Out of scope

Multiple rounds, a clip library, auto-resolution, 5+ players, chat, persistent bankrolls, spectators.

## Risks & unknowns

Does a 12-chip split slider read instantly on a phone, or does it need three preset lines? Does one volley create enough agony, or does it need two? Human resolution of an ambiguous prop can poison the round — props must be brutally literal. And the pricing decision may collapse to "always offer 6/6" if props are 50/50; they must be visibly lopsided.

## Done means

Four phones join by code, the clip freezes, all four tickets get placed and chosen (with at least one volley) inside 90 seconds, the TV never renders a line or a side, the ending plays, and the chip totals on all five screens agree.
