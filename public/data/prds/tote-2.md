## Overview
A private parimutuel party game for 3-6 people facing any 'menu' of options on the shared screen — dishes, movie trailers, songs, cocktails. Instead of the usual passive 'what should we get?' chatter, the room becomes a betting tote board where reading the crowd pays.

## Problem
Deciding what to order/watch as a group is a slow, passive shrug-fest — everyone browses the same list and mumbles. There's real hidden signal in who wants what, but no stakes and no reward for reading the room correctly.

## How it works
The host TV displays a lineup of 4-5 items from a 'menu' (v1: dishes). A betting window opens. Each phone PRIVATELY distributes a stack of chips across the items — a wager on which one the room will ultimately crown. It's parimutuel: the total wagered on each item forms live odds shown on the host TV as a moving tote board, but WITHOUT revealing who bet what. Backing the obvious favorite pays little (pool split many ways); finding an underbet dark horse that still wins pays big. When betting closes, every phone PRIVATELY casts one true 'I'd order this' vote. The item with the most votes is the winner; the pool pays out to everyone who wagered on it, proportional to their stake. The spice: because you both bet AND vote, you can cast your real vote strategically to shove your own wager over the line — a delicious tell if anyone's watching the tote shift.

PRIVATE per phone: your chip allocation across items, your final vote. SHARED on host: the menu, the live aggregate tote board (odds only, never identities), the reveal, payouts. A single passed phone can't hold N players' simultaneous secret bets and votes — the concealed, concurrent wager is the whole market.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{menu:[items], phase:'bet'|'vote'|'reveal', pools:{itemId:total}, players:{id, chips, bets:{itemId:amount}, vote}}. Sync: server aggregates hidden bets into pool totals and pushes only the anonymized tote board to the host on each change (debounced). Phase transitions are server-timed with a countdown mirrored to all clients. Hard part: making the live tote feel alive and honest while keeping individual bets secret — solved by broadcasting only summed pools, never per-player deltas, and locking all bets atomically at the phase boundary so no one can react to the final board. Payout is a pure pool-split computed server-side at reveal.

## v1 scope
- 3 players, one round
- 4 hardcoded menu items
- Fixed chip stack per player
- One bet phase + one vote phase + reveal
- Anonymized live tote board on host
- Pool-split payout, show winner

## Out of scope
Multiple rounds/bankroll, non-dish menus, more than 5 items, tie-break subtleties beyond a simple rule, spectators, custom uploads.

## Risks & unknowns
With 3 players the market is thin — does contrarian payoff feel meaningful? Tie handling in the vote; whether people grasp bet-then-vote in one sitting; keeping the tote honest without leaking identities.

## Done means
3 phones join, each privately allocates chips across 4 items, the host tote board updates anonymously, betting locks, each phone privately votes, the winning item is revealed, and the pool pays out correctly by stake — with no individual bet or vote ever exposed to other players.
