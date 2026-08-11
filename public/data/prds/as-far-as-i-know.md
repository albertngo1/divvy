## Overview

A cooperative twenty-questions riff (Werewords, Insider, Guess Who) for exactly four players and about six minutes: one Guesser and three Knowers, none of whom knows the secret. The secret has been shredded into three private fact cards, one per Knower's phone. The Guesser asks out loud; three phones answer privately and simultaneously.

For a group that likes deduction games but is tired of hidden-traitor roles — this has no liar in it and is still tense.

## Problem

At a table, twenty questions needs one omniscient answerer. That person is bored, holds all the power, and every "...sort of?" is a judgment call made aloud, which leaks tone, hesitation and half the answer. The Insider/Chameleon family fixes the boredom by adding a liar, which makes the game about vibes instead of inference.

## How it works

Server picks a secret — say **a lighthouse** — and deals three disjoint fact cards. Knower A: *man-made / taller than a person / usually outdoors.* Knower B: *contains a light source / not alive / costs over $10,000.* Knower C: *shows up in children's books / associated with the coast / older versions are 200+ years old.* No Knower is ever told the word.

The Guesser asks one yes/no question aloud and types it ("Is it alive?"). Every phone shows the question text. Each Knower answers from **their card only**: YES / NO / CAN'T TELL. Twelve-second timer.

**Host TV:** the running grid — one row per question, three columns of lamps (green / red / grey), seat-coloured so the Guesser can build a model of who knows what. Question count remaining. Nothing else.

**Each Knower's phone, privately:** their three attributes, the live question, three answer buttons, and a reminder that guessing beyond the card is the one sin.

Grey is the best move in the game. "Is it alive?" — B has *not alive* and says NO; A and C both go grey, and the Guesser now knows which lamp owns the animacy axis and can aim the next question at the other two. Eight questions, then one guess.

## Technical approach

PartyKit Durable Object per room (or Socket.IO over Tailscale Serve). `Room{code, phase, secretId, fragments[3], seats[], questions[{qid, text, answers}]}`. A fragment is bound to a seat token and is only ever serialised onto that one socket; the TV socket receives the fact cards never, not even at reveal until the round ends.

Sync: Guesser submits → server broadcasts `{qid, text}` and locks the Guesser's input → Knowers submit → server **buffers all three** and emits them together on the 12s boundary, or as soon as three land plus a fixed 800ms pad.

The genuinely hard part is the **timing side channel**. A snap NO and an agonised CAN'T TELL are different answers if the room can see who answered when. So: no per-player "answered" checkmarks on the TV, a single aggregate "2 of 3 in" pip, and a reveal clock that ignores how fast anyone was. Reconnect re-serves the player-bound projection only — never full room state a client could diff.

Fragments are hand-authored: eight secrets × three cards. No LLM in v1.

## v1 scope

- Exactly 4 players, 1 round, 8 questions, 1 final guess.
- 8 hand-written secrets, 3 fact cards each.
- Answers: YES / NO / CAN'T TELL. No text from Knowers, ever.
- TV: lamp grid + question counter. Reveal screen shows the word and all three cards.
- Score: solved in N questions, or not.

## Out of scope

- Variable player counts, teams, multi-round scoring.
- The poisoned-card variant (one attribute is secretly false).
- Voice input, generated secrets, spectators.

## Risks & unknowns

- Fragment authoring is the whole game — bad cards make every answer grey and the round dies. Needs a rule of thumb: each card must decide at least one obvious question.
- Knowers may over-infer once they've half-guessed the word and start answering from the guess, not the card. May need a nudge in copy.
- Eight questions may be too few or too many; tune on first playtest.

## Done means

Four phones join by code. One round runs end to end. Every question produces exactly three lamps revealed on the same frame with no per-player timing visible. A network capture of any Knower's socket contains only that Knower's three attributes. Two of three test groups guess the word.
