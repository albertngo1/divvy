## Overview

Plus on Block is a 4-player co-op timing game that steals the hidden numeric layer of a 2D fighter — startup, hitstun, frame advantage — and turns it into a shouting match. The room collectively plays one character beating on one training dummy. Each player owns two moves. Nobody owns the combo. For groups who like real-time pressure games (Space Team, Keep Talking) but want something with actual depth under the panic.

## Problem

Combos are the most satisfying thing in fighting games and the least accessible: the depth lives in a frame-data table only lab rats read. Meanwhile party timing games collapse into pure reflex tests — tap when it flashes. The itch here: make a reflex test where the number you need to react correctly is *in someone else's pocket*, so reflex becomes communication.

## How it works

**Host TV (public):** a dummy taking hits, a combo counter, a damage meter, and one live HITSTUN BAR that drains in real time after every connected hit. No move names. No numbers. Ever.

**Each phone (private):** your two moves, each with a STARTUP value (e.g. 11f) and an ON-HIT ADVANTAGE value (e.g. +19f), and one fat button per move. You cannot see anyone else's numbers, and they cannot see yours.

**The relay:** the server throws a free opener. Each landed hit opens a window equal to that move's advantage. The next presser connects only if their move's startup fits inside the hitstun remaining when the move would land — press early and it whiffs, press late and the window is gone. Either way the combo drops and the round ends. Because only the hitter knows the advantage and only the next player knows their startup, the round is a live protocol: "PLUS NINETEEN!" "I'm eleven, going!"

**Scaling:** each hit multiplies the window by 0.85, so windows shrink from ~320ms to ~120ms and the room's shorthand has to compress with them. **Proration:** repeating the previous move halves the window, forcing rotation through all four phones.

## Technical approach

PartyKit Durable Object per room, authoritative. At join, each client runs a 5-sample ping/pong and median-filters a clock offset mapping `performance.now()` to server frames (16.67ms). Presses carry a client-monotonic timestamp; the server rebases and judges against a window ledger.

Data model: `Room {phase, comboIndex, windowOpenFrame, windowCloseFrame, scaling, lastMoveId}`; `Player {id, moves:[{id, startup, adv}], graceFrames}`. One event type: `PRESS{moveId, tClient}`.

Genuinely hard part: judging sub-100ms windows over hotel wifi. Mitigations: quantize to frames, allow ±2f tolerance, keep early windows generous, and grant a +2f grace band to any client whose RTT jitter exceeds 250ms (flagged with a small icon on the TV so it's not secret). Second hard part: two phones pressing into the same window — first rebased timestamp wins, the loser gets a private "beaten to it" card and no penalty, so nobody gets publicly blamed for a network race.

## v1 scope

- 4 players, one room, one round, 4-letter join code.
- 8-move table; each phone dealt 2 moves at random.
- TV shows only: combo counter, hitstun bar, drop animation.
- Round ends on first drop.
- Post-round replay reveals every move's numbers on the TV.

## Out of scope

Blocking/defense, opponents that fight back, character select, multiple rounds, sound, animation beyond bars, spectators, persistence.

## Risks & unknowns

- The verbal protocol may not emerge on its own; the TV may need to teach shorthand in the first two hits.
- Reading a number and pressing inside 300ms may be too hard for a non-gamer table — scaling curve is the tuning knob.
- Device clock offset drift over a 60s round.

## Done means

Four phones on shared wifi reach a 6-hit combo; the post-round replay shows every judged press within ±2 frames of a locally logged ground truth; and at least one hit in that chain is observably saved by a player shouting their advantage number out loud.
