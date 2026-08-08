## Overview
A local writing tool for people who revise seriously — essayists, doc writers, novelists — that replaces vague readability scores with a simulation of eye movement. Paste a draft, get a rendering where each word carries a predicted gaze duration, skipped words fade out, and predicted regressions (the backwards saccade that means "wait, what?") are marked at the word that triggers them and the word the eye jumps back to.

## Problem
Every readability metric in common use is a 1940s regression on sentence and syllable length. They cannot tell you that a sentence is fine but its seventh word forces a reread, and they reward chopping sentences short even when the real cost is an unpredictable noun in a garden-path position. Meanwhile psycholinguistics has spent forty years building quantitative models of exactly this, validated against eye-tracking corpora, and none of it has reached a writing tool.

## How it works
1. Paste or point at a Markdown file.
2. Each word gets three features: length, corpus frequency, and in-context predictability.
3. An E-Z Reader-style model turns those into a first-pass gaze duration and a skip probability per word.
4. A regression heuristic marks integration failures — a large predictability spike landing where a long backward dependency has to be resolved.
5. The UI renders the paragraph with tint = gaze time, opacity = 1 − skip probability, and arrows for predicted regressions. Header shows total predicted reading time, skip rate, and regression count.
6. Diff mode: paste two drafts and see which one costs the reader fewer milliseconds.

## Technical approach
Python + FastAPI backend, plain HTML/JS front end. Tokenization, POS, and dependency arcs from spaCy `en_core_web_sm`. Frequency from SUBTLEX-US Zipf values, with a fallback for OOV words based on length and character n-gram probability. Predictability from per-word surprisal under a small local causal LM — GPT-2 small or a 0.5B via llama.cpp — summing subword log-probs to a word-level −log p, then mapping to a cloze-probability proxy with a fitted logistic.

Core model: E-Z Reader's L1 familiarity check as `α1 − α2·ln(freq) − α3·pred`, L2 completion as a fixed fraction of L1, saccade programming stages M1/M2, and skipping when L1 completes before the saccade to the word is programmed. Regressions are heuristic rather than modelled: flag a word when surprisal exceeds a running percentile threshold AND spaCy shows an incoming dependency arc spanning more than N words backwards.

The hard part is calibration. Published E-Z Reader parameters are fit to lab sentences, not blog prose, and a tool that lies confidently is worse than no tool. Validation against public eye-tracking corpora — Provo, GECO, Dundee — comparing predicted per-word gaze durations to recorded ones, and reporting correlation honestly in the UI rather than hiding it.

Data model: one row per token (index, text, freq, surprisal, p_skip, gaze_ms, regression_target) so the front end is a dumb renderer.

## v1 scope
- Single textarea, English only, one paragraph at a time
- Frequency + surprisal + length → gaze duration and skip probability
- Tint and fade rendering, plus a total predicted reading time
- No regression arrows yet, just a per-word surprisal spike marker
- Correlation against 200 Provo Corpus sentences printed in the README

## Out of scope
Other languages, real webcam eye tracking, rewrite suggestions, an editor plugin, anything that scores "quality".

## Risks & unknowns
Surprisal from a small LM may be a poor cloze substitute for creative prose. Parameters fit to isolated sentences may not transfer to long-form. Writers may find per-word gaze times unactionable noise.

## Done means
Predicted per-word gaze durations correlate at r > 0.4 with Provo Corpus recorded durations, and a paragraph rewritten to reduce predicted reading time by 15% is judged easier by three human readers.
