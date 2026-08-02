## Overview

A 4-player cooperative deduction-and-navigation game. One player, the **Pilot**, holds the only map on their phone. The other three are **Tokens** on that map — they cannot see it, and they each hold a private hand of four movement vectors. The Pilot gives orders out loud; the Tokens must obey with whatever card they've actually got, which is usually the wrong shape. The round is spent inferring what your own pieces are still capable of.

## Problem

Blind-navigation party games make the sighted player a dictator and everyone else a keypad. Here the pieces are *unreliable hardware*: the Pilot's orders are suggestions, and half the skill is reading which of your three pieces still has a short move left before you ask it to thread a gap.

## How it works

Pilot's phone (private): an 8x8 grid with walls, three colored tokens, three matching colored goal tiles, and a move budget of 12. Nobody else sees it — not the TV, not the Tokens.

Each Token's phone (private): four cards, dealt at random and unique per player, each a vector like `N2`, `E1`, `SW3`, `S1`. Plus one line of feedback after each move: BLOCKED, or MOVED, or ON GOAL. No grid. No idea where they are.

Host TV (public): a blank sheet that fills in with the *actual paths* the tokens have taken — breadcrumb trails only, no walls, no goals. Everyone can see the shape of the journey and nobody but the Pilot knows what it means.

A turn: the Pilot says out loud "Blue, two north." Blue looks at their hand, picks the least-bad card, taps it. That card is spent forever. The server resolves the move against the real grid (walls stop you short; you keep the shortfall as nothing). The Pilot watches Blue's token slide east-three instead and now knows something ugly about Blue's remaining hand.

The only speech rule: **Tokens may not name their cards.** They can groan, they can say "that's going to be bad," they cannot say "I only have SW3." The Pilot may say anything. Round ends when all three tokens sit on their matching goals (win) or the 12 shared moves run out (loss).

## Technical approach

PartyKit Durable Object per room; host tab + four phone PWAs over one WebSocket. Server state: `grid` (8x8 wall bitmask), `tokens: {color, pos}`, `goals`, `hands: {playerId: Card[]}`, `movesLeft`, `trails: {color: pos[]}`.

Strictly role-scoped broadcasts: `PILOT_STATE` (grid + tokens + goals), `HAND_STATE` (that player's own cards only), `HOST_STATE` (trails + moves left, no grid). Hands are dealt server-side from a seeded deck that is guaranteed solvable — generate the maze and goals *backwards* from a random legal sequence of 12 vectors, then deal each player their own subsequence plus one junk card. That solvability generator is the genuinely hard part, more than sync: a random deal is unwinnable most of the time and the game dies in playtest.

Sync itself is easy — one move at a time, server-authoritative, no simultaneity. The subtle bug is turn ownership: two Tokens tapping at once must not both resolve, so moves carry a monotonic `moveSeq` and the server rejects stale ones.

## v1 scope

- 4 players (1 Pilot, 3 Tokens), one 8x8 grid, one round, 12 moves
- 4 cards per hand, one deal, no redraws, no discards
- Feedback strings limited to MOVED / BLOCKED / ON GOAL
- Host TV: trails + move counter + win/lose card
- Room code join; Pilot is whoever joins first

## Out of scope

Multiple rounds, Pilot rotation, hazards, card refresh, scoring, hidden goals, more than 3 tokens, reconnect handling.

## Risks & unknowns

The deduction layer may be too thin — with 4 cards, the Pilot may just brute-force. Mitigation: shrink the move budget so guessing is expensive. Tokens may feel passive between their own turns; watching the TV trail should carry that, but it might not. Card-naming is enforced socially, and one honest table will break the whole game in ten seconds.

## Done means

Four phones join; only the Pilot's device ever receives grid data; each Token sees a distinct four-card hand; a spoken order resolves into a card tap that moves a token wrongly and visibly; the host TV draws trails without terrain; the round terminates in a win or a move-out loss.
