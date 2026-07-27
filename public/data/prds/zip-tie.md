## Overview

A four-prompt game for 3–5 people around a TV where the punishment for colliding isn't a score penalty — it's forced partnership. Collide and you are physically (on screen) zip-tied to the person you matched, and you stay tied. The game is a slow collapse from four independent people into one screaming blob.

## Problem

Every "don't say the same thing" game punishes with points, which is abstract and forgotten by the next prompt. The genuinely dreaded outcome in a party is being *stuck with someone* — having to negotiate, out loud, in front of people who don't have to. That's the punishment worth building.

## How it works

Four prompts, all answered simultaneously, 8 seconds each.

**Public on the TV:** the category ("something you'd find in a hotel room"), a countdown, and avatars. Nothing else.

**Private on each phone:** a menu of 5 options drawn from a hidden shared pool of 9, with overlaps deliberately engineered — some options sit on every phone, some on exactly one. You cannot see anyone else's menu, so you're guessing which of your five is *rare*. Pick one.

At reveal, any option chosen by two or more players zip-ties those players — permanently, and transitively (a weld through a shared member merges whole blobs). The TV cinches their avatars together with a ratchet sound.

From then on, a tied blob shares **one** answer slot, and its menu is the **intersection** of its members' menus — which shrinks as the blob grows, and if it's empty the blob auto-forfeits the prompt. Their phones now stream each other's live highlighted selection at 10 Hz: privacy is gone, that's part of the sentence. Final score is points ÷ blob size. The last untied player usually wins while the three-blob is still arguing over its two remaining options.

## Technical approach

One Durable Object (or Socket.IO room over Tailscale Serve) per game. State: `players[]`, `menus: playerId → optionId[]`, `blobs` as a union-find over player ids, `picks[promptIdx]`. Server is authoritative for the 8-second deadline, the union-find merges, and blob resolution: a blob's answer commits only if every member's current highlight is identical at the deadline.

Menu generation is the real content problem — sampling 5-of-9 per player at runtime rarely yields good pairwise overlap (target 2–3) or a nonempty-but-tight intersection after a weld. Precompute valid incidence matrices offline per player count and pick one at room start.

The genuinely hard part is that **the privacy boundary is dynamic**: when a weld fires mid-game, the server must re-scope what each socket may receive, upgrading welded sockets to a blob channel that carries partner highlights, while never retroactively leaking an untied player's menu to anyone. Get the scoping wrong once and the whole hidden-information layer evaporates.

## v1 scope

- Exactly 3 players, 4 prompts, one hardcoded category set
- Weld = shared slot + intersection menu + split score; no untying, ever
- Live partner-highlight stream for welded phones only
- One ratchet SFX, one reveal screen, one final score
- Room code, no accounts, no rejoin, no persistence

## Out of scope

Cutting ties, 6+ players, custom or user-written categories, multiple rounds, spectators, reconnection handling, any sound design beyond the ratchet.

## Risks & unknowns

At 3 players a full weld on prompt one ends the game as a whimper — the blob-size score cliff and prompt count need tuning together. Welded pairs might simply agree instantly and deflate the punishment; the intersection menu is the intended brake but may over-correct into constant forfeits. Empty intersections might feel arbitrary rather than funny. Menu overlap tuning is the difference between "clever guess" and "coin flip."

## Done means

Three phones, four prompts, and a playtest where a collision on prompt two visibly ties two avatars on the TV, both phones switch to a shared shrinking menu with a live partner cursor, the pair audibly negotiates out loud, and the untied third player wins on the points-÷-blob-size math without ever having spoken.
