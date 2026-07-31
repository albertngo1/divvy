## Overview
A 4-player, six-minute hidden-role game for a living room with a TV and four phones. Everyone is dealt a small private hand of items sampled from a hidden place. Three hands come from the same place; one comes from a *twin* place that shares most of its furniture. Nobody is told their role, nobody is told the place. The fun is that the odd player's evidence is real, specific, and confidently wrong.

## Problem
The Chameleon/imposter genre has one structural flaw: the imposter *knows* they're the imposter, so the whole game is one person performing ignorance while everyone else performs suspicion. And most "different private view" twists are falsifiable in one sentence — as soon as two players compare cards, the liar is cooked. Wrong Aisle fixes both: every player's hand is different, so "my card says something else" is *normal*, and the odd player is genuinely persuaded by their own hand.

## How it works
The server picks a twin pair from a curated pack — e.g. HOTEL ROOM / HOSPITAL ROOM. Each set has ~20 items with a deliberate ~8-item overlap (TV, remote, curtain, bed, water pitcher) and exclusives (minibar, iron / IV pole, call button). Three phones get 5 items sampled from set A, one phone gets 5 from set B, weighted so the odd hand contains 2–3 overlap items and reads as unremarkable.

**Privately, per phone:** your 5 items, and nothing else. **On the TV:** turn order, timers, and vote reveals only — never anyone's hand, never a set name.

1. **Testimony (90s):** in TV-dictated order, each player says one sentence describing the place without naming any of their items. Free argument after.
2. **Screening (6 candidates × 7s):** the TV pushes one candidate item at a time — two A-only, two B-only, two shared. All four phones vote BELONGS / DOESN'T simultaneously; the server withholds votes until the window closes, then reveals all four by name at once. Honest players *also* disagree on hard A-only items, so the noise is cover.
3. **Verdict:** every phone privately submits an accusation, a one-word guess at the place, and an optional DECLARE ("my hand came from somewhere else — the group's place is ___"). Every phone shows the identical DECLARE control so its presence leaks nothing.

Scoring: honest players +1 per correct accusation; the odd player +3 for declaring and naming the group's place. Ties broken by nobody caring.

## Technical approach
Host browser tab + phone PWAs + one PartyKit Durable Object per room (Cloudflare), authoritative over a state machine: LOBBY → TESTIMONY → SCREENING(i) → VERDICT → REVEAL. Data model: `room {code, packId, setA, setB, deal: Map<playerId, itemId[]>, oddPlayerId, candidates[], votes: Map<round, Map<playerId, bool>>, phase, deadlineMs}`.

Sync strategy: the server never broadcasts the deal. Each socket receives only its own hand over a per-connection message; candidates are pushed one at a time so no client ever holds a list it could partition. Item ids are per-room shuffled opaque tokens with no set tag, so devtools reveal nothing. Votes are buffered server-side and released as a single broadcast on deadline expiry, eliminating anchoring and preventing a fast phone from seeing a slow one's answer.

The genuinely hard parts: (1) **content balance** — the overlap ratio is the entire difficulty knob, and it needs playtest tuning per twin pair; (2) **reconnect** — sessions keyed by a localStorage `playerId`, not connection id, so a dropped phone resumes the same hand mid-screening; (3) **deadline fairness** — clients do an RTT offset handshake and render a locally-interpolated countdown against a server timestamp.

## v1 scope
- Exactly 4 players, exactly one round, one twin pair hardcoded (hotel/hospital).
- Six pre-authored screening candidates, fixed order.
- Testimony is a timer and a turn order on the TV — no capture, no transcription.
- Text-only cards. No avatars, no sound, no lobby chat.
- Reveal screen: the two set names, who was odd, four accusations, done.

## Out of scope
Multiple rounds, 5+ players, more than one odd player, a content editor, LLM-generated twin sets, scorekeeping across games, spectators, rejoining a finished room.

## Risks & unknowns
The odd player may spot themselves in ten seconds if the sampler hands them two exclusives — the weighting must be enforced, not hoped for. Conversely, if the overlap is too generous the round has no signal and the vote is a coin flip. Twin pairs may not generalize: hotel/hospital is unusually good, and many candidate pairs are either identical or trivially distinguishable. Authoring these is real design work, not a data-entry task.

## Done means
Four phones join by room code, each shows a different five-item hand, and a network capture from any single phone contains no item belonging to another player and no set label. The screening phase reveals four votes at the same instant on the TV. The verdict screen correctly identifies the odd player and awards the DECLARE bonus. In three consecutive live playtests, the odd player fails to self-identify before the screening phase at least twice.
