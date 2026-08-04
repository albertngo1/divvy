## Overview

"Fair Copy" is a ~12-minute writing game for exactly 4 people in one room, on a TV plus four phones. The group writes a single short letter — to next year's version of this party, to the friend who couldn't come, to the house. Each person writes one paragraph, all at the same time. The letter is the prize. It exports as a printable card *unsigned* only if the room can't tell who wrote what.

## Problem

Anything a group writes together gets attributed instantly — "that's obviously Maya's line." Existing anonymity games anonymize *for* you: they shuffle, they strip names, they hide the byline. Nobody has made a game where you have to do the erasing yourself, live, while still writing something worth keeping. A scribal fair copy is the clean final draft written out in one hand so the drafting is invisible. That's the target.

## How it works

**Warmup (60s).** Every phone gets the same neutral prompt ("describe the room you're in"). Never displayed to anyone; it's calibration.

**Writing (5 min, simultaneous).** The host TV shows four grey paragraph slots with live word counts and *nothing else* — no text. Each phone privately shows three things: your own slot's prompt ("what we promised each other"), your text field, and your **Tell Meter** — the three features of your current draft deviating most from the room's pooled baseline, in plain words: *"commas: much heavier than the room," "sentences: shortest here," "you're the only one saying 'honestly'."* Only you ever see your tells. Flattening them costs you the voice you'd naturally write in. That trade is the game.

**Attribution (2 min).** The TV reveals all four paragraphs at once, shuffled, unlabeled. Each phone privately assigns authors to the three paragraphs that aren't yours — a permutation of 3, so expected-correct is 1 per guesser, 4 for the room.

**Verdict.** Total correct ≤ 4: the card prints clean, every phone gets the PNG, the server deletes the authorship map. Total ≥ 5: the same card exports with a line at the bottom — *"in the hand of: <names identified by 2+ people>"* — burned into the keepsake.

## Technical approach

One Cloudflare Durable Object per room. `Room { code, players[4], phase, slots[4]{ownerId, text}, baselines{playerId: FeatureVector}, guesses }`. Phones push debounced text deltas (250ms); the DO is authoritative and echoes only *word counts* to the host until the reveal transition.

Tell Meter: server recomputes every 500ms over 3 features (commas per 100 words, mean sentence length, contraction rate), z-scored against the other three players' current drafts pooled with their warmups. Top-3 |z| is pushed to that socket alone.

Hard part one: stylometry on 40 words is mostly noise. Mitigation — heavy smoothing, hysteresis so the meter doesn't flicker, and it never claims a probability, it names a habit. Hard part two: the reveal must be **atomic**. If a late keystroke lands after the TV starts rendering, the room watches a paragraph grow while its author sits still — a total tell. Single-writer DO semantics make that a one-line guarantee.

## v1 scope

- Exactly 4 players, one letter, one round
- One fixed set of 4 paragraph prompts
- 60s warmup → 5 min write → 2 min attribute
- Tell Meter: 3 features, text only, no numbers
- Server-rendered PNG card at one shared URL
- Authorship map deletion is real (DO storage key dropped) and the TV says so

## Out of scope

- Any player count but 4; multiple rounds; saved history; accounts
- ML/classifier stylometry; rich text; images
- Rematch, scoring, leaderboards, spectator view

## Risks & unknowns

- Players may chase the meter into flat mush and ruin the letter. Cap at 3 tells, never show a score.
- Four-word paragraphs game the meter — enforce a 25-word floor before lock.
- Attribution may be driven by *content* ("only Dev mentions the dog"), making the meter decorative. Unknown until playtest.
- Unknown whether friends reliably beat chance, which would mean the card never prints clean.

## Done means

Four phones join by code; all four type simultaneously; each phone displays a different, private, live 3-item tell list while the TV shows only word counts; at lock all four paragraphs appear on the TV in one frame with no labels; each phone privately assigns 3 authors; the TV prints the total-correct count, exports a PNG both clean and stamped variants correctly, and reloading the room afterward offers no path to recover who wrote which paragraph.
