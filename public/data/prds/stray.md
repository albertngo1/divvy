## Overview
Stray is a hidden-role phone-controller game for 4–6 players that fuses *Herd Mentality* (answer to match the majority) with *The Chameleon*'s asymmetric-information hook. Everyone privately answers what looks like the same question. Secretly, one player's phone showed a **subtly different question** — and crucially, that player doesn't know it. The room must sniff out whose answer is honestly-but-strangely off.

## Problem
*Herd Mentality* is delightful but analog and has no bluff; *The Chameleon* has the bluff but the faker knows they're faking. The unexplored sweet spot: an **unaware imposter** who genuinely believes they saw the same prompt and will sincerely, confidently defend an answer that's quietly wrong for everyone else's question. That's only possible if every phone can hold a divergent private view — impossible with one shared screen.

## How it works
**Shared TV:** a round title (e.g. "Picnic") but never the question itself. **Privately on each phone:** a question and a text box. To all but one player: "Name a food you'd bring to a picnic." To one randomly chosen Stray: "Name a food you'd bring to a funeral." The Stray has no signal theirs differs.

Everyone privately types a 1–3 word answer, simultaneously, then locks. The TV reveals all answers **anonymized**. The room discusses aloud — the herd clusters (sandwiches, chips), the Stray's answer (casserole) is deniably off. Then every phone **privately votes** for who saw a different question. During discussion the Stray, if they smell it, can secretly submit a guess of the *real* shared question — nailing it wins outright, giving the unaware imposter late agency.

**Reveal:** three-way outcome — Herd wins if the plurality correctly fingers the Stray; Stray escapes if they dodge the plurality; Stray steals it if their real-question guess was right.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room {code, phase, questionBase, questionTwist, strayId, answers{playerId,text}, votes{voterId,targetId}, strayGuess}`. Phase machine: assign → answer → discuss → vote → reveal, server-authoritative. Sync is easy — payloads are tiny. The genuinely hard part is **content**: authoring question *pairs* whose divergence is detectable-but-deniable (too obvious → Stray always caught; too subtle → coin flip), plus anonymizing answers on the TV while keeping stable per-answer IDs for voting without leaking order/timing.

## v1 scope
- 4 players, exactly one round, exactly one Stray.
- Hand-authored deck of ~12 question pairs.
- Text answers only; single private vote each.
- No cross-round scoreboard.

## Out of scope
- Multiple rounds / running score.
- More than one Stray; emoji or image answers.
- Custom decks, difficulty tiers, spectators.

## Risks & unknowns
- Question-pair authoring IS the game — the hardest, most fragile part.
- An unaware Stray may feel passive if they never realize (the real-question guess is the mitigation).
- Short answers can collide ambiguously.
- Anonymization leaks via typing/lock order.

## Done means
Four phones join; one privately receives the twist question without knowing; all answer simultaneously; the TV shows anonymized answers; all vote privately; the reveal names the Stray, shows both questions, and displays the three-way outcome. Reproducible with a scripted 4-player run.
