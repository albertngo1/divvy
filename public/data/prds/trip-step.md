## Overview
Trip Step is a prose linter for *reanalysis cost*: it flags places where a reader's incremental parse of your sentence commits to the wrong structure and has to be silently undone. For novelists, technical writers, and anyone whose draft is "grammatically fine" but exhausting to read.

## Problem
Grammar checkers check legality. Hemingway-style tools check length. Neither catches the actual friction: garden paths ("The old man the boats"), late-arriving PP attachment ("We shipped the fix to the customer who complained on Tuesday"), noun-noun pileups ("request timeout handler config error"), and the reduced-relative trap ("The data returned to the caller was stale"). Readers don't report these — they just get tired and stop. Long sentences are innocent; *ambiguous prefixes* are the crime, and no tool measures them.

## How it works
Paragraph in, heat map out. Each sentence gets a Trip Score and each offending token gets a marker: a caret at the disambiguation point (where the reader finds out they were wrong) and a highlight over the misparsed span (what they thought it meant). Hovering shows both readings in plain English: *"read as: the data that was returned → actually: the data returned it"*. One-click rewrites offer the cheap fixes writers forget: restore the deleted "that"/"who was", move the adverbial, split the noun stack.

## Technical approach
Python + spaCy `en_core_web_trf` for full parses, FastAPI backend, a plain HTML/CDN-free frontend with a CodeMirror 6 editor.

The core signal is **prefix-parse instability**. For each sentence of *n* tokens, parse all *n* prefixes. Build the head-assignment vector at each step; a *reanalysis event* is any token whose head or dep label in prefix *k* differs from its label in the final parse, and whose earlier assignment survived ≥3 tokens (a long-lived commitment is what costs the reader). Trip Score = Σ over events of (survival length × depth of the changed attachment).

Second, orthogonal signal: token surprisal from a small causal LM (GPT-2 small or Qwen-0.5B via `transformers`, CPU is fine at paragraph scale). A spike in surprisal *at* a reanalysis point is the strong confirmation; surprisal alone is just rare vocabulary, so the tool only fires when both agree.

Pattern layer for known traps that parsers resolve too well to notice: reduced relative clauses (`VBN` directly after a bare `NN` with no `that/who`), "that"-drop after report verbs, three-plus consecutive nouns, and sentence-initial subordinators with a missing comma.

The genuinely hard part: transformer parsers see the whole sentence and are *too good* at prefixes — they hallucinate a confident parse of a fragment. Mitigation is calibrating on a labeled set (Potsdam-Allahabad / Provo eye-tracking corpora expose real regression rates) and tuning thresholds until flag density matches human regression density rather than parser jitter.

## v1 scope
- Paste-a-paragraph web page, English only
- Prefix-instability scoring + surprisal confirmation
- Three pattern rules: reduced relative, dropped "that", noun stack ≥3
- Heat map + hover showing the two readings

## Out of scope
- Rewrite generation beyond the three canned fixes
- Any language but English; PDFs; Word/Google Docs plugins
- Style, tone, or grammar checking of any kind

## Risks & unknowns
False-positive flood is the killer — writers abandon a linter that flags every third sentence. Prefix parsing is n× slower than one parse; a 40-sentence page must stay under ~4s. Eye-tracking corpora may prove too small to calibrate against.

## Done means
On a held-out set of 50 published garden-path examples plus 50 matched controls, the tool flags ≥80% of the garden paths and ≤10% of the controls, and a 500-word draft scores in under 4 seconds.
