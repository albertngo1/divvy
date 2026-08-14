## Overview

A 6-minute co-op panic game for 3–6 people in one room, one TV, one phone each. It sits in the Spaceteam lineage but inverts the failure mode: the hard part isn't finding someone who can do the job, it's stopping the *second* person who can also do it.

## Problem

Spaceteam-likes make helping always correct — you shout, the one owner presses, done. Real coordination breaks the other way: three people grab the same task, duplicate the work, and step on each other. No party game makes redundant helpfulness the enemy, and nothing forces a room to spontaneously invent radio discipline ("I've got it" / "yours").

## How it works

The TV is the ship. It shows a fault queue — three visible alarms at a time, each naming an action in plain words: **VENT THE SCRUBBER**, **RESEAT BUS 3**, **DUMP BALLAST**. Nothing else. No player names, no ownership.

Each phone privately shows six big labelled buttons drawn from a pool of ~14 labels. Labels are dealt so that duplicates are guaranteed but *hidden*: you can see your own six, never anyone else's. On average two people hold VENT THE SCRUBBER.

The server accepts the first press on a live alarm and clears it (+1). Any additional press of that same label within a 2.5s window is a **double-action fault**: the alarm returns, angrier, and the hull timer loses 4 seconds. Pressing a label with no live alarm is a stray fault (−2s).

So the only winning behaviour is verbal claiming and yielding. The room discovers, mid-crisis, that it needs a protocol: claim fast, yield faster, and remember who turned out to own what. Late-round pressure comes from the queue filling to five alarms, so the room must run two claims in parallel over one shared air.

Private per phone: your six labels, a "claimed by someone" flash when a press lands (label only, never the presser). Shared on TV: alarm queue, hull timer, fault log reading "DOUBLE: DUMP BALLAST" — naming the label, never the culprit, so blame is a conversation.

## Technical approach

Host tab + phone PWAs + one authoritative room actor (PartyKit / Durable Object; Socket.IO over Tailscale Serve for the homelab build). Data model: `Room{code, phase, hullMs, queue[Alarm{id,label,spawnedAt}], faults[]}`, `Player{id, labels[6]}`, `Press{playerId,label,clientTs,serverTs}`.

Server is authoritative on time; clients render a locally-extrapolated hull timer resynced every 500ms. The genuinely hard part is the double-action window: two presses 80ms apart over LTE must resolve identically for both phones, so the server timestamps on receipt, holds a 250ms grace buffer per label before committing first-press vs. fault, then broadcasts one resolution event. Without the buffer, the loser of a network race feels cheated — and this game is *made of* that race.

Label dealing needs a duplication constraint solver: every label in the queue must be held by ≥1 player, and ≥40% of dealt labels must be held by ≥2.

## v1 scope

- One round, 90 seconds, 4 players hard-coded, no lobby art
- 14 labels, hand-authored, text only
- Queue depth fixed at three; no escalation
- Faults: double-action and stray only
- Win/lose screen = alarms cleared count

## Out of scope

Mic input, voice detection, multiple rounds, difficulty curve, per-player scoring, reconnect, spectators, sound design beyond two beeps.

## Risks & unknowns

Does hidden duplication read as unfair rather than funny? Mitigation: TV names the duplicated label in the fault log, so the room learns the overlap map as it plays. Room may go silent and turtle (nobody presses); tune stray-fault cost low and alarm decay high so hesitation hurts more than collision.

## Done means

Four phones on one LAN, one TV. A round runs 90s; a deliberate simultaneous press of a shared label by two players produces exactly one DOUBLE fault on the TV within 300ms, identical on all four screens, and a playtest group is audibly shouting claims by second 30.
