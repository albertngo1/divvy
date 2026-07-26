## Overview
Elbows Out is a 3-4 player draft that takes 75 seconds. Twelve cards sit face-up on the host TV. There is no turn order, no pack passing, no waiting for the slow reader. You claim a card by pressing and *holding* it on your phone — and while you hold, your own screen goes tunnel-vision, showing only the tile under your thumb.

## Problem
Booster drafting is one of the great tabletop mechanics and one of the most tedious rituals: twenty minutes of passing sleeves, everyone stalled behind whoever reads slowest, piles that must be physically hidden, and hate-drafting that isn't remotely secret because everyone watched your hand hesitate. The tension — "will this wheel?", "does anyone else want this?" — is real. The ceremony around it is dead time.

## How it works
The TV shows twelve tiles, identical for everyone: colored rectangles with nouns. Each phone renders those same twelve tiles **tinted and numbered with your own private values** — every player draws a secret 1-9 value per tile, so you and your neighbor are staring at the same board seeing different treasure.

Press and hold a tile: a ring fills over 2.5 seconds and the card is yours, vanishing from every screen. But from the instant you press, your phone dims all eleven other tiles to slate. You cannot browse, cannot see what got taken, cannot see what got scorched. Release early to abort — free, except for the time and the blindness.

Contention is the game. If two players hold the same tile, the TV shows it glowing hot — public information that *somebody* wants it, never who or how many. The holders feel only a haptic stutter. If two rings complete on the same tile within the same window, the card is **scorched**: nobody gets it, it's gone, and a black mark stays on the TV. Greed destroys the thing.

Each player also gets one **Elbow** token: double-tap while holding to cut your ring to 1.2s. One elbow on a contested tile takes it clean. Two elbows on the same tile and both players are "tangled" — locked out for four seconds — and the card scorches anyway.

Round ends when six tiles are gone or 75 seconds elapse. TV reveals every pile, every private value sheet, and the scores.

Public on TV: board, heat, scorch marks, per-player card count. Private per phone: your value numbers, your ring, your blackout, your elbow.

## Technical approach
Authoritative WS server (PartyKit or Socket.IO over Tailscale Serve). State: `board[12] = {id, status: available|taken|scorched, holders: Set<playerId>, holdStartedAt: Map}`, `players[] = {privateValues: number[12], elbowUsed, pile[]}`. Phones send `hold_start(tileId)` / `hold_end` / `elbow`; the server owns all ring progress on a 20Hz tick and decides completion — clients render an optimistic ring but never award anything.

The hard part is fairness under uneven RTT. Two design choices do the work: the ring is deliberately *long* (2.5s), so 200ms of jitter is ~8% of a contest rather than a coin flip; and near-ties resolve to **scorch**, converting the unwinnable race into a shared bad outcome instead of an unfair win. Completions within 150ms of each other count as simultaneous.

Privacy is enforced server-side, not by CSS: private value arrays are only ever written to that player's socket, and the tunnel-vision blackout is real — the server *stops sending board deltas* to a holding player, so a tampered client genuinely cannot peek while committed.

## v1 scope
- 3-4 players, one round, twelve tiles, 75-second cap
- Private values: random 1-9 per tile per player, printed on the tile
- 2.5s hold, one elbow token, scorch on simultaneous completion
- TV: board, heat glow, scorch marks, per-player card counts
- Final reveal: four piles, four value sheets, four totals
- Colored rectangles and nouns — no art

## Out of scope
Multiple packs, wheeling, trading, set-collection contracts, reconnect, spectators, sound, animation polish, persistence.

## Risks & unknowns
- Could degrade into reflex-mashing. The long hold and the blackout cost are the anti-reflex design, but only playtesting proves the blindness actually hurts enough to make waiting a real choice.
- Scorch may feel too punishing if the room collides constantly; tunable fallback is earliest-start-wins with scorch reserved for double-elbows.
- Mobile touch handling: needs `touch-action: none`, pointer capture, and a guard against the tile scrolling out from under a thumb.

## Done means
Four phones and a TV join one room. Each phone shows the same twelve tiles with visibly different numbers. Holding a tile blacks out the other eleven on that phone within 100ms. A completed claim removes the card from all five screens within 200ms. A deliberate double-hold produces a scorch mark on every screen and awards the card to nobody. The final TV reveal shows four distinct piles and four different totals.
