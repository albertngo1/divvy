## Overview
A CLI + web tool that reads a long document — a spec, an RFC, a contract, a thesis, a design doc — and reports two failure modes: **one word, two jobs** (a term whose meaning silently forks across sections) and **two words, one job** (synonym sprawl: user / customer / account holder / end user, all the same entity). For technical writers, spec authors, and anyone maintaining a document longer than they can hold in their head.

## Problem
Every grammar checker works at sentence scale. The expensive errors in long documents are at document scale, and they are almost always terminological. A term drifts, two teams read the same paragraph differently, and the argument surfaces in code review three sprints later. The existing answer — "maintain a glossary" — fails because nobody notices they need a new glossary entry at the moment they invent one.

## How it works
You run `whichclient spec.md`. Output is a ranked list:

```
"client"  (31 uses) — SPLIT, confidence 0.83
  sense A (§2.1, §2.4, §3.0): browser / requesting process
  sense B (§7.2, §7.5, App. C): the contracting party
  → 2 uses are ambiguous under either reading: §5.3 line 210
```

Plus the inverse report: `user / customer / requester appear to name one entity across 44 uses — pick one`. Clicking a sense in the web view highlights every occurrence in that cluster. There is a `--glossary` mode that emits a starter glossary from the surviving single-sense terms.

## Technical approach
- Segment with spaCy (`en_core_web_sm`) for sentence boundaries and noun-phrase chunking; keep every repeated head noun and multiword NP occurring ≥5 times.
- For each occurrence, take a ±2-sentence window and embed it with a sentence encoder (`bge-small-en-v1.5` or `all-mpnet-base-v2`, local, no API). Key trick: embed the *window with the target term masked out*, so the vector describes the context the word lives in rather than the word itself — otherwise every occurrence collapses to the same point.
- Cluster per-term with HDBSCAN on cosine distance. A term is flagged SPLIT when ≥2 clusters each hold ≥3 occurrences and the between-cluster centroid distance beats the within-cluster spread by a margin (a silhouette-style ratio, tuned on hand-labeled docs).
- Synonym sprawl is the dual: cluster *across* terms in a shared context space and flag distinct surface forms whose occurrence sets are mutually nearest neighbors.
- Optional LLM pass (Claude, one call per flagged term, batched) that reads 3 sampled sentences per cluster and writes a one-line gloss for each sense — labeling only, never detection, so results stay deterministic and cheap.
- The genuinely hard part is precision. Polysemy is normal in English ("table", "key", "run") and a linter that fires on every ordinary word is uninstalled in ten minutes. Needs a stoplist of inherently polysemous nouns, plus a rule that only flags terms the document itself treats as technical (capitalized, defined, or appearing in headings).

## v1 scope
- Markdown input only, one file
- SPLIT detection only — skip synonym sprawl entirely
- Terminal output with section anchors, no web UI
- Ships with a hand-labeled corpus of 6 real specs as a precision regression test

## Out of scope
DOCX/PDF, multi-file projects, CI action, tracked-changes integration, non-English, auto-fixing.

## Risks & unknowns
Precision may be unfixable without a domain lexicon. Masked-context embeddings may be dominated by section topic rather than word sense, which would produce a section detector instead of a sense detector — worth testing on day one with a deliberately planted split.

## Done means
On a spec where you manually planted one term split among 8,000 words, the tool ranks that term first, and running it over five unmodified real-world specs produces fewer than three false positives total.
