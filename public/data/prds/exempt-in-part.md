## Overview
A 3–4 player anti-coordination game about censorship real estate. The TV shows one page of a leaked memo. Every player is privately assigned a different incriminating phrase somewhere on that page. Each phone drags one black bar onto the page to cover their own phrase. All bars are revealed at once — and any two bars that overlap by a single pixel **both vanish**, leaving both secrets naked on the TV. You are not trying to hide together. You are trying to hide *apart*.

## Problem
Redaction games are usually about what you write. Nobody has made the *geometry* of hiding the thing be the whole game. And most anti-coordination party games collide in an abstract menu — a list of six nouns — where "don't pick what they picked" is a coin flip. Colliding in continuous 2D space is legible, tense, and hilarious to watch resolve: the bar you drew too fat is visibly why you got caught.

## How it works
1. Host TV renders a fixed memo page, ~14 lines of absurd corporate prose, identical for everyone.
2. Each phone privately renders the **same page** with one phrase glowing red — *your* liability. Nobody else's phrase is visible to you, ever.
3. Under a 60s timer each player drags and resizes a single black rectangle. Bigger bars are safer against your own misplacement but far likelier to collide. Minimum size is one word; there is no maximum.
4. Locks are blind. The TV shows only "3 of 4 sealed" — no ghost bars, no live positions, no presence hints.
5. Reveal: all bars slam onto the TV simultaneously. Server computes pairwise rect intersections; every bar in any intersecting pair is deleted with a wet paper-tear sound.
6. Score: +3 if your phrase is fully covered by your surviving bar, 0 if your bar died, −1 if your surviving bar covers someone *else's* phrase (you censored the wrong crime). Host reads the surviving document aloud.

## Technical approach
PartyKit Durable Object per room, one authoritative room state: `{page: {id, lines}, players: {id, secretRectId, bar: {x,y,w,h}|null, locked}}`. Phones send throttled `bar.update` (30Hz, coalesced) but the server **never rebroadcasts bars** pre-reveal — the DO is a vault, not a mirror, which makes sync trivially cheap.

The genuinely hard part is *coordinate identity*. A bar placed on a 390pt phone must land on the exact glyph the player intended on a 1080p TV. Solution: the memo is authored as a fixed 1000×1400 SVG with baked text metrics; both host and phone letterbox that viewbox and map all touch coords into it. Secret phrases are pre-computed rects in the same space. Intersection math then runs once, server-side, on integers.

Second hard part: lock fairness. Late lockers gain nothing (no info leaks), so the deadline is a hard server cutoff — an unlocked bar submits wherever it sits.

## v1 scope
- One hand-authored memo page, one round, 3 players.
- One bar each, drag + two-corner resize, no rotation.
- Fixed 60s timer, blind lock, one simultaneous reveal.
- Scoring shown as three lines of text on the TV.

## Out of scope
Multiple pages, multiple bars, generated documents, LLM prose, rotation, spectators, persistent scores, animations beyond the tear.

## Risks & unknowns
With one page and 3 players, collisions may be too rare — needs secret phrases seeded close together (2–3 lines apart) to force contested space. Fat-finger resize on small phones may frustrate; may need snap-to-word-box. Reading a redacted memo aloud may land flat if the prose isn't funny enough — the writing carries as much weight as the mechanic.

## Done means
Three phones join by room code, each sees a different red phrase, all place bars blind; the TV reveals four bars, deletes exactly the intersecting pair per server-computed geometry, and displays a correct 3-line score — with a bar placed at a given word on the phone landing on that same word on the TV at both 16:9 and 4:3.
