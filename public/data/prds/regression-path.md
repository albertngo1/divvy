## Overview
A writing tool that replaces readability scores with a *simulated scanpath*. Drop in a paragraph; get an overlay showing where a reader's eyes land, how long they dwell, which words they skip entirely, and — the payload — which words trigger a **regression**: the backward jump that means comprehension broke. For essayists, docs writers, and anyone who has ever been told their sentence is "hard to follow" with no idea which part.

## Problem
Flesch–Kincaid counts syllables per word. It was designed in 1948 for Navy manuals and it cannot tell you that your third clause forces a reread. Meanwhile psycholinguistics has 40 years of validated eye-movement models that predict exactly that, and they've never been packaged as a writing tool — partly because they required a hard-to-get input: human cloze predictability norms for every word. An LM's next-token logprob is that number, free.

## How it works
1. Tokenize into words; get log frequency per word and predictability-in-context per word.
2. Run an E-Z Reader-style serial attention model: for each word, a familiarity check (L1) whose duration falls with frequency and predictability, then lexical completion (L2), then a saccade programmed toward the next word's center. High predictability ⇒ word skipped outright. Slow L1 ⇒ long fixation, or refixation.
3. Add a regression rule the classic model lacks: if surprisal at word *n* exceeds a threshold *after* the eyes have already committed past a prior attachment point, fire a regression back to that point and re-fixate.
4. Render as SVG over the text: circles sized by fixation duration ms, faint forward arcs for saccades, red arcs above the line for regressions, and a per-word heat tint. Sidebar: predicted total reading time, skip rate, and the top three regression triggers with a one-line "why" (rare word / low predictability / late disambiguation).

## Technical approach
Python + FastAPI backend, plain HTML/SVG frontend.
- Frequency: SUBTLEX-US Zipf values (free CSV, 74k words), with an OOV backoff.
- Predictability: local GPT-2-medium via `transformers`, one forward pass, take `-log p(token | left context)`; sum subword logprobs to word level. Surprisal in bits doubles as both the E-Z Reader predictability term and the regression trigger.
- Model core: ~150 lines implementing E-Z Reader 10's L1/L2/M1/M2 stage durations with published parameter values, gamma-distributed noise, one Monte Carlo run of 30 simulated readers averaged into a mean scanpath.
- Validation harness: the **Provo Corpus** — 55 paragraphs with both real eye-tracking data *and* human cloze norms for every word. Correlate model fixation durations against human means, and LM surprisal against human cloze, per word.

Genuinely hard part: regressions. E-Z Reader's own regression mechanism is weak and mostly oculomotor error, whereas the interesting ones are integration failures. The surprisal-after-commitment heuristic is my invention and may not beat chance — Provo tells you within an afternoon.

## v1 scope
- Textarea in, SVG scanpath out. One paragraph, ≤120 words.
- Fixation circles + regression arcs. No animation.
- Deterministic seed, 30 simulated readers, mean only.
- Provo correlation printed to stdout on startup as a sanity check.

## Out of scope
Google Docs/Word plugin. Multi-paragraph documents. Rewrite suggestions. Comparing two drafts. Any claim about *your* eyes specifically.

## Risks & unknowns
GPT-2 surprisal may correlate with human cloze too weakly at low-probability words. E-Z Reader parameters are fit to lab reading of isolated sentences, not blog prose. The output may be *interesting* but not *actionable* — the fix is the sidebar ranking, not the pretty arcs.

## Done means
On Provo, mean simulated fixation duration correlates r ≥ 0.5 with human means per word; and on a deliberately garden-pathed sentence ("The horse raced past the barn fell") the rendered scanpath shows a regression arc landing on or before *raced*.
