# Hot Kitchen

## Overview
Overcooked, inverted. Instead of a cooperative kitchen team fighting the clock together, every player runs their OWN kitchen on their own phone — but they share one refrigerator (a limited-supply market of ingredients). You can raid other kitchens' pantries for shared ingredients, sabotage their timers, or trade dishes. Real-time chaos. The cooperative genre made adversarial. Load-bearing per-phone because each kitchen is a private workspace and the raid mechanic requires per-phone privacy.

## Problem
Overcooked (and its digital cousins Plate Up, Moving Out) prove cooperative kitchen chaos is fun. Nobody has translated the FEEL of cooperative kitchen chaos into a competitive PvP browser format. Party gaming needs more real-time PvP that isn't a shooter. Per-phone naturally provides private kitchens; the game-design work is making the shared-refrigerator resource contention feel meaningfully strategic.

## How it works
Room code join, 3-6 players. Each phone shows a private kitchen: a small grid (chop station, stove, plating area) + a queue of orders (e.g. "Salad in 90s", "Soup in 120s"). Shared central market shows ingredients (finite supply — grabbing means depriving others). Order flow randomized per session, 3-min rounds. Actions: pull ingredient from market (shared), chop/cook/plate on your phone (private), submit dish for order score. Adversarial actions: send "spice raid" to another player's phone (dumps salt on their current dish, they must scrub 10 taps), send a "delivery" to steal one ingredient from their pantry. Session = 3 min, score = orders completed - orders spoiled.

## Technical approach
PartyKit / Durable Objects with 100ms tick. Room state = `{market: {ingredient: count}, kitchens: {player_id: {ingredients, active_orders, active_actions}}, actions_pending}`. Client sends taps/actions at high frequency; server arbitrates market pulls (first-tap wins on contested ingredients). Sabotage actions have a 30s cooldown to prevent spam. Order library hand-authored (~20 orders with ingredient requirements + time limits).

## v1 scope
4 players, 3-min round, single kitchen layout (3 stations), 8 ingredient types, 5 dish types, 2 sabotage actions (spice raid, ingredient steal), single map. Score = dishes served. No difficulty tiers, no upgrades, no tournament format.

## Out of scope
Multiple kitchen layouts, upgrades / progression, cosmetic customization, tutorial mode, deeper crafting (only 5 dishes in v1), team modes (2v2), full spectator mode, replay.

## Risks & unknowns
Real-time simultaneous action arbitration at 100ms is the whole tech risk; latency spikes will feel unfair. Sabotage mechanics may cascade into griefing if not tuned — a spiteful player can just spam raids on the leader. May need "sabotage budget" per session. Ingredient balance is fine work: some ingredients must be scarce enough to fight over. Playtest: is 3 min short enough to keep engagement, long enough to develop strategy? The core question: does the shared refrigerator feel like a real strategic resource, or just a bottleneck? Balance decides.

## Done means
4 friends open the room, start a round, and at least one player fires a sabotage action that visibly ruins another player's dish. If the group is laughing while frantically tapping their phones and yelling at each other, v1 shipped.
