## Overview

A 90-second quiz for 4–6 people scored by a proctor, not a teacher. Correct answers are worth points and carry no risk. Wrong answers cost nothing on their own — but every other player who picked *the same wrong option* costs you both dearly. This is the actual forensic statistic used to detect exam cheating: shared errors, not shared successes, are the signal.

## Problem

Trivia punishes not knowing, which is a bad party mechanic — the person who knows least has the worst time. Invert it: the danger isn't ignorance, it's *conventional* ignorance. And because talking is the only way to get answers right, the room's own chatter is the thing dragging everyone into the same wrong answer. Conferring is both your best tool and the trap.

## How it works

The TV shows six questions and a 90-second clock. Every phone privately shows its own answer sheet with four options per question — but each phone's options are **independently shuffled**, so nobody can shout "I put C." To collude, you have to say the actual content out loud, in front of everyone, which is exactly the incriminating act.

Two of the six questions are **silently variant per player** — one detail swapped — so an answer overheard from across the room can be wrong *for you*. A small icon warns that some question on your sheet may be a variant, without saying which.

Each phone also offers a per-question **SOLO** flag: bet that nobody else picked your option, for a bonus if you're right and nothing if you're not.

Scoring: correct = +2 regardless of how many others got it (right answers carry no forensic signal). Wrong = 0, minus 3 for *each* other player who chose the identical wrong option. So the seductive distractor is the deadly one, and the absurd distractor is free. When you don't know, the correct play is to be wrong in a way nobody else would think of.

The reveal on the TV is a proctor's report: per question, a similarity matrix of who matched whom on errors, edges drawn between the guilty pairs, then a final cleared/expelled card.

## Technical approach

PartyKit or a Durable Object per room; a JSON question bank. Data model: `{roomId, questions[], players: {id, permutation[q], variant[q], answers[q], soloFlags[q]}}`. Each player gets a permutation seed at join; settlement is a pure server-side pass at the buzzer, so there is no hard realtime problem here.

The hard part is authoring. Every question needs a calibrated plausibility gradient — one seductive wrong answer, two middling, one absurd — or the mechanic has no slope and the game collapses into "always pick the silly one." Distractors get drafted by an LLM, then hand-tuned against measured pick rates from pilot play. Secondary hard part: variant questions must feel like a fair trap rather than a gotcha.

## v1 scope

- 4 players, 6 questions, 90 seconds, one round
- Two variant questions, hand-written, hardcoded
- Per-phone option shuffling; SOLO flag
- One reveal screen: matched-error matrix plus final scores
- No accounts, no packs, no persistence

## Out of scope

Multiple rounds, custom question packs, free-text answers with embedding similarity, per-question timers, spectator mode.

## Risks & unknowns

The +2 / -3 balance is load-bearing: too harsh and everyone picks absurd answers every time; too soft and it's ordinary trivia. Shuffled option labels may just read as annoying. Worst case, the penalty scares the room into total silence — which kills the party the game depends on.

## Done means

Four players, one 90-second round: at least one matched-distractor penalty fires, the reveal correctly names the pair and the shared option, a variant question catches at least one copier — and someone in the room audibly says "don't say it out loud."
