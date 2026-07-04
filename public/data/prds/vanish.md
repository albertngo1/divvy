# Vanish

## Overview
An inverted social deduction game. Every player has a hidden identity (a persona sheet, revealed only to them). Each round, the server pushes a personal question to a random player who must answer truthfully; other players hear the answer without knowing whose identity is being probed. Answering leaks information — enough leaks and your persona becomes deducible; the group votes at end who is who. You WIN by staying anonymous. The last unrecognized player wins. Not "collect points" — "avoid being seen".

## Problem
Werewolf/Mafia and Undercover all reward reveal — you reveal the imposter, they're eliminated. Nothing rewards hiding. But real conversation dynamics are often about staying selectively private, disclosing carefully; a game that mechanizes this offers a different social texture. Per-phone is load-bearing because personas must be genuinely private (one shared device destroys the mechanic) and answers are text-typed to preserve deniability ("was that your answer, or theirs?").

## How it works
Room code join, 4-8 players. Setup: each phone gets a private persona sheet (e.g. "you are secretly a fan of black-and-white films", "your favorite meal is instant noodles", "you were homeschooled"). 5 total questions across the round; each question is a personal prompt ("What's your comfort food?"). Server randomly assigns each question to one player (rotating so everyone gets 1-2). Chosen player types a *truthful-to-their-persona* answer; answer displays anonymously to all phones. Other players see the answer but can't know which persona it maps to unless they cross-reference across questions. At end, everyone types their best guess for each player's persona. Winner = whoever remains most anonymous (fewest correct guesses on their persona).

## Technical approach
PartyKit / Durable Objects. Room state = `{personas: {player_id: sheet_id}, questions, answers: [{q_id, player_id, text}], guesses: {guesser: {target: persona_guess}}}`. Persona sheets hand-authored (~30 personas with 3-5 distinctive tags each). Anonymized answer stream broadcast to all clients. Guess UI at round end: for each other player, dropdown of possible personas. Scoring: each persona-guess-correct reveals that player; winner = fewest reveals.

## v1 scope
4-6 players, 25 hand-authored personas + 15 fixed questions, 5 questions per session, single round, guess phase at end. Persona sheets randomly assigned without repeat. No dynamic question generation, no persona negotiation, no midround voting.

## Out of scope
LLM-generated personas, custom question packs, persona theft mechanics, midround reveals for accusations, persistent guess history, tournament modes, adjustable disclosure levels.

## Risks & unknowns
Whether staying-hidden feels *victorious* or feels *passive/boring* is the entire question — needs playtest. Some personas may be too easy to identify (someone with a strong food preference will out themselves in question 1); need careful persona-question matching. Group knowledge biases the whole thing — if everyone knows Marc hates cilantro, they'll finger him for "hates cilantro" persona instantly. Suggested playtest fix: personas should be *fictional* claims, not real ones ("your character is..."), reframing this as improv rather than confession.

## Done means
4 friends play through 5 questions + guess phase. At least one player has zero correct guesses on their persona at the end. If that player pumps their fist and says "I'm ANONYMOUS!" — v1 shipped.
