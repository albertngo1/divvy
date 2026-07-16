## Overview
On the Nose is a concurrent-room party card game for 3-5 players: host TV as the shared table, each phone as a private hand. It takes the classic "bid exactly your tricks" trick-taker (Oh Hell / Nomination Whist) and strips away every tedious chore — dealing, trump-flipping, renege-policing, scorekeeping — leaving only the delicious tension of a SECRET contract.

## Problem
Trick-taking games have the best hidden-information tension in tabletop, buried under teaching overhead and rule-policing. Shuffling and dealing, remembering trump, catching someone who failed to follow suit, and tallying exact-bid scoring are all friction. And the sharpest variant — keeping each player's tricks-target SECRET — is nearly unplayable by hand because you must trust everyone to remember and reveal honestly. Private phones + an authoritative server make secret contracts trivially enforceable and the whole thing fast.

## How it works
The server deals each phone a private 5-card hand and flips a trump suit (shown on host TV). PRIVATELY on your phone: your hand, plus a one-tap SECRET bid — how many of the 5 tricks you swear to take, exactly (0-5). All bids are simultaneous and hidden.

Then play: the host TV shows the shared table — the current trick's played cards, trump, whose turn, and each player's running tricks-WON count (but never their targets). Your phone highlights only your legal cards (follow-suit auto-enforced — illegal cards are greyed, so no policing), plus a private "on track / over / under" nudge against your own hidden target. Tap to play; the server resolves trick winners and turn order.

At hand's end, targets flip face-up on the TV. Score: hit your number ON THE NOSE = 10 + your bid; miss by any amount = 0. Because targets were secret, the mid-hand meta is reading who's desperately dumping tricks vs. who's fishing for one more — a silent knife-fight the shared count hints at but never spells out.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {trump, trick[], turnOrder, phase}`, `Player {id, hand[], bid?, tricksWon}`. Sync: server owns the deck and all legality — clients send `PLAY(card)` and the server validates follow-suit, so a client literally cannot cheat or peek at another hand (privacy + rules are server-enforced). Deal uses a per-round seed passed via room config (no client Date.now/random). The genuinely hard part is crisp turn-by-turn real-time sync: every phone must update legal-move highlighting the instant the trick state changes, with a clean reconnect that restores your private hand.

## v1 scope
- 3 players, ONE deal of 5 cards each, secret bids, single trump.
- Auto follow-suit enforcement + auto trick resolution + exact-bid scoring.
- One hand, reveal targets, show winner. That's it.

## Out of scope
- Multiple hands / rounds, escalating hand sizes, no-trump rounds.
- Partnerships, special cards, animations beyond a basic table.

## Risks & unknowns
- Is secret bidding legible enough, or do players want targets public? A/B the reveal timing.
- Teaching trick-taking to non-card-players in one screen of rules.
- 5-card hands may resolve too fast to build tension — may need 6-7.

## Done means
Three phones each get a private hand, place a hidden bid, and play a full 5-trick hand where the server enforces follow-suit and turn order, resolves each trick correctly, then reveals targets and scores exact-hits — with no hand or bid ever leaking to another phone.
