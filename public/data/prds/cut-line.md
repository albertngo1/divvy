## Overview
Cut Line is a 3-player fair-division party game: a digital 'moving-knife' cake-cutting (Dubins–Spanier) that is agonizing to run honestly around a real table but becomes a taut 30-second showdown when every phone holds a private valuation. For friends who like a bit of nerve and hidden-information bluff, not trivia.

## Problem
'You cut, I choose' is the oldest fairness trick, and its continuous cousin — a referee slowly sweeping a knife while players shout 'stop!' — is provably envy-free but excruciating in person: you need an honest moving hand, everyone declaring continuously, and nobody able to see anyone else's true appetite. The elegance is smothered by bookkeeping.

## How it works
The host TV shows one heterogeneous 'cake': a horizontal strip of ~6 colored zones (pepperoni, crust, olives…). A vertical **knife line** sweeps left→right over ~30s.

Each **phone privately** shows the SAME cake but tinted by that player's secret valuation weights (their personal heatmap), plus a live number: *'% of YOUR total value now left of the knife.'* Nobody sees anyone else's tint or number.

When a player judges the swept slice equals their fair share — 1/n of their own total value — they tap **CLAIM**. The first claimer takes everything left of the knife and exits. The knife keeps sweeping the remainder for the rest, whose fair share is recomputed to 1/(n−1). The last player gets whatever's right of the final knife.

Because tastes differ, waiting for a fatter slice risks a rival snatching first. The **host screen** shows only the knife, the zones, and who has claimed — never anyone's private values.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object).

Data model: `Room { cake: Zone[], players: [{id, valuation: number[6], claimed, sliceValue}], knifeX, phase }`. Each phone receives ONLY its own `valuation` array at start.

Sync: the server owns `knifeX`, advancing it on a fixed tick (~30fps) and broadcasting position. Each phone computes its own running value locally against its private array — cheap and private. A CLAIM message is resolved **server-side against the server's authoritative knifeX at receipt time**, not the client's rendered position.

Genuinely hard part: fairness under latency. Two near-simultaneous claims must resolve deterministically on server clock with a hard lockout, and the loser must not feel robbed — so the server timestamps on arrival and shows the exact knifeX each claim landed at. Recomputing 1/(n−1) shares and re-tinting the remaining cake mid-round is the other fiddly bit.

## v1 scope
- Exactly 3 players, one cake, one round.
- 6 fixed zones; valuations random per player, summing to 100.
- Single left→right sweep, tap-to-claim, auto-resolve last slice.
- Host shows knife + claim badges; final envy check screen ('did anyone envy another's slice?').

## Out of scope
- >3 players, multiple cakes, custom valuations, accounts, sound, animations beyond the knife.

## Risks & unknowns
- Is the private running-value number legible enough to act on in real time, or too abstract?
- Latency fairness on flaky phone Wi-Fi.
- Whether 'fair share' math feels intuitive or needs a tutorial slice.

## Done means
Three phones join a room code, each sees a differently-tinted cake, the knife sweeps, all three end up with a disjoint slice, the server's claim resolution matches server knifeX within one tick, and the envy-check screen correctly reports whether the division was envy-free.
