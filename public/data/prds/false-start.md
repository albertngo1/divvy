## Overview
A fast-recall duel game for exactly 4 players, one TV, and four phones. A phone-native riff on *Anomia* in which the **match** — the thing that starts the race — is private. Eight minutes, loud, for a party crowd that already knows how to shout.

## Problem
Anomia's engine is brain-lock: you know a hundred rivers and can name none. But the cardboard version leaks everything. The whole table sees the symbols collide, so everyone enters the race together and the loser is public before they open their mouth. There is no nerve, no bluffing, and none of the specific comedy of two people melting down while nobody else knows why.

## How it works
Each phone privately shows one card: a colored glyph (your **symbol**) and a **category**. Nobody else ever sees either.

The TV shows a round clock, four scores, and a flip counter. Nothing else. It is deliberately information-free.

Every 2 seconds the server flips one random player's card to a new symbol+category and the TV plays a neutral click — the room knows *a* card changed, never whose.

When a flip makes two symbols identical, only those two phones buzz and replace their entire screen with the **opponent's** category — a category that player has never seen — in huge type, for 5 seconds. Every other phone shows nothing new.

Both duelists slam the full-screen CALL button, then say an example aloud. First tap gets the floor; the table judges the answer by ear. Valid → +1 and you take their card. Invalid or timeout → the point goes to the opponent.

Anyone may slam CALL at any moment, including with no match. That is a **bluff-flinch**: it costs −1 and publishes your current card to the TV for 10 seconds. Faking panic to bait a rival into a false start is a real, priced move.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `{players: {id, symbol, category, score}, flipCursor, activeDuel: {a, b, deadline}}`. The server is authoritative and a phone never receives another player's card fields.

Sync runs on a fixed 100ms tick. Every tick, **every** phone receives an identically-shaped frame whether or not anything happened; duel starts appear only inside the two duelists' frames.

The hard part is fairness plus non-leakage at once. Tap ordering must use server receive time minus a rolling-median RTT estimate per client, or whoever is on bad wifi always loses. Non-leakage means killing the timing side channel: if only two phones got a packet, a player watching screens light up can infer the pair, so uniform per-tick frames are mandatory rather than an optimization.

## v1 scope
- Exactly 4 players, one 90-second round
- 24 categories and 6 symbols in hand-authored JSON
- Voice adjudication by the table; a host tap awards the point
- Bluff-flinch penalty and card exposure implemented

## Out of scope
Speech recognition, Anomia wild cards, chained steals, more than 4 players, spectator mode, persistent scores.

## Risks & unknowns
Bystanders may feel becalmed; if duels fire too rarely the round is dead air, so flip cadence needs tuning toward one duel per 8 seconds. Voice adjudication can stall on judgment calls. Latency correction may still feel unjust above a 150ms spread.

## Done means
Four phones join by QR. Across one 90s round at least six duels fire; in every duel exactly the two matched phones changed screen while the other two logged no state change; one recorded bluff-flinch deducted a point and exposed that player's card on the TV; and the replay log confirms no non-duelist phone ever received a duel payload.
