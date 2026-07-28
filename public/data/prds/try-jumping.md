## Overview

A 10-minute party game for 3–6 people that steals the *asynchronous message system* from Souls-likes and runs it live, in one room, on everyone's phones at once. Each player descends their own private one-room-at-a-time dungeon. Nobody can see anyone else's dungeon. The only channel between players is a scrawled message from a fixed grammar, left on the floor for a stranger.

## Problem

Roguelikes are the loneliest genre and the Souls message board is the best social mechanic in games — but it's always dead-letter mail from a player who quit two years ago. Meanwhile every party game shoves the whole room at one shared screen. Nobody ever gets to be alone in the dark while their friends are alone in the dark six feet away.

## How it works

A run is five floors, each a 25-second decision.

**Your phone (private):** a short text room — *"A dry cistern. Doors: RED, BONE, GREEN. Something is humming."* — plus one or two unsigned messages other players left on this floor last time. You pick a door. Then you compose exactly one message from a closed vocabulary of ~18 tokens: `[PRAISE | TRY | BEWARE | NO]` + `[door / object noun]` + optional `[AND THEN …]`. You physically cannot write "but only if you have the lamp."

**The catch:** the generator secretly partitions players into seed groups each floor — sometimes all five share a dungeon, sometimes 3/2, sometimes everybody is solo. This is never disclosed. So `BEWARE GREEN DOOR` can be sincere, correct, and kill the person who trusts it.

**Host TV (shared):** the graveyard. After each floor, an anonymized death cam — *"Somebody opened GREEN. GREEN was a nest. They had read: TRY GREEN DOOR."* — plus a live appraisal ticker.

**Scoring:** +1 survive a floor. +2 when another player follows your message and lives. +1 when they follow it and die. Being *read* is what pays; the game never punishes lying, so the only enforcement is the room's suspicion.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs both join the same DO. Model: `Room{code, phase, floorIdx, seedGroups: playerId→groupSeed}`, `Player{id, name, alive, choice, message, score}`. Floors are `hash(groupSeed, floorIdx)` → deterministic layout, generated server-side; each phone only ever receives its own view. Phase clock is server-authoritative and broadcasts a deadline epoch-ms, not countdown ticks, so phones render smooth timers locally. Payloads are tiny, so the hard part isn't sync — it's the message router: at floor end the server picks 1–2 messages per player from *other* players, weighted ~60% toward same-seed-group senders so honest advice mostly works and betrayal stays surprising. That one weight is the entire game's feel. Second hard part: narrating the death cam without leaking who shared a dungeon with whom.

## v1 scope

- Exactly 4 players, 5 floors, 3 doors per floor
- 12 hand-authored floor templates, 18-token vocabulary
- No HP, no inventory: one death → you become a ghost who still writes messages
- One fixed seed-group schedule (all / 3-1 / 2-2 / all / solo), hardcoded
- Host TV shows death cam + score only

## Out of scope

Items, meta-progression, multi-run campaigns, custom vocabulary, audio, offline PWA install, spectator join.

## Risks & unknowns

Vocabulary too small and every message is identical; too large and it becomes Quiplash. Seed mixing could read as pure randomness rather than social drama. Ghosts may disengage. 25s may be too long once players learn the templates.

## Done means

Four phones and a TV complete a 5-floor run; at least one player follows another's message and dies; the death cam names the message they read; and in playtest the room spontaneously accuses someone of lying when they were honest-but-differently-seeded.
