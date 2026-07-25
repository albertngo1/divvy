## Overview
Weak Link is a 4–5 player hidden-role game where the accusation evidence is computed, not remembered. Everyone fills one blank in a shared sentence; a small language model then charges each player for exactly how much *their* word cost the sentence. One player was secretly told to make it expensive. For groups who find social deduction too vibes-based and want a bar chart to argue over.

## Problem
Perplexity games hand you one opaque number at the end and nobody can argue with it. And hidden-role games hand you nothing but vibes and volume. The missing piece is *attribution* — turning a global score into a per-player receipt. Once the model can say "this word cost 11.2 bits and mine would have cost 3.1," a number becomes an accusation, and the defense ("my slot was a coin flip, yours was gimme") becomes real gameplay.

## How it works
The host TV shows a sentence template with one blank per player: *"The ___ inspector refused to ___ the ___ until the ___ had ___."* Each phone privately sees **only its own blank** (its position highlighted in the template, all other slots shown as locked boxes) plus a private role card: BUILDER for everyone except one WEAK LINK. Builders want total surprisal under a break bar. The Weak Link wants it over — without being voted out.

60 seconds, one word each, typed blind and simultaneously.

The host assembles the sentence, scores it with distilgpt2, then computes **blame by leave-one-out**: rescore the sentence with slot *i* replaced by the model's own greedy fill; blame_i is the difference. The TV shows the finished sentence, the total against the break bar, and a sorted per-player blame chart — next to each slot's *baseline entropy*, measured before any fills. That second number is the alibi mechanic: a wide-open adjective slot is cheap to wreck quietly; a tight verb slot is loud. Negative blame is possible and celebrated — you out-wrote the model.

Then every phone votes privately and simultaneously. Builders win if the total stayed under the bar **or** the majority names the Weak Link. The Weak Link wins on over-the-bar **and** unidentified.

Per-phone is load-bearing twice over: disjoint private slot ownership and a private role. A passed phone reveals both instantly.

## Technical approach
`Room { code, template, slots[{index, ownerId, baselineEntropy, fill, blame}], roles{pid→role}, total, breakBar, votes{}, phase }` on a PartyKit Durable Object; phase machine lobby → fill → reveal → vote → result. The server is authoritative on role assignment, slot ownership, the fill deadline, and the vote tally. The host tab owns distilgpt2 in a Web Worker via transformers.js.

Cost: one full forward pass, plus N greedy fills and N rescores ≈ 2N+1 passes. At ~40–80ms each on a laptop that's well under a second for five players. Slot baseline entropies are precomputed when the template loads.

Genuinely hard part: (a) word-level slots don't align to BPE boundaries, so blame must be computed as the summed surprisal of *all* tokens belonging to the filled word, and leave-one-out means real re-runs rather than cached KV; (b) leak-proofing — fills and roles are never broadcast, only sent per-socket, until the reveal frame. One sloppy broadcast kills the round.

## v1 scope
- 4–5 players, exactly one round, one hardcoded 5-blank template
- Exactly one Weak Link; break bar is a hand-tuned constant
- One word per player, no phrases, no punctuation
- Vote is a single tap; ties go to the Weak Link
- Reveal order: sentence → blame chart + baselines → vote → role reveal

## Out of scope
Multiple rounds or templates, two saboteurs, chat, cross-round scoring, custom templates, on-phone inference, blame normalization tuning UI.

## Risks & unknowns
- Blame may correlate with slot *position* more than word choice, making the game about seat luck. Showing baseline entropy is the first mitigation; blame ÷ baseline may be needed.
- Short sentences let one odd word swamp everything and out the saboteur instantly — the template needs enough slots to hide in.
- Four-player deduction is thin; the model's chart has to carry the discussion.
- Greedy fills from distilgpt2 are sometimes garbage, inflating everyone's blame uniformly. Acceptable if it inflates fairly.

## Done means
Five phones each display a different highlighted blank and a private role card; after the fill deadline the host renders the assembled sentence, per-player blame bars, slot baselines, and total vs. break bar within 2 seconds; all phones then vote privately and simultaneously; the result screen resolves all four outcome combinations correctly; and a WebSocket trace confirms no phone ever received another player's fill or role.
