## Overview
A B2B audit-then-subscription service for companies that run an optimizer nobody trusts: route planners, production schedulers, crew rosters, load builders. It reads the log of *proposed plan vs. plan actually dispatched* and uses inverse optimization to recover the objective function the human planner is really minimizing. Buyer: the VP Ops who paid $400k for a routing suite and watched dispatchers hand-edit every run.

## Problem
Every deployed OR system has a shadow model living in one dispatcher's head. Management believes the tool optimizes cost-per-mile; the dispatcher is silently pricing "don't give Dave the east loop again" and "Customer 4412 escalates to the CEO." Nobody can name the gap, so the vendor blames the users, the users blame the tool, and the override rate becomes a permanent tax. Existing analytics count overrides. None explain them.

## How it works
1. Ingest paired plans: `(proposed, final, timestamp, planner_id)` plus the instance data (stops, capacities, time windows).
2. Assume each final plan is near-optimal under an unknown cost vector **c** over the same feasible set.
3. Recover **c** by constraint generation: start from the vendor's nominal weights, solve the forward problem, and if the generated plan beats the observed one, add the cut `c·x_obs ≤ c·x_gen`; repeat, minimizing ‖c − c_nominal‖₁ so the story stays interpretable.
4. Ship a **Revealed Cost Report**: "a late minute at Customer 4412 is priced 6.2× your stated penalty," "a driver-continuity term you never modeled explains 38% of overrides," "11% of overrides are inconsistent with *any* stable objective — those are training issues, here are the four planners."
5. Upsell: push the recovered weights back into the optimizer config and track override rate weekly.

## Technical approach
Python + OR-Tools (CP-SAT / routing) for the forward model, Gurobi or HiGHS for the inverse LP master. Inverse-LP via KKT duality (Ahuja–Orlin) for the relaxed case; inverse-MIP via cutting planes (Wang, 2009) for the real one. Feature basis stays small and human-nameable (~10–30 terms: distance, overtime, lateness by tier, driver–territory affinity, trailer swaps, dock congestion). Store plans as normalized decision-variable vectors in Postgres/Parquet; per-override residual = how much cost the observed plan sacrifices under the current **c**.

The genuinely hard part is **feasible-set fidelity**: if your reconstructed constraints don't admit the observed plan, inverse optimization is undefined. Practical fix: elastic constraints with slack penalties, and an "unexplainable" bucket that is itself a sellable finding.

## v1 scope
- One design partner, one week of CSV before/after routes
- Vehicle routing only, 4 cost features
- Cutting-plane loop in a Jupyter notebook, no UI
- Output: a single PDF with recovered weights + 3 annotated example overrides

## Out of scope
Live integration, multi-planner personalization, scheduling/rostering verticals, any real-time write-back.

## Risks & unknowns
Overrides may be lazy noise rather than signal; log quality is often terrible (finals overwritten in place, no proposal kept); optimizer vendors will position this as an attack on them; sample sizes per planner may be too small for stable weights.

## Done means
On held-out weeks, plans re-solved with recovered weights match the human's final plan on ≥60% of decision variables vs. ≤35% for nominal weights — and the design partner points at one recovered term and says "yes, that's exactly what we do."
