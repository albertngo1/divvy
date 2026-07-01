## Overview
Hunt & Peck is a hotseat party game about the hidden signal in how we type — a playful riff on 'brain-to-text without surgery' and on software that steganographically marks text. It runs on one laptop passed around a room. For game nights and anyone who's charmed by the idea that a keyboard leaks more than it lets on.

## Problem
We assume typing is neutral, silent data-entry. It isn't — keystroke *rhythm* is a genuine side-channel that leaks word boundaries, hesitation, and familiarity. Nobody has turned that unsettling fact into a party trick. The itch: feel the side-channel in your own hands and laugh at how legible you are.

## How it works
The typer draws a phrase card and types it normally. The game records only inter-keystroke timings — never the letters. Guessers then see a scrolling 'seismograph' of keystroke intervals plus scaffolding (word count, first letter, long-gap markers for word boundaries) and race to type the phrase. Fuzzy matching scores by speed and closeness. Rounds rotate the typer; over a session the group builds an intuition (and a corpus) of phrase → rhythm.

## Technical approach
Single static HTML page. Capture `keydown` timestamps in JS; store interval arrays, discard characters. Render intervals to a canvas as a dot-plot / waveform. Optional flourish: a WebAudio oscillator clicks per keystroke so you can literally *hear* the phrase's cadence. Phrase deck is a JSON file. Guess matching uses Levenshtein distance with a tolerance. Rounds persist to localStorage. Stretch goal: a tiny k-NN model over the accumulated timing corpus that predicts the phrase — proving the side-channel is real. The hard part is tuning *how much* to reveal so rhythm-only is hard-but-winnable, and physically preventing the typer from leaking the answer via the screen (blur the input field).

## v1 scope
- Hotseat, single laptop
- 10 phrase cards
- Capture + render keystroke intervals
- Reveal word count + first letter
- Manual scoring, localStorage rounds

## Out of scope
- Online multiplayer
- The predictive model
- Audio synthesis
- Difficulty settings / accounts

## Risks & unknowns
- May be too hard to be fun → mitigate with word count + first letter scaffolding
- Accessibility for keyboard-only players
- Novelty could wear off fast → the audio 'hear it' mode is the retention hook

## Done means
Three people play a hotseat round: typer enters a phrase, guessers see only the waveform + scaffolding, a correct fuzzy guess scores points, and timings persist to localStorage — with no letter of the phrase ever displayed.
