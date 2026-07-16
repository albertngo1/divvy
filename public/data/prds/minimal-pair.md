## Overview
A verbal hidden-role game for 4-6 players. Every phone secretly shows an anchor word; the crew all share the same one, but the imposter's is a look/sound-alike near-miss — a *minimal pair* (BEACH vs BEECH, PEACH vs PEACE). Players free-associate out loud, and the imposter slowly drifts. Host TV, private phones.

## Problem
Hidden-word party games usually make the imposter obviously blind (they get no word, or a blank) — so they *know* to fake it and play defense. The delicious version is when the imposter reads a perfectly normal-looking word and confidently associates from it, never suspecting they're on a slightly different island. That confidence is the tell, and it only works if the divergent view is private and near-identical.

## How it works
- No shared image; the TV just shows turn order and the growing word list.
- Each phone privately shows ONE anchor word. Crew share the anchor (e.g., BEACH); the imposter's phone shows its minimal pair (BEECH). No role labels.
- Rule shown to all: say a word *associated* with your anchor — never the anchor itself, never a word already said.
- Going around the table twice, each player says one association aloud and types it; it lands on the TV log.
- After two laps, everyone privately votes for who was off-anchor. Reveal. Crew win if the imposter is caught. The imposter wins by surviving AND correctly guessing the crew's true anchor at the end — a bonus that rewards noticing your own drift.

**Private:** your anchor. **Shared:** the spoken word list and votes. A single passed phone can't hold four secret anchors at once, and crucially the imposter must not know theirs differs — both demand per-phone state.

## Technical approach
Host + PWAs + WS server. Data model: `Room {anchorSet:{crewWord, imposterWord}, players[{id, role, anchor, vote}], wordLog[]}`. Server draws a minimal-pair entry from a curated bank, assigns `imposterWord` to one player and `crewWord` to the rest, pushing each client only its own anchor. Turn-gated: the server passes a speaker token; the active player types their word, which broadcasts to the TV log. Near-zero real-time complexity — the only thing that matters is anchor secrecy. The hard part is bank curation: pairs whose association clouds overlap enough to fool lap 1 (BEACH/BEECH → "summer, shade, green?") but diverge by lap 2 (sand, waves, tide vs bark, forest, nuts).

## v1 scope
- 4 players, one imposter, one anchor pair, two laps, one vote.
- 12 curated minimal-pair anchor sets.
- Type-and-speak each turn; TV logs automatically.

## Out of scope
- Scoring across games, multiple imposters, real-time buzzing, any dictionary check that a word is a "valid" association.

## Risks & unknowns
- A clever imposter with a forgiving near-anchor can hide indefinitely; crew associations may not converge with only 4 players. Bank quality is everything.
- Association-under-pressure freezes some players; needs a gentle timer, not a harsh one.

## Done means
4 phones each receive a secret anchor (one a near-miss); two laps of spoken/typed associations render live on the TV; and across plays the table catches the drifter above chance.
