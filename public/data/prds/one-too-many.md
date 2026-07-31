## Overview

A three-player silent-convergence game for a living room with a TV and three phones. The room must all lock the same answer to a prompt, with no talking. The catch: one of the nine answers on your phone doesn't exist on anyone else's, you don't know which, and it was chosen to be irresistible.

## Problem

Silent-matching games collapse into "pick the most obvious thing." Once the room finds the focal point, the tension is gone and everyone locks it on attempt one. The itch is to make the *most obvious thing* the exact thing that loses — without ever telling a player they're being played.

## How it works

The host TV shows one theme card: THINGS YOU'D GRAB RUNNING OUT OF A BURNING HOUSE.

Each phone privately shows a 3×3 grid of nine short answers. Eight are the shared deck — byte-identical across all three phones but laid out in a different scrambled order per phone, so nobody can point, peek, or say "top left." The ninth is your **plant**: a different item per player, drawn from a deck written specifically to be the *best possible* answer to the theme ("the shoebox of my dad's letters"). Nothing marks it. Nine tiles, all the same.

Everyone locks one tile, simultaneously, 30 seconds, irrevocable.

The host TV then shows the only public feedback in the game: the eight shared items listed with a lock count beside each (0–3), plus one black row labeled **OFF-MENU** with a count of players who locked something that isn't in the shared deck. Never who. Never what.

So attempt one usually reads: `OFF-MENU — 3`. Three people each fell in love with a ghost. Attempt two, everyone is paranoid about their favorite tile, and the game is now about identifying your own seduction rather than the room's taste.

Room wins when all three locks land on the same shared item within three attempts. Then the TV reveals all three plants side by side, which is the laugh.

## Technical approach

Host browser tab + phone PWA clients + one authoritative PartyKit room (Cloudflare Durable Object) per game code.

Room state: `{ theme, sharedDeck: ItemId[8], plants: Record<PlayerId, ItemId>, layout: Record<PlayerId, OpaqueToken[9]>, attempt, locks: Record<PlayerId, OpaqueToken> }`. Each client receives only `[{token, text}]` — tokens are per-player HMACs of the canonical item id, so a leaked payload or a screenshot reveals nothing about which tile is planted. The server resolves token → canonical id; plants resolve to a per-player poison id that can never equal anyone else's, making "did they match" a plain equality check.

Layout permutation and plant assignment are derived deterministically from `hash(roomSeed, playerIndex, attempt)` so a phone that reconnects mid-attempt rebuilds the identical board.

The genuinely hard part isn't throughput, it's the **atomic barrier**: locks must be invisible until all three land, then the tally publishes in one broadcast. Any partial leak — a "2 locked" badge that flips in a suspicious order, a host animation that starts early — turns silent convergence into timing tells. The server buffers locks, emits nothing but an anonymous count, and only on the third lock (or timeout) computes and pushes the tally to host and phones in the same tick. Timeouts publish as `ABSTAIN`, not as off-menu.

## v1 scope

- Exactly 3 players, one theme, one round of up to 3 attempts
- One hand-authored theme with 8 shared items + 5 plants
- Host screen: theme, lock counter, tally, OFF-MENU row, final reveal
- Phone: 3×3 grid, tap to select, confirm to lock, waiting state
- Win/lose card, no scoring, no persistence

## Out of scope

- More than 3 players, multiple rounds, theme packs, LLM-generated plants, spectators, rejoin-after-disconnect polish, sound.

## Risks & unknowns

- Plant quality is the whole game; a plant that isn't clearly the best answer makes the round feel like a normal matching game. Needs playtesting on maybe 20 candidate plants.
- Three attempts may be too few once players get paranoid — tune to 4.
- Players may screen-share by leaning over; the scrambled layout helps but the real defense is a 30-second clock.

## Done means

Three phones join a code, each sees a nine-tile board with a distinct plant, all three lock, the TV shows a tally where the off-menu count matches the number of planted picks, and a round where all three converge on one shared item ends in a win screen listing all three plants.
