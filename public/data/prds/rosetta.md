## Overview
Rosetta is a 3-clue-givers-plus-1-guesser cooperative riff on *Concept*, the icon-clue board game. Instead of one shared board everyone edits together, each clue-giver holds a **different private palette of emoji** and must contribute blind — the shared rebus assembles itself out of three uncoordinated guesses. It's for groups who love the "we're all pointing at the same thing from different angles" feeling and the comedy of watching your careful clue collide with everyone else's.

## Problem
Concept and Pictionary funnel through a single author or a single shared board, so one confident person dominates and the rest kibitz. The itch: make everyone author *simultaneously and blind*, from *different constrained materials*, so the clue is a genuine emergent surprise — even to the people who built it. That only works if each contributor's palette and pick are private until the reveal.

## How it works
The server picks a target word (e.g. PIRATE) and shows it **privately on all three clue-givers' phones**. The guesser's phone shows only "a clue is being assembled…".

Each clue-giver's phone displays a **unique private palette of 8 emoji** — drawn from disjoint slices of a curated pool, so no two players share the same options. Under a short timer, each privately taps **exactly one** icon. Crucially, **nobody sees anyone else's palette or pick** while choosing — the choices are simultaneous and blind.

When all three lock in, the host TV animates the three chosen icons into a single left-to-right row — the rebus (say 🦜 + ⚔️ + 🏝️). Now the guesser, seeing the row for the first time, gets **two spoken guesses**. Correct = the room wins together; it's cooperative, no points.

Per-phone privacy is load-bearing three ways: the target is hidden from the guesser, each palette is private and unique, and picks are concealed until lock. Pass one phone around and there are no simultaneous secret palettes — the whole "blind ensemble" mechanic collapses into ordinary turn-taking. Optional flavor: if two givers happened to pick the *same* icon, the TV flags it "redundant!" — a gentle nudge to diversify next time.

## Technical approach
Host tab + phone PWA + WebSocket server (PartyKit / Durable Object per room). Data model: `room {players[], target, palettes:{playerId:[emoji×8]}, picks:{playerId:emoji}, phase, guesses}`. Palettes are generated server-side by sampling a curated 60-emoji pool into three disjoint 8-tiles, seeded so at least ~2 tiles contain something plausibly relevant to the target. Each `palette` is pushed only to its owner's socket; `picks` stay server-side until all three land, then the composite row broadcasts to host + guesser. Sync is simple turn-gated lock — no tight real-time. Genuinely hard part: **palette curation** — pools must be solvable-but-not-trivial (a decent clue exists, but no single obvious icon trivializes it), which needs hand-tuned emoji-to-concept tagging.

## v1 scope
- Exactly 4 players: 3 give, 1 guess
- One target word from a tiny hand-curated list
- Palettes of 8 emoji, disjoint across givers
- Each giver picks exactly 1 icon, blind, then lock
- Guesser gets 2 tries; win/lose, no scoring

## Out of scope
- Multiple rounds, rotating the guesser, cumulative scoring
- Picking 2+ icons or ordering them
- Custom emoji uploads or drawing
- Solver/hint system, difficulty tiers

## Risks & unknowns
- Solvability variance: three blind picks may produce nonsense too often — needs playtesting on how many relevant icons to seed.
- Emoji ambiguity across phone platforms (Apple vs. Android render differently) could mislead the guesser.
- With only 3 givers, one dud pick can sink an otherwise good rebus; may need a re-roll of one icon.

## Done means
Four phones join; three see PIRATE and each sees a distinct 8-emoji palette the others can't; each taps one icon blind; on the third lock the host TV assembles the three-emoji rebus for the first time and the guesser gets two tries — cooperative win/lose resolves in one round with no palette or target ever leaking to the wrong screen.
