## Overview
A browser linter for novelists, game writers, and localization leads. English lets you withhold facts by accident of grammar; most other languages don't. Forced Move scans your text and shows you, per target language, the exact spans where a translator will be *grammatically compelled* to commit to a fact you never decided — and lets you decide it now, on purpose, before 12 localizations decide it differently.

## Problem
This wrecks real projects. A game writer keeps a companion's gender unstated for a late reveal; the Spanish translator has to pick an adjective ending in chapter one and the twist dies. Two characters' relationship arc hinges on when they stop being formal, but Japanese and Korean force a politeness register on line one. Nobody finds this until the LQA pass, when a rewrite costs 40x. Today the workflow is "the translator emails a list of questions three months late."

## How it works
1. Paste or upload a scene (plain text, or a strings file — .po, .xliff, Unity CSV).
2. Pick target languages from a checklist.
3. The text renders with colored underlines. Hovering a span shows the *forcing rule*: "ES — past participle in 'I was tired' agrees with speaker gender: cansado/cansada." "JA — 'you' requires choosing あなた/君/お前 or dropping; each encodes relative status." "RU — the past-tense verb 'said' carries speaker gender." "KO — verb ending forces a formality tier relative to the addressee."
4. Each flag becomes a decision with three buttons: **Decide** (write the answer into a per-character sheet), **Keep ambiguous** (get suggested English rewrites that dodge the forcing construction — "I felt exhausted" avoids the participle), or **Ignore**.
5. Export a **Translator Brief**: a per-character table of gender, formality relationships, and number resolutions, plus the list of intentionally-ambiguous spans marked DO NOT RESOLVE.

## Technical approach
SvelteKit + a Python service. Parse with spaCy or Stanza to get dependency trees, then run a rule engine over the parse — not vibes, not an LLM as the primary detector.
- **Rules as data**: each is `{lang, trigger: dependency/POS pattern, forced_feature: gender|formality|number|animacy|evidentiality|inclusivity, explanation, dodge_hint}`. Triggers are Semgrex-style patterns over the English parse (first-person subject + past participle predicate adjective → Romance gender agreement; 2nd-person pronoun → JA/KO/DE/FR/ES T–V split; bare plural noun → languages with obligatory classifiers or dual number; "we" → Tagalog/Vietnamese inclusive-exclusive; reported speech → Turkish evidential -miş).
- **Coreference** resolves which character each first/second person refers to, so decisions bind to a character sheet rather than a span.
- **Hard part**: precision. A rule that fires on every sentence is noise. The T–V rule must fire on *the first exchange in a relationship*, not all 400 lines — so flags are deduplicated per (character-pair, feature) and surfaced once, at their earliest occurrence.
- LLM used only for the optional "suggest an English rewrite that keeps ambiguity" button.

## v1 scope
- 3 target languages: Spanish, Japanese, Russian
- ~12 rules total, gender + formality + number only
- Paste-a-scene textarea; no file import
- Character sheet in localStorage; markdown brief export

## Out of scope
Actual translation, TM/glossary integration, CAT-tool plugins, right-to-left languages.

## Risks & unknowns
Parse errors on stylized fiction dialogue. Linguistic rules need a native-speaker review per language or the explanations will be subtly wrong and embarrassing.

## Done means
Run it on a published short story with a gender-ambiguous narrator; it flags every span the story's actual Spanish translator had to ask about, plus at most 2 false positives per 1,000 words.
