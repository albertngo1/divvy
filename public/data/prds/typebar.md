## Overview
Typebar is a 3–4 player couch game where the shared screen is a single 1940s typewriter — platen, carriage, paper — and each phone is a private strip of that machine's typebars. The room is trying to type one word. The machine is trying to jam. It's for groups who want a cooperative goal that is constantly sabotaged by their own eagerness.

## Problem
Co-op party games reward the loudest, fastest player: whoever slams the button first carries the room. Typebar inverts that. Eagerness is the failure mode. The itch it scratches is the very specific comedy of four people all going "I've got it—" at once and destroying the thing they were reaching for.

## How it works
The host TV shows a target word — say MARMALADE — with a carriage sitting under the next unstruck letter, and a 5-second carriage timer ticking down.

Each phone shows PRIVATELY: four big letter keys, that phone's entire typebar set. Letters are deliberately duplicated across the room (two players hold A, three hold M). No phone can see any other phone's strip, and the TV never reveals who holds what.

When the carriage sits on M, everyone holding M must decide: strike, or trust someone else to. Three outcomes:
- **Exactly one strike** → letter prints, carriage advances, applause.
- **Two or more strikes inside a 180ms window** → the bars collide with a horrible clack, both bars bend, and that letter is permanently jammed on every phone that holds it. If nobody left holds it, the word is unfinishable.
- **Nobody strikes for 5s** → the ribbon smears; you lose one of three ink blots. Three blots and the round ends unfinished.

Talking is allowed and is exactly the trap — "who has the second A?" is answerable, but claiming it out loud takes two seconds you don't have, and the second A holder may be lying to save their bar for later.

## Technical approach
Host browser tab + phone PWAs against one PartyKit/Durable Object room holding authoritative state: `{ word, cursorIdx, strips: {playerId: [{letter, bent}]}, blots, log }`. Strip generation guarantees at least one live holder per letter at deal time and seeds 2–3 letters with duplicate holders.

The genuinely hard part is fair simultaneity. Phones have 20–300ms of asymmetric latency, so naive server-arrival ordering makes the closer phone always "win." On join, each client runs a ten-sample NTP-style ping to estimate clock offset and RTT; strikes are sent with a client timestamp and normalized server-side. The server does not adjudicate on first arrival — it buffers strikes for the current cursor for `maxObservedRTT + 60ms`, then evaluates the whole bucket at once. Two normalized timestamps within 180ms = collision. Both colliding times are drawn on the TV as a millisecond-labeled fork, so a jam always looks earned rather than laggy.

## v1 scope
- 3 players, one word (9 letters), one round, no lobby art
- Fixed hand-authored strip deal — no generator
- Jam, print, smear; three blots ends it
- Host shows word, carriage, timer, jam forensics

## Out of scope
- Multi-round scoring, ribbon/shift/backspace mechanics, spectators, sound design beyond one clack and one ding, phone haptics

## Risks & unknowns
- 180ms may be too generous (constant jams) or too tight (no drama); needs playtest tuning
- Rooms may solve it socially by pre-assigning "you always strike first" — mitigate with duplicate-heavy deals and a short carriage timer

## Done means
Three phones on the same wifi, one TV: the room types MARMALADE at least once, and produces at least one jam whose forensic readout both colliding players accept as fair.
