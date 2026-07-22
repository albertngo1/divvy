## Overview
Din is a local-multiplayer party game built on the 'cocktail party problem' — the brain's ability to lock onto one voice in a roomful of talk. Every player's phone plays a *different* short narrated story simultaneously, filling the room with overlapping speech; each player must ignore the din and follow only their own phone to answer a comprehension question.

## Problem
Party games lean on trivia, drawing, or bluffing — the ear is almost never the playing field. Meanwhile selective auditory attention is a genuinely hard, funny-to-fail skill: with five phones talking at once, staying locked to yours is a real cognitive workout and hilarious to watch people strain at. No party game weaponizes this.

## How it works
1. Players join a room from one host (phone or TV screen).
2. On 'go', each phone begins speaking a distinct ~30-second micro-story, panned/volumed so the room becomes a wash of overlapping voices. Players hold phones to their ear.
3. When audio ends, each phone shows a multiple-choice question answerable *only* from that phone's story ('What did the smuggler hide in the melon?'). Distractor answers are seeded from the *other* players' stories, so drifting attention picks the wrong one.
4. Points for correct + speed. Escalating rounds add more simultaneous voices, faster speech, and 'crosstalk' twists where two phones briefly swap a sentence.

## Technical approach
Stack: a web app (host + clients over WebSocket, no installs). Stories are a curated bank of short scripts, each with a keyed question and distractors tagged by story so the host can guarantee cross-story confusability. Audio via on-device TTS (Web Speech API) or pre-rendered clips (better cross-device consistency) served per player; the host assigns story→player so no two neighbors get the same voice and distractors reference the *actual other stories in play this round*. Sync uses a shared countdown with NTP-style offset correction so all phones start within ~50ms. Hard part: distractor generation that makes attention-drift genuinely punishing without being unfair, and keeping voices distinct enough to be separable but similar enough to interfere.

## v1 scope
- 4–6 player web room, no accounts
- 20 pre-written stories with keyed questions + cross-tagged distractors
- Synchronized simultaneous playback
- Score + round escalation (more voices each round)

## Out of scope
- LLM-generated stories on the fly
- Spatial/binaural audio
- Global leaderboards

## Risks & unknowns
Room acoustics and phone speaker volume vary wildly — may need headphones for fairness, which changes the vibe. Deaf/HoH accessibility is inherently limited. Fun ceiling unproven past a few rounds.

## Done means
Five people in one room play a full round, each phone plays a distinct story in sync, and at least one player audibly fails because a neighbor's louder story hijacked their answer — with everyone laughing.
