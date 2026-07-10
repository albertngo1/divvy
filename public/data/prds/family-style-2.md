## Overview
Family Style is a 3–5 player betting game that hijacks the most ordinary group ritual — deciding what to order — and turns it into a hidden-agenda market. A fictional restaurant menu lives on the shared host screen; every player secretly wagers on which dishes the table will end up choosing, then has to steer a real out-loud argument toward their bets without anyone realizing which dishes they're holding. For friends who like a little Diplomacy with their dinner.

## Problem
'What should we get?' is a conversation everyone has had a thousand times and never once as a game. It's passively consumed: someone suggests, everyone shrugs, the loudest person wins. The itch is that there's already secret preference, persuasion, and bluffing latent in the ritual — nobody has ever put money on it.

## How it works
The host screen shows a menu of 6 dishes (name, cute description, a price). Each PHONE privately shows that player's betting slip: 3 chips to distribute across dishes as a prediction of which 3 dishes the table will finally 'order' (i.e. win the public vote). Bets are locked and hidden — nobody sees anyone's slip.

Then a 60-second **table talk** timer runs. Players argue out loud for and against dishes — the catch being that arguing for the dishes you bet on is transparent, so good players shill decoys and quietly nudge toward their real holdings. When the timer ends, every phone privately casts one open pick (their sincere top dish). The host tallies picks; the top 3 vote-getters become 'the order' and appear on screen. Payout: chips sitting on ordered dishes pay 2×; chips on losers are lost. The private slip is the whole game — reveal it and bluffing collapses, which is why one passed-around phone cannot work.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { menu[6], phase, players[] }`, `Player { id, chips:{dishId:count}, finalPick, locked }`. Server holds all slips; host only ever receives aggregate/phase signals, never per-player bets, until reveal. Sync: phases (`bet → talk → vote → resolve`) broadcast by server; the talk timer is server-authoritative so all phones count down together. The genuinely hard part is nothing latency-wise (it's turn-gated) but **information hygiene** — guaranteeing a bet payload never leaks to the host socket or to other players, and that reveal happens atomically so nobody can screenshot-race the vote.

## v1 scope
- 3 players, one fixed 6-dish menu, one round.
- 3 chips each, flat 2× payout, single winner by chip total.
- Text-only menu, no art.

## Out of scope
- Multiple rounds / running bankroll.
- Real menu import or photos.
- Dynamic odds, short-selling, sabotage cards.

## Risks & unknowns
- Does a 60s argument actually move votes, or do people just pick what they wanted? Needs a decoy incentive strong enough to reward manipulation.
- With 3 players the 'top 3 of 6' resolution may be too loose; may need top-2.

## Done means
Three phones join from a QR code, each privately places 3 chips unseen by others, a shared 60s talk timer runs, everyone casts one hidden pick, the host reveals the order and pays out, and no player's pre-reveal slip was ever visible to anyone else.
