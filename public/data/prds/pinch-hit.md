## Overview
A phone-native Anomia riff for exactly four people in a living room. Everyone privately authors one category — a trap they will never have to answer. The TV runs a symbol-matching engine. When two players' symbols collide, their phones *swap*: you must instantly shout an example of a category you have never laid eyes on, written by someone sitting three feet away.

## Problem
Anomia's joy is the retrieval choke — the moment your brain locks up on "name a cereal." But the categories sit face-up on public cards, so you get a half-second of prep and the deck is finite and impersonal. Meanwhile the party-game shelf is stuffed with "write something secret, reveal it, vote." Almost nothing makes the private thing a *weapon that fires at an unpredictable moment*.

## How it works
1. **Arm.** Four phones join by room code. Each privately shows a text field: "Write a category. You will never have to answer it." ("hot sauce brands", "things in Dana's car"). TV shows only `3 of 4 armed`.
2. **Idle.** TV shows four tiles, one per player, each bearing a glyph from an 8-symbol set. Every ~1.8s the server flips one random tile. Phones show nothing but your own name and score — the calm.
3. **Collision.** Two tiles match. Server freezes flips, publishes *both* category texts on the TV, and pushes to each duelist's socket only the single category **they** must answer — full-bleed, red, 10s ring. Non-duelist phones become judge panels.
4. **Blurt.** Duelists shout out loud. First to slam CLAIM takes the point optimistically; the TV bangs. Either judge has 3s to hit CHALLENGE, which opens a YES/NO validity vote; unanimous NO revokes the point and gives the opponent a 5s free window.
5. **Stall penalty.** If nobody answers in 10s, the *author* of each unanswered category loses a point — traps must be answerable.

**Private:** your authored category until it fires; which of the two published categories is yours during the duel. **Shared:** glyphs, scores, both texts once a duel starts, the claim bang.

## Technical approach
PartyKit Durable Object per room; phones are a PWA over WebSocket; the TV is a read-only client. Model: `Room {players[], categories: Map<pid,{text,authorId}>, tiles: Map<pid,glyph>, duel: {a,b,deadline,claim}|null, scores}`. Server authoritative — flips run on a server tick and collision detection is server-side only, so no client can pre-empt. **Hard part one:** fair claim ordering under variable phone latency. Piggyback an NTP-style clock offset on the ping loop, stamp claims with client monotonic time, correct server-side, and inside a 150ms window declare a tie — no point, giant TV "PHOTO FINISH." **Hard part two:** the swap payload must be strictly pairwise — sent per-socket, never broadcast, until the TV publish event fires in the same tick.

## v1 scope
- Exactly 4 players, one 3-minute round.
- One authored category per player, plain text, no moderation.
- 8 hardcoded glyphs, fixed 1.8s tick.
- Optimistic claim + 3s challenge; judge panel is two buttons.
- Room code, no accounts, no persistence.

## Out of scope
Speech recognition or auto-validation; teams; more than four players; prewritten category decks; profanity filtering; reconnect-after-disconnect.

## Risks & unknowns
- Tap-based judging may murder the pace; "loser concedes" might be better.
- Players may author unanswerable categories; the stall penalty may be too weak a deterrent.
- Collision cadence tuning: too rare is dead air, too frequent is noise.
- Two people shouting in a small room makes "who said it first" genuinely ambiguous.

## Done means
Four phones and a TV in one room, one 3-minute round, at least six duels fire. Each duelist's screen shows only their assigned foreign category; the TV never renders a category before its duel; a claim resolves visibly in under 300ms; a challenge correctly revokes; final scores match a hand tally.
