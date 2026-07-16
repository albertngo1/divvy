## Overview
Hot Swap is a 3–4 player cooperative panic game for a shared TV plus private phones. The room runs a failing machine by executing a queue of shouted commands — but each control (a named toggle or dial) is owned by exactly one phone at a time, and ownership keeps *moving*. You can't obey until you find the current owner, and the owner keeps changing.

## Problem
Spaceteam's brilliance is asymmetric panic: only your phone knows your controls. But once you learn the layout, the panic fades. Hot Swap attacks that: it makes ownership itself the moving target, so the room can never settle into "you handle the left half." The coordination never goes stale.

## How it works
Host screen (shared): a command queue ("Set GIMBAL to 4," "Purge the SCUPPER," "Flip DAMPER off") and a reactor-heat bar that rises while commands sit unexecuted. Crucially, the host NEVER shows who owns what.

Each phone (PRIVATE): the 3–4 controls it currently holds, live and interactive. Every ~8 seconds one random control silently migrates from one phone to another — the losing phone sees it vanish, the gaining phone sees it appear, and *no one else is told*. To clear a command, the room must vocalize to locate the owner ("who's got GIMBAL?!"), that player operates the control and taps DONE. Because controls keep hopping, the room must re-ask constantly — the moment you memorize a layout, it's wrong. Wrong control or timeout = heat spike. Win = clear the command queue before the reactor melts.

The per-phone architecture is the whole game: ownership is private, simultaneous, and shifting. One phone passed around cannot work — the controls are distributed across distinct devices at the same instant.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Control{id, name, type, value, ownerPhoneId}`, `Command{controlId, targetValue, status}`, `Room{heat, queue}`. Server is the single source of truth for ownership; migrations are server-scheduled events that push a private delta to exactly the two affected phones. Command completion is validated server-side (right control, right value). The genuinely hard part is atomic ownership migration under latency: a control must never appear on two phones at once, and a DONE tap must resolve against the owner *at server-receive time*, not client-send time — otherwise a mid-flight migration lets a stale owner "complete" a command they no longer hold. Solve with server-authoritative ownership + optimistic-then-reconciled phone UI + a short lock on a control while a command targeting it is being executed.

## v1 scope
- 3 players, one round, ~8 commands, one melt timer.
- 9 controls total (3 per phone), migrating one at a time every 8s.
- Voice is human-only (no mic capture); coordination happens by talking, execution by tap.
- One canned control/command deck.

## Out of scope
- Mic capture or speech recognition.
- Sabotage/traitor roles, multiple rounds, difficulty ramps, scoring.
- Player-visible ownership map (defeats the point).

## Risks & unknowns
- Migration cadence tuning: too fast = chaos, too slow = boring; needs playtesting.
- Latency reconciliation on DONE taps is the make-or-break correctness issue.
- Small rooms may find the owner too quickly with only 3 phones — may need more controls.

## Done means
Three phones in a room clear an 8-command queue before the heat bar fills; a control observed migrating mid-round produces no double-ownership, and a DONE tap fired the instant after a migration is correctly rejected as "you no longer own that."
