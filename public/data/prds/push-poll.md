## Overview
A Herd Mentality descendant for four players where the hidden asymmetry lives in the *question*, not the answer. The TV shows a bland topic banner. Every phone privately shows a full question on that topic — and every one of the four is loaded differently, some gently, one absurdly. You answer on a slider, defend your number out loud, then privately bet on the group's true center of gravity and privately finger whoever you think got the most rigged version.

## Problem
Hidden-role games have a shape everyone can now smell: one person has the odd card and is performing. This inverts it — *nobody* is clean, nobody has a role, and the thing you're deducing is a magnitude, not a binary. The payoff is a real cognitive stunt: model the unbiased question from inside a biased one. And the reveal is a guaranteed laugh, because everyone has been arguing at cross purposes for three minutes.

## How it works
1. **Topic.** TV: `TIPPING`. Nothing else, all round.
2. **Private prompt.** Each phone shows a different rendering of one underlying question, drawn from a hand-authored 4-variant set with distinct push magnitudes (e.g. "How much should you tip a barista who remembered your name and your order?" vs "…a barista who stayed on their phone the whole time?" vs a stacked, editorializing monster). Phones are told the questions differ; nobody is told how or how much.
3. **Answer.** 0–100 slider, locked in privately, simultaneously.
4. **Defend.** TV reveals the four numbers only, as dots on a line, unattributed for three seconds, then labeled. Each player gets 20s to say one sentence aloud justifying their number. Nobody may read their question aloud.
5. **Two private taps.** Each phone: (a) drag a marker to where you think the *unpushed* group mean sits; (b) tap the player you think got the hardest push.
6. **Reveal.** TV renders all four question texts side by side with push magnitudes. Score = proximity to the true mean + a point for correctly naming the hardest-pushed player + a point for the hardest-pushed player if nobody named them.

**Private:** your question text, your slider until lock, both taps. **Shared:** topic, the four numbers, spoken defenses, the final side-by-side.

## Technical approach
Cloudflare Durable Object per room; phone PWA + TV tab over WebSocket. Model: `Room {phase, topicId, assignment: Map<pid,variantId>, answers, meanBets, accusations, scores}`. Variants live server-side in a content JSON; a phone receives *only* its own `variantId` text, and the reveal broadcast is the first message on the wire carrying any other player's text — that invariant is the whole game and is worth a test. Phase transitions are server-driven with a deadline so a slow phone can't stall the room; unlocked sliders auto-submit at their current value. Sync is easy here (no millisecond contention) — the genuinely hard part is **content**: authoring variant sets whose push magnitudes are real and ordered, since a set where the "hardest" push doesn't actually move answers makes the accusation phase pure noise. Expect to playtest and rewrite variants far more than code.

## v1 scope
- 4 players, exactly one topic, one round.
- Three hand-written topic sets, chosen at random.
- Slider, one 20s speaking timer, two taps, one reveal screen.
- Room code, no accounts, no persistence.

## Out of scope
User-submitted questions; LLM-generated variants; more than four players; multi-round scoring; text chat.

## Risks & unknowns
- If pushes are too obvious, the defend phase collapses immediately.
- Slider answers may cluster regardless of framing, killing the signal.
- The middle of the round is thin — the reveal may carry too much of the fun.
- Loaded questions on real topics can land as political; keep the seed set trivial.

## Done means
Four phones each render a distinct variant; a network capture confirms no phone receives another's text before the reveal event; all four answers, mean bets, and accusations record correctly; the TV reveal shows four texts side by side; final scores match a hand computation.
