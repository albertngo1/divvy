## Overview
Rounding Error is a darkly funny management sim where you run a commodity producer (start with eggs) and grow rich the way real cartels do: by quietly coordinating prices with your 'competitors' while keeping regulators sleepy. It's a satire in game form — the whole thesis is that the fine, when it finally comes, is a rounding error against the profit.

## Problem
Economics games teach you to compete. Reality often rewards *not* competing — collusion, regulatory capture, fines-as-cost-of-business. There's no accessible, mischievous sim that lets players feel, viscerally, why 'crime pays' when enforcement is toothless. The recent egg price-fixing saga (offenders netting a thousand times the penalty) is the perfect, absurd teaching moment.

## How it works
Each round is a quarter. You set your egg price against a market demand curve. Undercut rivals and you win share but crash everyone's margins. Instead you send **coded signals** in a shared industry 'newsletter' (public-facing but wink-wink) to nudge everyone upward. Trust is fragile: any player-AI can defect for a one-quarter windfall, so it's iterated prisoner's dilemma with money. A **Regulator meter** fills based on how blatant your coordination is and how loud consumer complaints get; when it trips, you draw an Enforcement card — usually a fine that's laughably small, occasionally (rarely) a real bust. Win by hitting a net-worth goal before an election-cycle heat wave flips the enforcement regime.

## Technical approach
Browser game, TypeScript + a lightweight ECS, Canvas/HTML UI, fully client-side and deterministic from a seed. Core is a small economic simulation: linear demand with elasticity, N AI cartel members running tit-for-tat-with-forgiveness strategies plus a 'greedy defector' archetype, and a stochastic enforcement model where fine size is drawn from a fat-tailed distribution deliberately centered *far* below quarterly profit. The interesting design problem is tuning enforcement so defection and honesty are both viable but collusion is seductively dominant — then letting late-game regime change punish the complacent.

## v1 scope
- Single-player vs 3 AI producers, eggs only
- Price-setting + one 'signal' action per quarter
- Regulator meter + Enforcement card deck (~8 cards)
- Win/lose screen tallying profit vs total fines paid

## Out of scope
- Multiplayer / real other humans
- Multiple industries or supply-chain depth
- Narrative campaign, art beyond placeholder

## Risks & unknowns
- Reads as endorsing cartels rather than satirizing — tone/framing is everything
- Balance: if collusion is strictly dominant, it's boring; needs real defection tension
- 'Sending coded signals' UI could confuse players

## Done means
A player completes a full ~12-quarter run against AI, experiences at least one enforcement event, and the end screen shows total fines as a visibly tiny fraction of profit — with balance tuned so that across 20 playtests, pure honesty, pure defection, and stable collusion each win at least once depending on play.
