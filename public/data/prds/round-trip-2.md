## Overview
Round Trip is a satirical idle/tycoon browser game about running a frontier AI lab in the age of "$1.65T in hidden debt" and "agent-swarm economics." You grow by buying GPUs, shipping models — and, crucially, by *round-tripping*: investing in a chip vendor who then buys your cloud, booking the loop as revenue. It plays great right up until it doesn't. For anyone who reads the AI-bubble takes and wants to *be* the bubble.

## Problem
Everyone's arguing about opaque AI financing, SPVs, and circular deals in the abstract. There's no visceral way to *feel* how narrative and solvency diverge — how a company can look like it's compounding while quietly hollowing out. A tight idle loop makes the mechanism legible and darkly funny.

## How it works
Two meters, one hidden. **Narrative** (valuation, press, hype) is what everyone sees; **Solvency** (real cash) is what actually keeps you alive. Straightforward moves (train a model, rent out inference) grow both slowly. "Structured" moves — vendor financing, an SPV to keep GPUs off-balance-sheet, a circular investment with a partner — spike Narrative fast while quietly draining Solvency. A rising **Fragility** timer means each circular deal makes the eventual unwind bigger. Random events fire: a rival's model drop, a Nikkei exposé, a rate hike. Win by IPO-ing or getting acquired before the pop; lose to a margin call when sentiment cracks and your round-tripped revenue evaporates at once.

## Technical approach
Plain browser game, TypeScript + a small ECS-free tick loop; state in a single reducer, persisted to localStorage. Economy is a system of coupled difference equations updated per tick: revenue = real_demand + circular_revenue, where circular_revenue is subtracted from a decaying counterparty-credit pool. Fragility raises the probability and magnitude of an "unwind" Poisson event as circular exposure grows. Balancing is the hard part — tuning so honest play is viable-but-slow and leverage is seductive-but-lethal, with a satisfying late-game cliff rather than a slow bleed. Numbers/curves only; charts via a tiny canvas sparkline. No backend.

## v1 scope
- Core loop: GPUs, model releases, 3 "structured finance" actions
- Narrative/Solvency/Fragility meters + one unwind event
- Win (IPO) and lose (margin call) states, one run ~10 min
- Snarky event ticker

## Out of scope
- Multiplayer / real market data
- Prestige/meta-progression
- Accurate accounting realism (it's a caricature)

## Risks & unknowns
Balance is everything — easy to make circular deals strictly dominant or strictly bad. Satire could read as either too cynical or too cute. Idle games need a hook to return; v1 is a single sitting.

## Done means
A player can complete a full run to either IPO or margin call, clearly feel the moment their paper revenue unwound, and want to immediately try a more (or less) leveraged strategy.
