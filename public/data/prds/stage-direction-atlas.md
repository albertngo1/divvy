## Overview

Stage Direction Atlas visualizes the *negative space* of theater: not the dialogue, but the parenthetical instructions playwrights leave between lines. Every stage direction from a canon of playwrights (Shakespeare, Ibsen, Beckett, Chekhov, Mamet, Williams, Pinter) is parsed, classified by verb-class, and plotted as a color-banded density strip running the length of each play. Side by side, the signatures are shocking: Beckett is mostly *pauses*, Mamet is *exits/enters*, Ibsen describes *furniture and rooms*, Shakespeare barely directs at all. The artifact is a portrait of how each writer thinks about the body on stage.

## Problem

Stage directions are the most-ignored layer of dramatic text. Scholars study individual plays' directions, but nobody has aggregated them across playwrights to reveal structural signatures. The data is buried in markup nobody parses for this purpose, and the "shape of a playwright's silence" is a thesis that has never been rendered visually.

## How it works

The viewer lands on a wall of horizontal strips, one per play, grouped by playwright. Each strip's x-axis is play position (act/scene normalized 0-1); color bands encode verb-class density (movement, speech-manner, physical-contact, environment/set, silence/pause, sound). A legend toggles classes on/off. Hovering a band surfaces the raw direction text ("*She sits. Long pause.*"). A "compare" mode stacks two playwrights' aggregate profiles as mirrored density curves. Primary share artifact: a single PNG of the small-multiples wall.

## Technical approach — specific

Stack: Python for the ingest/NLP pipeline, static JSON output, Observable Plot + D3 in a Vite site for the front end (no server). Data sources: **Folger Digital Texts** (Shakespeare, clean TEI-XML with `<stage>` elements already tagged) and **Project Gutenberg drama** (Ibsen, Chekhov, Strindberg via public-domain translations; extract directions with regex on italic/bracket conventions). Modern playwrights (Beckett, Mamet, Pinter) are copyright-locked — handle via a small hand-curated sample corpus for illustration, clearly labeled, rather than full-text ingest.

Data model: `direction {play_id, playwright, position_norm, raw_text, head_verb, verb_class, char_len}`. Pipeline: parse TEI `<stage>` for Folger; for Gutenberg, heuristic extraction of italicized/bracketed non-dialogue lines. Run spaCy for lemmatization + dependency parse to find the head verb of each direction; map lemmas to verb-classes using a hand-built lexicon seeded from VerbNet/WordNet (movement: enter/exit/cross/sit; speech-manner: aside/whisper; silence: pause/beat/silence). The hard part: verb-class taxonomy is the whole project — a naive POS tag misclassifies "*The room is dark*" (stative, environment) as non-verbal, and Beckett's "*Pause.*" has no verb at all, so the classifier needs a fallback keyword layer plus manual review of the top-500 most frequent directions.

## v1 scope (humiliatingly small)

- Shakespeare (Folger TEI) + Ibsen + Chekhov (Gutenberg) only — 3 playwrights
- 6 verb-classes, hand-tuned lexicon
- Static small-multiples wall, hover-to-read, one PNG export
- Compare mode for exactly two playwrights

## Out of scope (for now)

- Full modern-playwright corpora (copyright)
- Non-English drama in original language
- Any ML classifier beyond spaCy + lexicon lookup
- Live search / user-uploaded scripts

## Risks & unknowns

Prior-art verdict: **Open** — only single-play studies exist; no cross-playwright verb-class density viz. The real risk is classification quality: verb-classes are subjective, and Gutenberg's inconsistent markup makes direction-extraction noisy (some editions inline directions into speech). Mitigate by restricting v1 to Folger's clean TEI plus two well-formatted Gutenberg authors, and manually auditing the frequency head. The "shape of silence" claim must survive the data — if Beckett's sample is too small to be honest, frame it as illustrative.

## Done means

- Pipeline ingests ≥3 playwrights, ≥15 plays, emits validated JSON
- Every direction has a verb-class; ≥90% of the top-500 directions manually confirmed correct
- Wall renders all plays; hover shows raw text; PNG export works
- Compare mode produces mirrored density curves for any two playwrights
- Deployed as a static site
