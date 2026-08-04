## Overview

A 3-player race that steals the Dark Souls message-and-bloodstain system — normally an asynchronous, months-long stranger economy — and compresses it into eight minutes in one living room. For groups who like a game where lying is a first-class verb but nobody is a traitor by assignment.

## Problem

Souls messages are the best social mechanic in games and almost nobody has felt them work live. The itch: knowledge that costs a death to acquire, is cheap to pass on, and can be poisoned — with the poisoner sitting three feet away, denying it.

## How it works

One dungeon: 12 rooms in a line, each with three doors. Exactly one door advances; the other two kill you. The safe door per room is fixed for the whole session, so knowledge is genuinely transferable. All three players run the same dungeon simultaneously, at their own positions.

Death is cheap and mandatory-informative: you respawn at the last checkpoint (rooms 1 and 6) and you MUST leave a message on the room that killed you, built from a canned Souls-style grammar — [BEWARE | TRY | NO | VISIONS OF] + [LEFT | MIDDLE | RIGHT | DEATH AHEAD]. Messages are anonymous and visible only to players who physically stand in that room.

PHONE (private): your current room's three doors, up to two anonymous messages left there, thumbs-up/thumbs-down appraisal buttons, your message composer, your praise count. HOST TV (public): three runner tokens on a 12-room track, a per-room bloodstain heatmap (death counts, no text), and the praise leaderboard. The TV never shows message text mid-run. The endgame screen does — every message, its room, its up/down tally, and its author. That reveal is the payoff.

Scoring: finish position (5/3/1) plus net praise. Downvoting a liar costs them; a true message read by both rivals pays you while helping them. Talking out loud is legal and encouraged, which is where it gets loud.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room code. State: `{seed, safeDoors[12], players: {id, room, deaths, praise}, messages: [{id, room, authorId, text, up, down, readBy[]}]}`. Phones send `chooseDoor`, `postMessage`, `appraise`; the server is authoritative on safe doors (never shipped to clients), on authorship (stripped from every broadcast), and on the rule that you never see your own message.

No lockstep needed — runners are independent — so the hard part isn't latency, it's the anonymity ledger and live insertion: a message posted while a rival is already standing in that room must appear under them mid-decision without leaking who typed it, including via timing. Mitigation: a 1.5–3s randomized publish jitter, and appraisal counts hidden until the end.

## v1 scope

- Exactly 3 players, one dungeon, one run, ~8 minutes
- 12 rooms, 3 doors, checkpoints at 1 and 6, 4s respawn
- 16-phrase canned grammar, no free text
- Max 2 messages shown per room, newest first
- End screen with full attribution

## Out of scope

Free-text messages, more than 3 players, branching maps, reconnection, persistence between sessions, mobile-native anything.

## Risks & unknowns

The first player through has no messages and eats every trap — if that's a death spiral, the race is decided by turn order. Mitigation levers: praise weighting, cheaper respawns. Also unknown whether lying is fun or just griefing at 3 players; the appraisal economy is the only brake.

## Done means

Three phones and a laptop, one run to completion under 10 minutes, in which at least one false message was written, read by a rival, acted on, and correctly attributed on the end screen — and the room reacted out loud.
