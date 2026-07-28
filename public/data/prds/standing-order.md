## Overview
Standing Order is a four-player, eight-minute trading game for one TV and four phones. Your hand is not a hand — it is a **queue**. You can only spend the card at the front, you can never reorder it, and every card handed to you by a rival is wedged in at a slot *they* pick, shoving everything behind it deeper. It is for groups who like Bohnanza's cruelty but not its bookkeeping.

## Problem
"You may not rearrange your hand" is the best constraint in tabletop trading and the one nobody actually obeys — enforcement is social nagging and a fanned hand you can fidget with under the table. Worse, *insertion-position* trading is flatly unplayable with cards: you'd have to pass someone a card face-down and trust them to bury it exactly where you said, then trust yourself not to peek ahead. A phone enforces order perfectly and hides identity perfectly. That's the whole unlock.

## How it works
One round, five simultaneous ticks.

**Private on your phone:** your five-card queue rendered top-to-bottom with real card faces (copper / silk / ash). Only slot 1 is tappable. You can see your own future — which is the agony — and you cannot touch it.

**Public on the TV:** three Contracts ("2 copper", "1 silk + 1 ash", "3 of one good"), every player's queue drawn as a row of face-down slots so *length and position count are public but contents are not*, plus a live log ("Ana wedged something into Ben's slot 1").

Each tick every player simultaneously chooses one action:
- **Fill** — spend slot 1 into a matching contract.
- **Wedge** — give slot 1 to another player and pick which slot of their queue it lands in.

All four choices reveal at once. Two players filling the same contract jams it: both cards burn, nobody scores it. Wedges resolve after fills in seat order, clamped to current queue length, animated on the TV as a visible shove. Score = contracts filled. Your unusable ash card stops being dead weight and becomes ammunition: dropped into someone's slot 1, it costs them their entire next tick.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / one Durable Object per room, or Socket.IO behind Tailscale Serve).

Data model: `Room {code, tick, contracts[], seatOrder[], log[]}`, `Player {id, name, queue: CardId[], filled: ContractId[]}`, `Card {id, good}`, `Move {kind: 'fill'|'wedge', contractId?, targetId?, slot?}`. Server holds the only real queues; phones get their own full queue and everyone else's queue *lengths* only. Sync is lockstep, not free-running: collect four moves (or a 20s timer), resolve, broadcast a per-socket-filtered snapshot with a tick number.

The genuinely hard part is not throughput, it's **legibility of a shifting index**. You chose "slot 2 of Ben's queue" against a stale snapshot; by resolution, Ben has filled a contract (queue shrank) and Cara wedged before you (queue grew). Rule: indices are interpreted against the post-fill, post-earlier-wedge queue and clamped to `[1, len+1]`, and the TV animates each shove in seat order so players *learn the physics* rather than reading it in rules text. Second hard part: an idle phone can't stall the room, so unsubmitted moves default to "wedge slot 1 into the player with the shortest queue, at the back."

## v1 scope
- Exactly 4 players, 1 round, 5 ticks, then a score screen.
- 3 goods, 12-card deck, 5-card starting queues, 3 contracts.
- Two actions only: fill, wedge.
- Room code join, no accounts, no reconnect grace beyond a 30s socket hold.
- Host screen: contracts, queue-length rows, log, tick timer.

## Out of scope
- Multi-round play, escalating contracts, currency, negotiation chat.
- 5+ players, spectators, mobile host.
- Animations beyond the shove; sound.
- Bots, matchmaking, persistence.

## Risks & unknowns
- **Wedging may dominate filling.** If nobody ever fills, the round is a stalemate of mutual sabotage; may need contracts to pay escalating points per tick elapsed.
- Seeing your own locked future could read as helpless rather than tense — needs playtest to confirm the agony is fun.
- Clamping might feel arbitrary the first time it bites.

## Done means
Four phones join a room from a code. Each player sees only their own five faces; the TV shows only face-down slots. In a single tick, two players fill the same contract and it visibly jams while a third player's wedge lands at slot 1 of a queue that just shrank — and the target's phone shows the correct card in slot 1 within 500ms of reveal. Final scores print. No phone ever receives another player's card identity in any payload (verified by reading the socket log).
