## Overview
Askance is a two-to-six-player cooperative word game, in the spirit of Codenames, with one non-human teammate: an AI spymaster that is forbidden from using words. It knows the secret target words but can only communicate by glancing — its big cartoon eyes flick and linger toward tiles on a shared grid, with occasional nods or a slow blink. Your team wins by decoding the machine's gaze. It's a party game about the eerie, real skill of reading a system's non-verbal tells. For game nights and anyone charmed (or unsettled) by talking-to-machines.

## Problem
Every social party game gives the clue-giver words. But an arXiv paper on human–robot gaze in a word-association game hints at something weirder and more intimate: we *can* read where a machine 'looks.' Askance builds the bridge — a game whose entire clue channel is an avatar's eyes, which is both novel and quietly a lesson in how much we anthropomorphize.

## How it works
A 5x5 grid of words is dealt (like Codenames). The AI spymaster is secretly assigned the team's target words. Each round it must guide the humans to one target without any text: it animates its gaze toward the target, sometimes feints toward decoys, and its eyes 'weight' toward semantically related tiles it's actually thinking about. Players discuss what they saw ('it kept glancing bottom-left, then blinked at OCEAN') and commit a guess. Right tile = advance; wrong tile = the round ends, and if you hit the assassin word you lose. The spymaster's gaze is generated from the LLM's own association strengths, so its 'tells' are honest but noisy — you learn its habits over a match.

## Technical approach
Pure browser, single-screen pass-and-play or shared link. Board words + team/assassin assignment seeded daily. The spymaster: an LLM (Claude) is asked, given the target word and the 25 board words, to rank each tile by association and emit a small gaze 'script' — a weighted sequence of (tileId, dwellMs, feint?) plus nod/blink events. A lightweight easing engine animates SVG eyes toward tile centers using those weights, with jitter so it never simply stares at the answer. Data model: Round { target, gazeScript[], guess, result }. No fancy graphics — two ellipses, pupils, and eyelids driven by requestAnimationFrame. The hard part is tuning gaze legibility: readable enough to be solvable, ambiguous enough to be a game, and consistent enough that players learn its 'personality.'

## v1 scope
- One 5x5 board, one team, seeded daily
- LLM-generated gaze script; SVG eyes that glance/feint/blink
- Click-to-guess with advance/lose feedback
- A short post-round replay of the gaze so players can argue

## Out of scope
- Two competing teams, timers, scoring ladders
- Real webcam eye-tracking of players
- Voice or nodding beyond the avatar's own blink/nod

## Risks & unknowns
- Gaze may be either trivially readable or hopelessly vague — the whole game lives in that tuning band
- LLM association rankings can be bland; may need a spicier decoy strategy
- Fun likely needs 2+ players arguing; solo may fall flat

## Done means
Three people can play a full board start-to-finish reading only the avatar's eyes, correctly identify at least one target purely from gaze, and disagree out loud about what a feint meant — with a working replay that settles the argument.
