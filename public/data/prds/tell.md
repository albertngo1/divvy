## Overview

Every phone privately shows the same hidden axis — say, "polite ↔ rude" — with a slider. Players take turns placing a shared pool of words along the axis. One player (the Imposter) sees a subtly shifted axis: "formal ↔ casual". Both axes overlap heavily ("hey dude" is casual AND rude-adjacent) so the Imposter's placements aren't obviously wrong — just slightly off in aggregate. After the round, everyone votes on who was working from a different axis. Per-phone is load-bearing because the axis label must remain private to each player — a shared screen would leak the trick instantly.

## Problem

Traditional Undercover / Chameleon games get solved fast because the "one different word" gap is discrete and obvious after one or two clues. A continuous axis of near-synonyms hides longer: the Imposter's placements are plausible on any single word, and only reveal a pattern in aggregate over 6-10 placements. This mechanic doesn't exist in physical form because it requires per-player private state that's semantically related but not identical — impossible without private screens.

## How it works

Room code join, 4-7 players. Server picks an axis pair from a hand-authored library (e.g. polite↔rude / formal↔casual, brave↔reckless / bold↔foolish, cheap↔affordable / stingy↔frugal). One player is silently designated the Imposter and shown the shifted axis. A shared word bank of ~12 words appears; players take turns dragging one word onto their axis slider. Everyone sees everyone's placements on their own axis label — meaning the same placement looks reasonable or weird depending on which axis you're reading. After all words are placed, 30s discussion (typed chat), then anonymous vote. Imposter wins if uncaught; group wins on correct vote.

## Technical approach

PartyKit or Socket.IO on the homelab. Room state = `{axis_pair, imposter_id, word_bank, placements: [{word, value_0_1, placer_id}], votes}`. Each phone gets the axis label appropriate to its role in its initial payload — server never broadcasts the "true" axis. Drag interaction via pointer events with a horizontal slider component. Axis library hand-authored (~20 pairs). Chat via broadcast WebSocket messages. No LLM in v1.

## v1 scope

3 rounds, 4-6 players, 15 hand-authored axis pairs, 12-word banks per axis (also hand-authored, ~8 shared banks). Round: 90s placement phase (words distributed round-robin), 45s discussion (typed chat), 20s vote. Score: +1 per correct accuser, +2 to Imposter if uncaught. No LLM axis generation, no custom axes, no voice chat, no continuous rooms.

## Out of scope

LLM axis/word generation, voice chat, spectator mode, replay of placements, axis reveal animation beyond text, streak/season scoring, custom word banks, mobile app.

## Risks & unknowns

Axis pair quality is everything — pairs that are too similar make the Imposter invisible, too different and it's obvious in one placement. Need playtest iteration on the 15 pairs. Second risk: does "drag a word on a slider" feel good on a phone at 4 concurrent players? May need a discrete 5-point scale instead of continuous. Third: whether the group can genuinely feel a pattern across ~12 placements or whether it just feels like noise.

## Done means

4 friends play 3 rounds, correctly identify the Imposter at least once, and misidentify at least once. Bonus signal: someone says "wait, was the axis 'polite' or 'formal'?" mid-round.
