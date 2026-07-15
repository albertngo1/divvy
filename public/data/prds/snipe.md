## Overview
Snipe is a 3-6 player auction party game where every phone is a private proxy-bidding terminal, like eBay's max-bid feature turned into a spectator sport. The shared TV is the auction house; each phone is your sealed paddle. It's for groups who love bluffing and light economy games and are bored of Quiplash.

## Problem
The most interesting auction mechanic — a *proxy/max bid*, where you privately commit the highest you'd ever pay and the system bids up on your behalf, so you only pay one increment over the runner-up — is impossible to run fairly at a table. In person you get either chaotic shouting (everyone talks over the auctioneer) or agonizing turn-by-turn bidding, and any sealed variant needs one trusted person holding everyone's secret numbers. The secret ceiling is exactly the fun, and it's exactly what a kitchen table can't keep honest.

## How it works
The host TV presents one Lot at a time — deliberately petty prizes ("The Last Slice," "Aux Cord All Night," "Skip One Chore"). Each player has a secret, *unequal* starting budget shown only on their own phone. Privately, each phone sets a MAX ceiling with a slider and taps Commit; no one sees anyone else's number. When all have committed (or a 15s timer fires), the host runs an animated bid-war: starting at the reserve, paddle numbers auto-climb, alternating between the two highest hidden ceilings until the lower one is exceeded — gavel drops. The winner pays runner-up + 1 (second-price), deducted from their secret budget.

Private per phone: your exact budget, your committed ceiling, and a subtle "you're about to overpay" nudge. Shared on TV: the current lot, the live climbing price during the reveal, the final sale price and winner, and everyone's *remaining* budget as a vague bar (never an exact number). Because the sale price leaks a floor on the winner's ceiling, each lot feeds table-talk and reads for the next.

## Technical approach
A PartyKit / Durable Object room (or Socket.IO over Tailscale Serve) holds authoritative state: `{players:[{id,budget,committedCeiling}], lot, phase}`. Phones POST a sealed ceiling; the server never broadcasts raw ceilings — only derived events. On resolve, the server computes winner, second price, and a deterministic list of animation frames (price steps + which paddle leads) and ships that to the host to render; phones show only "you won / you were sniped." The genuinely hard part is trust and timing: ceilings must stay server-side until resolve (a leaked ceiling ruins the round), simultaneous commits need a clean barrier, and equal-ceiling ties need a fair, pre-seeded tiebreak so the reveal is reproducible.

## v1 scope
- 3-4 players, one device each, one session of exactly 3 lots.
- Fixed prize deck, fixed unequal starting budgets.
- Slider ceiling + Commit; server-run animated resolve; running budget bars.

## Out of scope
- More than 4 players, custom prize decks, multiple auction formats.
- Reconnection/spectator flows, sound design, persistent accounts.

## Risks & unknowns
- Second-price economics may feel unintuitive to casual players; needs a crisp one-line explainer on the TV.
- With tiny budgets the math is legible enough to "solve"; prize desirability must vary to keep bluffing alive.
- Animated reveal must feel tense, not slow.

## Done means
Four phones each commit a hidden ceiling on a lot; the host animates a bid-war between the top two hidden ceilings; the correct winner pays exactly runner-up + 1; budgets update; and at no point is any losing ceiling visible on any screen.
