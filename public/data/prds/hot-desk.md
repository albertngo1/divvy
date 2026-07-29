## Overview

A 3–4 player cooperative shouting game for a TV plus phones. Everyone crews the same failing machine, but the *panel itself is unstable*: individual controls migrate between phones every few seconds. Commands name a control by label only, so the room's real job is continuously re-inventorying who currently holds what — out loud, while the clock runs. For groups who have already worn out Spaceteam and want the same adrenaline with the ownership rug pulled.

## Problem

Classic Spaceteam stabilizes fast: after ninety seconds each player has memorized their own panel, and play collapses into "read command → someone recognizes their own widget." The verbal channel goes quiet and efficient. Hot Desk attacks the addressing layer instead of the vocabulary layer — you can never memorize your panel, because it isn't yours.

## How it works

The host TV shows only: a machine-health bar, a countdown, the current command completion tally, and a ticker of anonymous reassignment events ("3 desks reshuffled"). It never shows a who-has-what table.

Each phone privately shows (a) its current widget strip — two or three controls with fat labels like DAMPER LEVER, PURGE VALVE, TRIM DIAL — and (b) a command feed of orders it must read ALOUD ("PURGE VALVE TO THREE"). The targeted widget may be on anyone's phone, including rarely your own.

Every ~6 seconds the server moves one widget from one phone to another. The loser sees a 4-second grayed ghost: "the PURGE VALVE left your desk." It does not say where it went. The receiver gets no fanfare — the widget just appears among their controls. So the only way to route a command is verbal: "who has the purge valve NOW?" — and the answer changes mid-sentence.

## Technical approach

One Durable Object per room (PartyKit-shaped) holds authoritative state: `players[]`, `widgets[{id,label,type,value,ownerId,version}]`, `commands[{id,widgetId,targetValue,issuedTo,ttl}]`, and a reassignment scheduler. Phones send `{widgetId, value, version}`; the server rejects writes whose version predates a migration. Each client gets only its own owned-widget slice plus its command feed — the wire never carries other phones' panels, which makes cheating-by-glancing structurally impossible.

The hard part is migration atomicity. A widget can move while a player is mid-drag, so the server applies a 700ms grace window: a write arriving from the *previous* owner shortly after a migration still resolves the command (blaming a player for network timing kills the fun), but the widget is not rendered back to them. Reassignment ticks must also never orphan the last widget of a command that is about to expire.

## v1 scope

- 3 phones, one 90-second round, 8 widgets total, 12 commands
- Four widget types: toggle, three-position lever, dial 1–5, big button
- Fixed 6-second migration cadence, no difficulty ramp
- Host screen: health bar, timer, reshuffle ticker. Nothing else
- No accounts, no lobby art, four-letter room code

## Out of scope

Scoring history, more than one round, audio VO, mic input of any kind, spectators, reconnection recovery, ownership-hint power-ups.

## Risks & unknowns

Migration may feel arbitrary rather than tense if the cadence is wrong — 6 seconds is a guess. Ghost notices could become a crutch that lets players deduce ownership by elimination with only three phones. Fat-finger loss on a widget that vanishes mid-tap must read as comedy, not injustice.

## Done means

Three people on three phones complete a 90-second round with ≥6 forced migrations; the recorded room audio contains at least three unprompted "who has the ___?" questions; and at least one command is completed by a player who acquired that widget after the command was first read aloud.
