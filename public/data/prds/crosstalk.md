## Overview
A frantic real-time category-duel game for 3–5 players on a shared TV plus phone controllers. It riffs on Anomia: rather than a public pile of symbol cards everyone watches, **each phone privately runs its own shape+category stream**, and duels fire pairwise and simultaneously across the room the moment two hidden shapes match.

## Problem
Anomia's "OH — WE MATCH — GO!" panic is perfect, but it's bottlenecked: one physical deck, everyone crowded around one pile, and only a single duel resolves at a time. The itch is to keep that adrenaline while letting several private duels erupt at once and removing the shared-pile chokepoint entirely.

## How it works
Every ~2.5s each phone privately flips to a new card: a colored SHAPE (the match key) plus a CATEGORY ("ice cream flavors") shown only to that player. The server watches every live shape; when two players' shapes match, both phones buzz (haptic), flash "DUEL," and privately reveal the OPPONENT's category. The first of the two to slam their big buzzer button, then say aloud a valid answer in the opponent's category, wins; the opponent taps ✓/✗ to confirm. The TV shows the room, live "🔔 Alice ⚔ Bob" banners, and score. Because streams are private and independent, several duels can run at once.

**Private per phone:** your current category, and — only mid-duel — your opponent's category. **Shared on TV:** who's dueling, scores. Per-phone is load-bearing: N simultaneous private shape/category streams and pairwise private reveals can't exist on one passed phone.

## Technical approach
Host + phone PWA + authoritative WebSocket server (PartyKit / DO or Socket.IO). Data model: `Player{id, shapeId, categoryId, inDuel}`. The server owns a single flip clock and deals shapes weighted so collisions fire every few seconds. On collision it creates `Duel{a, b, startTs}`, locks both players, and pushes each the other's category. A buzz is a server-timestamped claim; first claim earns the say-it-aloud right; the loser can steal if the claimer's answer is tapped ✗. The hard part is **real-time fairness**: deterministic tie-break on near-simultaneous buzzes via server receipt order, and one authoritative flip loop so shape changes never race into missed or duplicated matches.

## v1 scope
- 3 players, ~90s round
- Fixed pool of 8 shapes, 20 categories
- Buzz-in + say-aloud + opponent confirms (no speech recognition)
- Score = duels won; TV shows live banners
- Cap at one concurrent duel if simultaneous proves hard

## Out of scope
- Speech recognition / auto-adjudication
- Wild cards, Anomia's chain/stacking matches
- Reconnect, >5 players, persistent scores

## Risks & unknowns
- Opponent-confirms adjudication invites griefing — acceptable for party v1.
- Tuning collision rate: frantic but not chaotic.
- Simultaneous duels may overwhelm 3 players; may force single-duel v1.

## Done means
Three phones join, each privately cycles shape+category, when two shapes collide both buzz and see the other's category, the faster buzzer says a valid answer and the opponent confirms, and the TV updates the score — with no shared card pile anywhere.
