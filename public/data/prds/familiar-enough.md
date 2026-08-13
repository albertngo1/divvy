## Overview

A browser extension and paste-in web tool for intermediate readers of a second language. It inverts what every reader tool does. Dictionaries, pop-up translators, and graded readers all help with words you *notice* are hard. This one stays silent on those and flags only the words that feel safe and aren't: the false friends, the semantic drifts, the loan shifts.

## Problem

At intermediate level, unknown words are a solved problem — you hover, you get a gloss, you move on. The errors that actually survive into your understanding are the confident ones. You read *eventualmente* as "eventually," *pretender* as "pretend," German *bekommen* as "become," and the sentence still parses, so nothing signals a problem. Nobody looks up a word they're sure of. These misreadings compound silently for years, and existing false-friend resources are hand-curated lists of 40 classroom examples per language pair — nowhere near the real long tail, and useless mid-page.

## How it works

1. Set your L1 and the L2 you're reading.
2. Read normally. Nothing pops up.
3. Words that score high on *deceptive familiarity* get a thin underline. Hovering shows two things side by side: what you think it means, and what it means — plus the divergence, e.g. "shared Latin root, senses split c. 1600."
4. Every hover is logged. Your personal trap list builds up, and the tool re-underlines your repeat offenders more aggressively on later pages.

## Technical approach

Scoring a word pair as a false friend = high *form* similarity, low *meaning* similarity.

Form: normalized Levenshtein on IPA transcriptions (espeak-ng gives phonemes for both languages) combined with orthographic distance after stripping diacritics — phonetic distance matters because the illusion is partly auditory. Candidate generation across the full L2 lexicon is expensive, so index L1 words by a phonetic key (a Double-Metaphone variant retuned per language) and only compare within buckets.

Meaning: LaBSE or a distilled multilingual sentence encoder over each word's Wiktionary gloss set, giving a cross-lingual sense-embedding per word; low max-cosine across sense pairs = divergence. Wiktextract's machine-readable Wiktionary dump (kaikki.org, per-language JSONL) supplies glosses, etymologies, and — key — shared etymological ancestors, which separate true false friends (shared ancestor, split senses) from mere lookalikes (coincidence), and only the former deserve a flag.

Runtime is a precomputed table per language pair: `(l2_lemma, l1_lemma, form_score, sense_score, etym_shared, note)`, maybe 30k rows per pair, shipped as a static ~2MB JSON the extension loads. Lemmatization in-page via a small FST or a language-specific stemmer.

Hard part: polysemy. *Pretender* really does mean "pretend" in one narrow sense; flagging it in every context is noise. v1 punts by requiring the *dominant* senses to diverge; v2 would use the surrounding sentence embedding to decide whether this occurrence is the trap sense.

## v1 scope

- One direction, one pair: English L1 → Spanish L2
- Offline pipeline builds the table from Wiktextract + espeak-ng; ship it as static JSON
- Paste-in web page only, no extension
- Underline + hover card, no accounts, trap list in localStorage

## Out of scope

Context-sensitive sense disambiguation, spaced repetition, PDF/EPUB, mobile, any pair beyond ES↔EN.

## Risks & unknowns

Wiktionary gloss coverage is thin for less-documented languages and glosses are noisy definitions, not senses. Threshold tuning is the whole product — too loose and it's a highlighter, too tight and the page looks empty. Needs a human-graded eval set: take the ~200 known ES/EN false friends from published lists, confirm the pipeline recovers ≥80% of them, then judge 100 random *new* flags by hand.

## Done means

On a random Spanish news article, the tool underlines 3–8 words per 1000, recovers ≥80% of the published false-friend list, and hand-review of 100 novel flags shows ≥60% are genuine traps rather than noise.
