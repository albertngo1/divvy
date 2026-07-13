## Overview
Antiphon is a 3-4 player cooperative voice game (host TV screen + phone PWA controllers) in the Spaceteam lineage. The room must complete a list of two-part command lines, but each line's two halves are scattered privately across different phones, and no phone knows who holds its match. You find partners by ear.

## Problem
Most "shout instructions" party games let the loudest player quarterback the whole round. Antiphon makes that impossible: because command halves are split across private hands, completing anything REQUIRES two specific people to recognize each other and act in sync. The itch is the scramble of a dozen orphaned phrases hunting for their other half.

## How it works
The host screen shows the batch of commands needed this round, but ONLY as blanks: `___ THE CORE`, `PRIME ___`, `___ SEVEN`. Each phone privately holds 3-4 loose fragments — some are FIRST-halves (`VENT`, `PRIME`), some are SECOND-halves (`THE CORE`, `PANEL`). Your phone never tells you which command a fragment belongs to or who has its partner.

Players broadcast fragments aloud ("I've got a VENT!") hunting for a fit. When a first-half holder and a second-half holder believe they match, they grab the shared mic: the first-half holder taps HOLD and speaks, then the second-half holder speaks within a ~1.2s window. The server checks that the two tapped fragments actually concatenate into a listed command. Correct → the command lights green on the host screen. Wrong pairing or a stale window → a buzzer and the fragments return to their hands. Only ONE pair can hold the mic at a time; a second pair grabbing it produces DEAD AIR (both fail), forcing verbal turn-taking.

PRIVATE per phone: your fragment hand, HOLD/SPEAK state. SHARED on host: the blank command list, the single live mic indicator, the green-completion count and timer.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room) over Tailscale Serve. Data model: `Room{commands[], fragmentAssignments{phoneId→[fragId]}, micHolder, completed[]}`; each `Fragment{id, text, half:'A'|'B', commandId}`. Fragment sets are pre-generated so every command has exactly one A and one B, placed on distinct phones. Matching is done by humans; the server only arbitrates the mic and validates the tapped fragment pair against `commandId`. The genuinely hard part is the single-mic contention window: normalize each phone's HOLD/SPEAK timestamps against server-measured RTT so "back-to-back within 1.2s" is fair across a slow phone and a fast one, and so simultaneous grabs resolve to exactly one DEAD-AIR verdict, not two half-committed states.

## v1 scope
- 3-4 players, one round, exactly 4 commands (8 fragments) plus 2-3 decoy fragments.
- Text fragments only; matching validated by tapped IDs, not speech recognition.
- Single shared mic slot, hardcoded 1.2s pairing window.
- Host shows blanks + green count + 90s timer.

## Out of scope
- Actual speech-to-text verification of spoken halves.
- Three-part commands, overlapping simultaneous mics, scoring/leaderboards.
- Reconnect handling, spectators, >4 players.

## Risks & unknowns
- Decoy fragments may make it unsolvable-feeling; needs playtest tuning of decoy count.
- RTT normalization for the back-to-back window is the make-or-break; if it feels arbitrary, trust collapses.
- Room noise: without STT, players could cheat the tap, but honesty-based v1 is fine.

## Done means
Four phones join, each shows a private fragment hand, and the room can complete all 4 blank commands by verbally finding partners and executing fair back-to-back mic grabs; two simultaneous grabs reliably produce a single DEAD-AIR result, and the host screen greens all four before the timer.
