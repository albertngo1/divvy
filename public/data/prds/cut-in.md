## Overview
Cut In is a one-round, four-player auction game for a TV and four phones. You bid for turn order, but you are never told your position — only your two immediate neighbors. Then you sealed-bid for the goods that turn order controls. For groups who like the knife-edge of a Ra or Amun-Re auction but not the arithmetic.

## Problem
Bidding for turn order is a great mechanic buried under bookkeeping: slips, a turn-order track, a marker shuffle, and a table-wide recount every round. And the interesting version — where nobody knows the full order — is flatly unplayable in person. It requires a neutral dealer whispering a different sentence to each player, simultaneously, without leaks.

## How it works
**Phase 1 — Bid (30s).** Each phone privately shows a purse dealt secretly and *unequally* (5–12 chips). You cannot see anyone else's purse. You commit a bid, 0 to purse. Highest bid gets slot 1. Ties break toward the smaller purse — a rule printed publicly on the TV.

**Phase 2 — Whisper (instant).** The server builds the queue and tells each phone two lines, and only those: `AHEAD OF YOU: Kai` and `BEHIND YOU: —` (a dash means you're an endpoint). So the first and last players know exactly where they stand; the two in the middle know almost nothing. That asymmetry is the game.

**Phase 3 — Talk (60s).** Open table, lying encouraged. The TV shows four lots worth 9, 6, 4, and 1, and the rule: lots are taken in queue order, and your score is `lot value − chips you bid`. Overpaying for slot 1 wins you nothing.

**Phase 4 — Claim (20s).** Each phone secretly submits a **primary** and a **fallback** lot. The server resolves in queue order: you get your primary if it's free, else your fallback if it's free, else nothing.

**Reveal.** The TV unmasks the queue, flies the claims in one slot at a time, and shows net scores.

## Technical approach
A single PartyKit room (or one Durable Object) is authoritative. State: `{players[4], purses, bids, queue[], claims: {pid:{primary, fallback}}, phase, phaseEndsAt}`. Phones are PWAs over WebSocket.

The hard part here is not latency, it's **information hygiene**. The queue exists on the server the moment bids close, and it must never reach a client until reveal. That means: no shared game-state broadcast, per-socket hand-built payloads, no queue in the TV's DOM before the reveal event, and a deterministic public tie-break so a suspicious player can verify the resolution from the final reveal alone. Phase timers are server-owned with `phaseEndsAt` timestamps; clients interpolate.

## v1 scope
- Exactly 4 players, one round, four fixed lots (9/6/4/1).
- One bid, one whisper, one talk timer, one sealed claim, one reveal.
- Purses dealt from a fixed set of four values.
- Room code only; no accounts, reconnect, or sound.

## Out of scope
Multiple rounds, more than 4 players, variable lots, chip carryover, in-app chat (the room talks out loud), spectator view.

## Risks & unknowns
With 4 players, two players learn their exact position for free — possibly too much. May need 5 players or a fake-neighbor bluff to fix. Talk phase could be silent with quiet groups. Fallback slots may make claims too safe and drain tension.

## Done means
Four phones and a TV complete a round; each phone's network log before reveal contains only its own purse and its own two neighbor names; a scripted run where two players claim the same lot resolves to the earlier queue slot and matches a hand-computed score table; and the TV reveal explains the outcome well enough that nobody asks what happened.
