## Overview

**Someone's In Here** steals the Souls-like *invasion* — a human quietly entering your single-player run — and makes it a party format. Three to five players each play a 90-second private dungeon run on their own phone, simultaneously. One player is secretly not playing their own run at all: they've been dropped into a neighbor's, piloting one of the monsters already on that board.

## Problem

Invasions are the most thrilling thing in the roguelike/soulslike vocabulary, and they're structurally impossible to demo in a room — they need everyone playing separately. But "everyone plays separately" is *exactly* what a phone-per-player party setup gives you for free, and almost no party game uses it. Every Jackbox-shaped game funnels attention to one TV; this one deliberately shatters it, and uses the TV only for spectacle.

## How it works

**Private, on each phone:** a 4x4 grid dungeon. Your dot, 3 monster dots, an exit tile, 3 HP. Everything advances on a hard **1-second tick** — you queue a move (tap an adjacent tile) and it resolves on the beat. Also on your phone, permanently: the **bestiary card** for the monster type in play, printing its exact deterministic script, e.g. *"HUSK: each tick, step 1 tile toward the nearest wall; if you end adjacent to it, it strikes."* Reach the exit alive and you bank the run.

**The invader** (one player, chosen secretly) is instead shown the *victim's* board and given control of one specific monster — the same tap-a-tile interface, same 1s tick. Their goal: land the killing blow. Their constraint: the victim can read the script and knows what a Husk should have done. Every tick where the invader's move differs from the scripted move charges a **tell meter**, shown to the victim as a screen-edge flicker with no indication of *which* monster caused it. So the invader has to mostly play the script, and steal deviations only where the script would have taken them somewhere useful anyway.

When the victim dies or exits, they name the piloted monster. Correct ID: +3 to victim even if they died. Successful kill: +3 to invader; a kill with fewer than 4 deviations: +5.

**The host screen** shows only spectacle — anonymized run thumbnails at low resolution (dots, no bestiary, no HP), a kill feed, and a countdown. It leaks nothing. Its job is to give the non-invaded players something to glance at and the room a shared clock.

## Technical approach

Cloudflare Durable Object per room, authoritative. One `RoomDO` holds N `RunState` objects: `{grid, playerPos, monsters:[{id,type,pos,pilotedBy|null}], hp, tick}`. Clients are dumb renderers; the server owns simulation. Each tick the server resolves queued player input, then applies each monster's script — *except* piloted monsters, which take the invader's queued input.

The genuinely hard part is that the invader must not be identifiable by *timing*. A human tapping is slower and jitterier than a script. The fix is the fixed 1s tick with a 200ms input cutoff: all monster moves — scripted and human — are computed and broadcast at the identical instant, and the invader's client shows a countdown ring so they learn the rhythm. If the invader misses the cutoff, the server substitutes the *scripted* move (a free non-deviation), which is also mercifully forgiving.

## v1 scope

- 3 players, one 90-second round, one invader.
- 4x4 grid, one monster type (Husk) with a two-line script, 3 monsters per board.
- Exit tile, 3 HP, melee only. No items, no levels, no meta-progression.
- End screen: victim's single-tap monster ID, then scores.
- Host screen: three thumbnails + timer + kill feed.

## Out of scope

Multiple monster types, multiple simultaneous invaders, ranged attacks, run-to-run progression, reconnect handling, mobile install prompts.

## Risks & unknowns

- With 3 monsters on a 4x4 grid the ID may be trivially easy — grid size and monster count are the tuning dials, and this needs playtest, not reasoning.
- Non-invaded players may find a solo 90-second crawl boring; the round is short precisely because of this.
- The tell meter could be too legible (instantly damning) or invisible. v1 makes it a slow-charging edge glow and expects to retune.

## Done means

Three phones plus a laptop. One round runs to completion with the invader hidden; the victim's ID guess is wrong at least once across three playtests, and the invader reports feeling the tension of having to move like a Husk while trying to corner someone.
