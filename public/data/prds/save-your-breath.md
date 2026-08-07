## Overview
A 10-minute deduction game for 3–6 people. The TV is thinking of one secret thing. Everyone asks yes/no questions **simultaneously and privately**, then all questions are revealed and answered at once — except that semantically duplicate questions are killed. Both askers get nothing, and the group burns one of its precious waves. Each phone privately holds a different fragment of a clue, which is exactly what makes everyone reach for the same obvious question at the same moment.

## Problem
Twenty Questions in a group is a queue: one loud person asks, everyone else waits and free-rides. Making it simultaneous fixes the free-riding but creates a new, better problem — the most informative question is also the one your friends are most likely to be typing right now.

## How it works
1. Server picks a secret (a concrete noun: *a fire escape*, *a bay leaf*, *a parking meter*).
2. Each phone privately receives **one clue fragment**, different per player: "it is not alive," "you would find it outdoors," "most people own zero of them." Fragments are true, non-overlapping, and individually weak.
3. **Wave** (3 waves total, 45s each): every phone types one yes/no question. Nobody sees anyone else's. Talking out loud is allowed and is the whole social game — you can *say* what you're asking, and lie.
4. At wave end the server embeds all questions and clusters them by cosine similarity above a threshold. Any cluster of ≥2 is **collided**: those questions are shown on the TV side by side, struck through, unanswered, and their askers score −1. Surviving questions are answered YES/NO on the TV and stay on a running board everyone can read.
5. After wave 3, one final simultaneous guess. First correct guess scores +5; a wrong guess scores 0. If two players guess the same wrong thing, both go to −1, because of course they do.

Private vs shared: phones hold your clue fragment, your in-progress question, and your guess. The TV holds the answered-question board, the collision graveyard, and scores. The private fragment is load-bearing — passing one phone around collapses the game into ordinary Twenty Questions, because the whole tension comes from six people independently deducing the same next question.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object.

Data model: `Room { secret, clues: Map<playerId, string>, wave, submissions: Map<playerId, {text, tSubmit}>, board: Answer[], scores }`. Nothing about a submission leaves the DO until the wave closes — the privacy guarantee is server-enforced, not client-hidden.

At wave close the DO batches all questions to an embeddings endpoint, does single-linkage clustering at a tuned threshold (~0.86 for short interrogatives), then sends the surviving questions in one Claude call that answers each strictly YES/NO/IRRELEVANT against the secret.

Hard part is not sync — it's the **collision judge**. "Is it electronic?" vs "does it need power?" must collide; "is it indoors?" vs "is it outdoors?" must not, despite near-identical embeddings. Mitigation: normalise questions to canonical predicates with the same LLM call *before* embedding, and expose a manual host override button so a bad ruling never derails the round.

## v1 scope
- One secret from a hand-written list of 30
- 4 players, 3 waves, one final guess
- Fixed similarity threshold; host override button
- TV board + collision graveyard; text-only, no art

## Out of scope
- Multiple rounds, category picking, difficulty tiers
- Player-authored secrets, voice input
- Any anti-cheat beyond "don't read your neighbour's phone"

## Risks & unknowns
- Threshold tuning is the whole game; too loose kills every wave, too tight makes collisions rare.
- 45s may be too long — dead air while six people type.
- Clue fragments may steer everyone so hard that wave 1 is a guaranteed pile-up. That might be the best moment in the game, or it might feel unfair. Needs playtesting.

## Done means
Four phones run a full round; at least one wave produces a genuine collision that both players agree *was* the same question; the group either identifies the secret or fails, and the TV can show, at the end, every question asked including the ones that were binned.
