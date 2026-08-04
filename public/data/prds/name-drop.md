## Overview

A fast, loud 4-player game for the Anomia crowd — the people who love the brain-lock of racing to name a cereal brand while someone screams at them. Name Drop keeps the panic and removes the public match: your trigger symbol is private, so you never know whether the shape on screen is a duel or an empty window until someone else lunges.

## Problem

Anomia's match condition is public. Both players see the collision at the same instant, so the whole game is raw reaction speed — no read, no bluff, no information. It's brilliant for ninety seconds and then it's just a reflex test. We want the reflex kept and a slow-burning information game grown underneath it.

## How it works

The host screen shows one public category ("breakfast cereals") and a big symbol tile that flips every 2.5 seconds through a deck of 8 shapes, 20 flips per round.

**Private, per phone:** one symbol — your **tell** — plus your live score and a single giant BLURT button. Tells are dealt so that exactly one pair of players collides; the other two are singletons. Nobody knows which they are.

When your tell appears, you want to be first: tap BLURT and immediately say a valid category answer out loud. The first tap in a window opens a 5-second say-it timer, and every *other* phone shows ✓ / ✗ for that spoken word — simultaneous, hidden, majority rules, default ✓ on timeout.

Scoring:
- Valid word, symbol **was** your tell: **+3**
- Valid word, symbol was **not** your tell (a steal): **+1**, and the true owner loses 1 for the denied window
- Invalid word, or a word already burned this round: **−1**

So bluff-blurting is a real move — you jump a shape you suspect belongs to someone else to deny them. And every lunge is evidence: the room learns which shapes make you twitch, and by flip 12 you can start predicting your rival's tell and camping it. That read only exists because tells are private and simultaneous — everyone watches one shared stream but each is waiting on a different shape. Pass a single phone around and there is no stream, no simultaneity, and nothing to read.

Reveal: the host screen shows all four tells and names the colliding pair.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object per room. State: `{code, category, deck[8], players[{id,name,tell,score}], flipIndex, flipPaintedAt, usedWords[], windows[{symbolId, firstTapId, correctedMs, verdicts{}}]}`.

The hard part is honest sub-100ms tap ordering over house WiFi, where RTT jitter runs 20–120ms. Three pieces: (1) each phone runs a 5-ping NTP-style handshake at join to estimate its clock offset; (2) the host tab reports the `requestAnimationFrame` paint timestamp of each flip as the real t=0, since server flip time ≠ pixels-on-screen; (3) taps carry a client monotonic timestamp, the server corrects by offset, and any two taps within 60ms are declared a photo finish and both paid. Never resolve duels by server arrival order — that scores the WiFi, not the players.

## v1 scope

- Exactly 4 players, exactly 1 round of 20 flips
- 8 symbols, 1 hardcoded category
- Tells dealt to guarantee exactly one colliding pair
- Humans judge spoken words; no speech recognition
- Scores shown once, at the reveal

## Out of scope

- Multi-round play, symbol/category editors, ASR validation
- 5+ players, spectators, reconnect, anti-spam cooldowns beyond one tap per window
- Any animation beyond the flip

## Risks & unknowns

- Degenerate strategy: blurt on every single flip. Mitigation is the −1 and a 3-window cooldown after a failed steal — untested
- The ✓/✗ vote may kill the 2.5s cadence; capped at 5s with default-accept
- Symbol legibility from couch distance across 8 shapes
- Screen-peeking neighbours; "phones flat" is a house rule, not a feature

## Done means

Four phones and a laptop join by code. WebSocket frames confirm each phone receives only its own tell. A 20-flip round holds a steady 2.5s cadence with host and all phones agreeing on flip index within 100ms. A contested window resolves by corrected timestamp and the loser's phone reads "beaten by 0.31s". The reveal screen names the colliding pair correctly in five consecutive test rounds.
