## Overview
Winnow is a cooperative-with-a-mole word game for 4-6 players, riffing on *Just One*. One player is the Guesser; everyone else privately writes a single one-word clue for the same secret answer. Clues that match (even fuzzily) are *winnowed* — deleted before the Guesser sees anything. So the room must help without accidentally twinning. The twist: one clue-giver is secretly the **Echo**, who wins by *causing* collisions, sabotaging the help while looking innocent.

## Problem
*Just One* is a brilliant party game whose entire tension — writing blind, hoping you didn't pick the obvious clue everyone else picked — evaporates the instant clues are visible. A passed phone or a shared table ruins it. It *demands* simultaneous private authorship, which is exactly what phones are for, yet no clean digital version leans into that. Winnow adds a hidden-incentive layer so the paranoia cuts both ways.

## How it works
Host TV shows the round state: the answer is hidden from the Guesser but shown to all clue-givers on their phones. Each clue-giver's **phone privately** shows the answer, a text field, and a countdown; they type one word and lock it. Nobody sees anyone else's clue. The **Echo's phone** additionally shows a red banner: "You're the Echo — score if your clue gets shredded by matching someone." The Guesser's phone shows only "Wait…".

On lock, the server normalizes and clusters clues (lowercase, singular/plural, stem, tight synonym set). Any cluster of 2+ is winnowed. The **host TV** reveals the survivors (and dramatically X's out the shredded ones), the Guesser says one guess aloud. Then every phone **privately** votes: who was the Echo? Scoring: team earns points for a correct guess; the Echo earns points per collision they caused and escapes if under-voted.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room{code, answer, guesserId, echoId, phase}`, `Clue{playerId, raw, normalized, clusterId, shredded}`, `Vote{voterId, suspectId}`. Sync: phases (`writing → winnowing → guessing → voting → reveal`) broadcast authoritatively; clues stay server-side until winnowing so no client can leak them. The genuinely hard part is **transparent fuzzy clustering** — players must trust why two clues were judged "the same." Ship a deterministic pipeline (case/punct fold → lemmatize → curated synonym groups) and *show the reasoning* at reveal ("'ocean' ≈ 'sea'"), so no clustering feels like a black-box robbery.

## v1 scope
- 4 players, one answer, one round.
- Roles: 1 Guesser, 3 clue-givers, exactly 1 Echo among them.
- Fixed 30-word answer deck, 45s write timer.
- Simple normalize+exact/lemma cluster; synonym groups as a hardcoded JSON.
- One suspicion vote, static scoreboard.

## Out of scope
- Rotating guesser / multi-round matches.
- ML synonym detection; player-authored decks.
- Reconnection polish, spectators.

## Risks & unknowns
- Fuzzy matching that feels unfair sours the whole game — bias toward *not* winnowing when unsure.
- With 3 clue-givers the Echo may be too obvious; may need 5-6 players to hide.
- Echo incentive could dominate co-op feel; tune point weights.

## Done means
Four phones join a room code; each clue-giver privately writes a blind clue; the server shreds a genuine collision and shows why on the TV; the Guesser sees only survivors; every phone privately votes the Echo; final screen reports the guess result, collisions caused, and whether the Echo was caught.
