## Overview
A 4-player real-time speed game for a living room with a TV and four phones. It steals Anomia's core — two symbols collide, the matched pair races to name something in the other's category — and moves the collision behind a per-phone curtain, so the duelists are blind to their own duel and everyone else is a referee with a megaphone.

## Problem
Anomia's joy is retrieval-under-pressure, but everyone sees the same tableau, so the game is purely a reaction race and the loser of every duel is just the slower brain. Meanwhile the two or three players not in the duel have nothing to do but watch. The itch: give the bystanders a job, and make the duel start late and messy instead of instantly.

## How it works
Each player holds a hidden pair: a **symbol** (one of eight shapes) and a **category** ("brand of cereal", "river").

Privately on your phone: your own **category**, large; and a row of the other three players' **symbols**, labelled with their names. You never see your own symbol, anywhere.

Publicly on the TV: names, scores, a clock. No symbols, no categories, ever — the TV cannot be personalised, so it holds nothing secret.

Anyone may tap FLIP at any time; the server deals that player a fresh symbol+category and repushes every projection. When two players share a symbol, the server says nothing. The two duelists each see one copy of that symbol on someone else's row and cannot know it matches their own. The other two see both copies side by side and know instantly.

So the bystanders shout: "PRIYA AND SAM — Priya you need a river, Sam you need cereal!" The duelists shout answers. The first **bystander** to tap a duelist's name settles it: +1 to that player, and the loser flips. Tapping when no duel is live costs the tapper a point, so the chorus has to be right, not just loud.

## Technical approach
Cloudflare Durable Object per room (single-writer, so flips serialise cleanly), phones as a PWA over WebSocket, host tab as a dumb subscriber.

State: `{players: {id, name, symbolId, categoryId, score}, liveDuel: [idA,idB]|null, tick}`. The server never broadcasts state — it computes a **per-socket projection**: `{yourCategory, others:[{name, symbolId}]}`. Your own `symbolId` is stripped at the projection boundary, not in the client. The host socket gets `{names, scores, clock}` and nothing else.

The hard part: leak-proofing under reconnect and race. A rejoining phone must be re-served a fresh player-bound projection, never a state replay it could diff. Two players tapping FLIP in the same 50ms must not both draw the same symbol slot; the DO's serialised execution handles it, but the projection fan-out has to be atomic with the deal or a phone briefly sees a stale row and reads a false collision.

## v1 scope
- 4 players, one 3-minute round, one shared symbol set of 8
- 12 hardcoded categories
- FLIP button, name-tap adjudication, integer scores
- Reveal screen at the end showing everyone's final pair

## Out of scope
- Judging whether an answer is actually a valid river
- Two simultaneous duels, wild cards, escalating decks
- Spectators, reconnect UX, sound effects, more than 4 players

## Risks & unknowns
- Do bystanders notice collisions fast enough, or does the game stall? Symbol distinctness is the tuning knob.
- Shoulder-surfing: a duelist glancing at a neighbour's phone sees their own symbol. Probably self-policing, possibly fatal.
- Crowd adjudication may deadlock into arguing. The false-start penalty is the only brake we have.

## Done means
Four phones and a TV in one room: a collision occurs, no duelist's device ever received their own symbolId in any WebSocket frame (verified by capturing frames), a bystander tap resolves the duel, and the TV score increments within 200ms of the tap.
