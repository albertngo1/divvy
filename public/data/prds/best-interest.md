## Overview
A 3-player auction party game where nobody bids for themselves. Each player is the licensed **agent** for the player on their left, holding that person's money and that person's secret preferences on their own phone. For groups who like the shape of an auction but not the accounting.

## Problem
Auctions are the best tension engine in tabletop and the worst thing to run at a table: a banker, hidden bids on scraps of paper, cardboard screens, and constant "wait, how much do I have?" And once the bookkeeping is solved, plain auctions are dry — everyone optimizes their own sheet in silence. The itch: keep the auction, kill the ledger, and make the table talk.

## How it works
Three players sit in a ring: A is agent for B, B for C, C for A. Your **client** is the person to your left.

**Your phone privately shows** (all belonging to your client, never to you): their purse (20 coins), their **taste card** (3 of 8 symbols score double for them), and their **quota** (a minimum tableau value they must reach or you collect nothing). You never see your own purse, taste, or quota.

**The host TV publicly shows**: the lot on the block (an object with two symbols and a base value), a 15-second bid clock, every client's tableau of won lots, and each purse as a coarse four-notch bar — never an exact number.

Six lots go up one at a time. All three agents submit a sealed bid simultaneously on a slider capped by their client's real remaining coins. Bids reveal together on the TV; highest takes the lot for their client and pays from the client's purse. Tie → the lot burns and both pay half.

Talking is loud and legal, and this is the joke: clients have never seen their own taste card, so they shout confident, wrong instructions at the person holding their wallet. Agents must decide how much of the truth to leak.

**Scoring**: agent score = client's tableau value (taste symbols ×2) + client's leftover coins — but zero if the tableau misses the client's quota. Final TV flip reveals all three taste cards and quotas at once.

## Technical approach
Host browser tab + phone PWAs + one authoritative PartyKit Durable Object per room. State: `{lots[], purses{}, tableaus{}, secrets{playerId: {taste, quota}}, agentOf{}}`. The server keeps a **per-connection projection layer**: each socket is fed only `secrets[clientOf(me)]` plus public state. The genuinely hard part is not bid latency — it's guaranteeing the projection never leaks, including on reconnect and on late-join, and computing the coarse purse bars server-side so exact coin counts never touch the wire. Sealed bids are held server-side until a server-clock deadline; late frames are rejected, not queued.

## v1 scope
- Exactly 3 players, no more, no fewer
- 6 lots drawn from 12 authored ones, 8 symbols total
- One session, ~6 minutes, no rematch
- 4-letter room code, no accounts, no persistence
- Text-and-emoji lots; no art pipeline

## Out of scope
- 4-6 players and arbitrary agent rings
- Reassigning clients mid-game, firing your agent
- Sound, animation polish, spectators, leaderboards

## Risks & unknowns
- Quota tuning: too low and every agent hoards coins and skips bidding entirely.
- With 3 players a single aggressive agent can dictate all six lots.
- The comedy depends on clients being *specifically* wrong, not randomly wrong — taste cards must feel guessable-but-not.
- Tie-burn may read as punishing rather than tense.

## Done means
Three phones and a laptop join by code; six lots resolve with simultaneous sealed bids; inspecting the WebSocket frames on any phone shows zero bytes of that player's own taste card, quota, or exact purse; the final reveal flips all three secrets; and in 4 of 5 playtest groups at least one player audibly protests that they were sabotaged.
