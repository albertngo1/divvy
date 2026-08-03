## Overview

A 4-player Anomia riff for a living room with a TV and four phones. Anomia's joy is brain-lock: you know the answer and your mouth won't produce it. **Everyone But You** adds a second panic on top — you cannot see your own category card. Everyone else can. Every phone renders a different redaction of the same shared truth, which is exactly what a single passed-around phone cannot do.

## Problem

Digital Anomia clones are just flashcards with a buzzer. The interesting information asymmetry in party games is rarely "I have a secret" — it's "everyone knows something about me that I don't." No phone-native party game mines that, and it's the funniest shape in the room.

## How it works

1. Four phones join a room code shown on the TV. The server deals each player a hidden category ("breakfast cereals", "things in a hotel room", "words that start with S", "things that are green").
2. **Phone, private:** the other three players' categories, plainly listed, plus a black redaction bar where yours would be, plus a big BUZZ button.
3. **TV, shared:** four player tiles, each showing a colored shape. Every ~2.5s the server flips one tile's shape. Categories never, ever appear on the TV.
4. **Duel:** when two tiles show the same shape, the TV flashes those two names. Both duelists' phones buzz: "DUEL vs Priya — name something in HER category: *hotel rooms*." Each duelist can read the other's card because it isn't theirs.
5. First duelist to tap BUZZ and say a valid instance aloud takes the point.
6. **The landmine:** the word you shout must not also fit your own hidden category. You cannot check. The two non-duelists — whose phones show *both* duelists' cards — get a 5-second FOUL/CLEAN tap. Unanimous FOUL voids the point and hands it to your opponent, with no explanation given.
7. After six duels the TV reveals every player's own card last. That's the payoff: you learn you'd been standing on "things that are green" while shouting "lime" at Priya.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `{players:[{id,name,category,shape,score}], duel:{a,b,openedAt,buzzes[],votes{}}, phase}`. Sync is server-authoritative with **per-socket view projection**: `projectFor(playerId)` strips `players[me].category` before serialization. The secret never reaches the client — no CSS blur, no client-side masking. The TV socket gets a public projection with all categories removed.

Hard part: buzz fairness. Server-arrival timestamps punish the player on bad wifi. Mitigation: a 5-ping clock handshake at join establishes each phone's monotonic offset; buzz events carry a client stamp, the server clamps corrections to ±250ms, and anything inside a 150ms window renders on the TV as a photo-finish with both names before resolving. Second hard part: the shape dealer must produce a duel every ~8s without producing constant duels — a weighted deck that biases toward collisions with players who haven't dueled recently.

## v1 scope

- Exactly 4 players, one round, six duels, then reveal.
- 24 hard-coded categories, 6 shapes.
- Voice adjudication by the room; BUZZ only records order, it does not capture the word.
- FOUL/CLEAN vote is unanimous-or-nothing.
- Score is a plain integer on the TV.

## Out of scope

Speech recognition, multiple rounds, 5+ players, rematch/lobby persistence, animations beyond the photo-finish, accounts, category packs.

## Risks & unknowns

Fouls may fire too rarely to matter — category overlap needs tuning so roughly one in five duels is a landmine. Non-duelists may not tap fast enough; a 5s window may need to become 8s. Voice-first play means loud rooms will contest who spoke first, and the buzz order must be trusted as the tiebreak.

## Done means

Four phones join, each shows three categories and one black bar, six duels resolve with correct buzz ordering under simulated 300ms jitter on one phone, at least one foul is voted and voided, and the final reveal screen shows all four cards. No player's own category ever appears in their socket's payload — verified by inspecting the wire.
