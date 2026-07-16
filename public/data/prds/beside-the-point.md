## Overview
A hidden-role deduction game for 4-6 players around one shared photo. Everyone answers a question about it on their phone — but exactly one player's phone quietly asks a *different* question. No one, not even the imposter, is told their role. It's Jackbox-shaped: one host screen (TV), each phone a private controller.

## Problem
Most social deduction needs a rulebook, a moderator, and — worst of all — an imposter who *knows* they're the imposter and therefore performs. The richest paranoia happens when even the odd one out isn't sure they're odd. And the tired trick is to change a *fact* in someone's dossier; changing the *question* they're answering is fresher and hands the imposter real agency to bluff their way out.

## How it works
- Host TV shows one busy photo (a crowded platform, a cluttered kitchen).
- Each phone privately shows a short question and a text box. Crew all get the same question ("How many people are *waiting*?"). The lone imposter's phone shows a near-neighbor question about the same photo ("How many people are *sitting*?"). No role labels appear — you can't tell if you're crew or imposter.
- Everyone types a 1-5 word answer, submitted simultaneously and blind.
- TV reveals every answer side by side, shuffled, no names attached. Table debates: whose answer is quietly answering a *different* question?
- 30s discussion, then everyone votes on their phone. Roles reveal. Crew win if the imposter is caught; the imposter wins by surviving the vote.

Run two photos with the same roles so the tell accumulates. **Private:** your question. **Shared:** the photo and the anonymized answer wall.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / one Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Room {photoId, roundId, players[{id, name, role, question, answer, vote}]}`. On round start the server assigns roles, picks a curated `{crewQ, imposterQ}` pair keyed to `photoId`, and pushes each client **only its own** question. Flow is turn-gated (submit → simultaneous reveal → vote), so there's no hard real-time — the server buffers all answers and releases them together. The genuinely hard part is content, not code: authoring question pairs close enough to be non-obvious yet divergent enough to eventually betray.

## v1 scope
- 4 players, one imposter, ONE photo, one round.
- 6 hand-authored photos, each with one crewQ/imposterQ pair.
- Anonymized shuffled reveal, one vote, role reveal.
- No accounts, no persistence.

## Out of scope
- Cross-game scoring, multiple imposters, player photo uploads, an auto-judge for answer "plausibility" (v1: the table eyeballs it).

## Risks & unknowns
- Pairs may skew too easy (imposter instantly obvious) or too hard (no signal) — needs playtest tuning.
- With only 4 players, crew answers are noisy; one round may under-inform, so keep the option of two.
- Photo licensing for the bank.

## Done means
4 phones + a TV; each receives its private question; answers reveal anonymously; and across a few plays a table fingers the odd-question player meaningfully above chance.
