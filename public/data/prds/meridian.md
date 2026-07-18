## Overview
Meridian is a hidden-role deduction game for 3–6 players — a shared TV plus one phone each. Everyone reads the same public map; the imposter's private *label layer* is quietly rotated by one island, so they act on a self-consistent but wrong view. For friends who like Chameleon but hate watching the faker just go quiet.

## Problem
Chameleon/Insider-style games make the imposter obviously uninformed: they stall, fish for the topic, and the tension leaks out. The itch is a faker who is *fully confident* — who believes their view and gets caught by pattern, not hesitation.

## How it works
The host TV shows a public 'island chart': 7 abstractly-drawn islands in fixed positions, **unlabeled**. Each phone privately shows the SAME chart but with names printed on the islands. For everyone except the imposter the labels are identical. The imposter's name layer is rotated one island clockwise, so every name sits on its neighbor — and it looks perfectly normal to them.

The host reads prompts aloud: 'Which island would you flee to in a storm — and why?' Players answer OUT LOUD, naming and describing an island ('Skerry, the jagged little one up north — good cliffs'). Shape and position are public, so everyone can follow; only the name→island mapping differs. The imposter says 'Skerry' but means a different island than the room.

Tell phase: the host calls 'Everyone: tap Skerry.' Each phone shows its private labeled chart; players tap one island simultaneously; taps release together as a heat blob on the TV. The imposter's tap lands one island off. Over 2–3 tap-calls the odd cluster emerges, then each phone privately votes for the imposter.

Per-phone is load-bearing: the label layer must differ per player and taps must be secret and simultaneous — a passed-around phone reveals the shift instantly and destroys the deduction.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room{mapId, islands:[{id,poly,pos}], baseLabels[], imposterId, shift}`. Server sends each client its label array; the imposter gets `rotate(baseLabels, shift)`. Prompts and tap-calls are server-sequenced. Taps `{playerId, islandId}` collect inside a 4s window and release together to the host so nothing leaks live. Votes tally server-side. The genuinely hard part is *authoring*: island sets must be distinct enough to describe yet ambiguous enough that a one-island rotation is plausible for every label — hand-tuned, not procedural.

## v1 scope
- 3–4 players, one hand-authored 7-island map, one imposter.
- 2 verbal prompts + 2 simultaneous tap-calls, then one vote.
- Host renders islands, tap-heat, and reveal. No accounts, no persistence.

## Out of scope
- Multiple maps/rounds, cross-game scoring, swapped-pair (two mirrored imposters) variants, freehand drawing, spectator mode.

## Risks & unknowns
- A one-island shift may be too easy (imposter obvious on the first call) or too noisy. Tune shift size and map ambiguity.
- The verbal phase can leak the answer before taps — cap description length.

## Done means
On 3 phones + a laptop: the imposter receives shifted labels, gives confident wrong taps, the TV heat map shows their outlier cluster, and a majority correctly votes them out in a single live playtest.
