## Overview
Non Sequitur is a 4–6 player hidden-role party game. Everyone believes they're answering the same open-ended question, but one player (the Stray) received a subtly twisted variant on their phone. A tiny in-browser language model reads each answer *in the context of the real question* and reports how surprised it is — the Stray's answer, written for the wrong question, reads as an out-of-context spike. Players hunt the Stray using nothing but that perplexity signal plus their own suspicion.

## Problem
Hidden-role games usually need an explicit 'tell' mechanic (a card, a whispered word). Here the tell is *emergent linguistics*: an answer to the wrong question is genuinely, measurably less predictable when slotted against the right one. The itch is the paranoia of not knowing if YOUR question was the real one.

## How it works
Each phone PRIVATELY shows one question. Five phones read "Name something you'd never bring camping." One phone reads "Name something you'd always bring camping." No phone reveals which variant it holds — the Stray often doesn't realize they're the odd one out. Everyone types a short answer privately.

The host takes the *canonical* question and, for each answer, forms the string "Q: <real question> A: <answer>" and scores it through distilgpt2 (transformers.js). The shared TV shows an anonymized bar chart of length-normalized surprisal — one bar per answer, no text, no names. Typically the Stray's bar is elevated (their answer fits a different question), but skilled Strays who wrote something generic can hide, and unlucky honest players who wrote something weird can look guilty.

Each phone then PRIVATELY votes for who they think the Stray is. Reveal: real questions shown, votes tallied. Honest players score for correctly fingering the Stray; the Stray scores for surviving.

## Technical approach
Host tab loads the model once; phones are dumb PWA controllers. Authoritative WebSocket server (PartyKit / Durable Object) holds room state: `{players[], questions:{playerId->variantText}, canonical, answers:{playerId->text}, surprisals:{}, votes:{}}`. Flow is turn-gated by server phase (`prompt→answer→score→vote→reveal`). Scoring runs only on the host to keep one model instance; host posts surprisal array back to server. Genuinely hard part: calibrating the twist so the perplexity gap is *usually but not always* legible — too obvious and it's no fun, too subtle and it's noise. Requires a hand-tuned question bank of near-minimal-pair variants.

## v1 scope
- One round, one question with one hand-authored twist variant
- 4–6 players, fixed single Stray
- Anonymized surplus bar chart + one private vote
- ~8 pre-written question/twist pairs, no generation

## Out of scope
- Multiple rounds / scoring across games
- Player-authored questions
- Model-generated twists
- Handling ties or Stray-picks-Stray edge scoring elaborately

## Risks & unknowns
- Perplexity gap may be too flat for very short answers — enforce a min word count
- distilgpt2 latency on host for 6 answers must stay <2s
- Some twist pairs will be duds; needs playtesting to cull

## Done means
4 phones each show a question, one differs; all answer; host renders 4 anonymized surprisal bars; each phone casts a private vote; reveal screen correctly shows the real questions, the twist, and who won — with the Stray's bar visibly (usually) elevated.
