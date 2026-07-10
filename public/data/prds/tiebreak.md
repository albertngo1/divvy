## Overview
Tiebreak is a 4–6 player hidden-role game for groups that enjoy arguing about rankings. The whole table appears to be doing the same cooperative task — sort six items by a shared criterion — but one player's phone was privately given a subtly different rule. The asymmetry lives in the *instruction*, not the data, so the traitor's picks look reasonable until the group hits a genuinely close call, where their divergent rule quietly steers them wrong.

## Problem
Hidden-role games usually differentiate the imposter by *information* (a fake word, a doctored map). Tiebreak differentiates by *objective*: everyone sees the exact same items, but one person is silently optimizing for a near-synonym criterion. This produces a rarer social texture — the traitor is genuinely trying to be right and doesn't even feel like they're cheating, because from inside their rule they aren't.

## How it works
Each round the host TV shows six items (cities, snacks, movies). PRIVATE on every phone: a rule card. Five phones read the same rule ("rank by how EXPENSIVE"); one phone reads a divergent twin ("rank by how FANCY") — the two rules agree on obvious cases and split only on edge cases. Players privately drag the six items into a ranking on their own phone. Then everyone must argue the table toward ONE shared public ranking, placing items one slot at a time by open discussion — but each player also privately logs, on their phone, which single placement they most disagreed with. When the shared ranking is locked, the host reveals the aggregate: obvious items landed unanimously; one or two tiebreak items show a lone dissenter. Players vote for the odd-rule holder. Correct = table wins; else traitor wins.

Per-phone is load-bearing twice: the private divergent rule can't be spoken aloud, and the private disagreement log must be committed before the reveal so people can't retrofit suspicion.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit/Durable Object). Data model: Room{itemSet[], baseRule, twinRule, traitorSeat, sharedRanking[], phase}; Seat{id, privateRule, privateRanking[], flaggedSlot}. Server deals privateRule to each seat, assigning twinRule to one. The shared-ranking phase is a server-arbitrated turn queue: proposals and confirmations flow through the server so all phones stay in lockstep on the current partial ranking. Genuinely hard part: authoring rule twins that diverge on exactly 1–2 of six items per item set — content design, plus a validation pass so no set accidentally makes the rules identical or wildly different.

## v1 scope
- Three hand-tuned item sets, each with one base/twin rule pair.
- 4–6 players, one round, one shared ranking, one vote.
- Drag-to-rank private input; single private disagreement flag.

## Out of scope
Multiple rounds/scoring, player-authored items, more than one traitor, variable item counts, spectators.

## Risks & unknowns
The core content risk: can rule twins reliably diverge on only the close calls? If divergence is too loud it's trivial, too quiet it's unwinnable. Whether the shared-ranking argument phase is fun or devolves into one loud player. Group size sensitivity.

## Done means
Five players on five phones plus one traitor complete one round; the divergent rule visibly bends exactly the tiebreak item(s) in the reveal; the table votes and the correct win/lose screen shows — with at least one honest player having flagged the right slot.
