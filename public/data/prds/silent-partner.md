## Overview
A 12-minute stock-majority party game for 3-5 players, based on the merger moment in Sid Sackson's Acquire. The TV shows a small grid where hotel chains grow. Each phone privately holds that player's shares, cash, and hand of tiles. For groups who love the 'who controls this company?' tension but dread the tedious bit that comes after it.

## Problem
In person, Acquire's best moment is also its slowest. When chains merge, everyone puts their stock face-up, counts it, argues about ties, and makes change for majority and minority bonuses. Holdings are open information in practice, because anyone can count your stacks, so the bluff disappears. Phones keep holdings truly secret and make the merger payout instant. Merging the right chain at the right time becomes a guess about holdings you can't see, which is the interesting part.

## How it works
- **Host screen:** a 6x6 grid with 2 chains (Gold, Teal) plus loose tiles. For each chain it shows size, share price, and *shares remaining in the bank*. Total demand is public; who holds the shares is not.
- **Phone (private):** your hand of 3 grid tiles, your cash ($60), and your share counts. You also see a highlight on any tile in your hand that would trigger a merger.
- **Flow:** 8 turns. On each turn the active player places one tile from their phone. Then *everyone at the same time* gets 15s to buy up to 2 shares. Buying all at once keeps the game moving and stops anyone copying a rival's purchase.
- **The merger:** someone plays the joining tile. The bigger chain absorbs the smaller one, and the server pays the smaller chain's majority (10x price) and minority (5x price) bonuses straight to phones. Ties split, as in Acquire. The TV shows only 'Bonuses paid: 2 players.' Your phone shows what you got.
- **Endgame:** all stock is sold at final price and cash is ranked. The TV then reveals everyone's holdings history as a timeline, which is the payoff moment.
- Bluff layer: buying loudly while saying you're dumping Teal is legal, and the bank-remaining counter is the only check on it.

## Technical approach
The server is an authoritative Socket.IO room over Tailscale Serve, with state in one in-memory object per room. Data model: `grid[36]`, `chains {id, tiles[], price}`, `players {id, cash, shares{chainId:n}, hand[3]}`, `bank {chainId:n}`. The buy phase is a timed batch: purchases are queued, then applied in a random order if the bank runs short (pro-rata looks unfair; random order works better at the table). Merger resolution happens in one transaction on the server. Each phone's private payout goes to its own socket, and the host gets only the count of players paid. The hard part is game design, not sync: v1's 2 chains and 8 turns must guarantee exactly one merger. Seed the tile bag so that a joining tile exists in someone's hand by turn 5-7.

## v1 scope (humiliatingly small)
- 3-5 players, one game of 8 turns
- 2 chains, a 6x6 grid, one guaranteed merger
- Simultaneous buy window, max 2 shares
- Private payouts, endgame holdings reveal
- No selling, trading, or holding stock across a merger

## Out of scope (for now)
The full 7-chain Acquire, sell/trade/keep merger choices, chain founding bonuses, more than one game, AI players.

## Risks & unknowns
- With only 2 chains there may be too little to work out, so the merger might feel like a lottery.
- The bank-remaining counter may leak holdings too fast with 3 players.
- Sequential tile turns could drag. If so, put a 10s limit on placement.
- It's close to the original. The novelty depends entirely on payouts staying hidden, which needs to show up in playtesting.

## Done means
Four players finish a game in under 12 minutes. Exactly one merger fires, and the server pays the correct majority/minority bonuses, ties included, checked against a hand-calculated test case. The TV never shows an individual holding before the endgame reveal. In a post-game poll, at least half the players say they changed a purchase or tile play because of a guess about someone else's hidden holdings.
