## Overview
Read It Before is a local writing tool for bloggers, essayists, and engineers who write design docs. Plagiarism checkers compare your text against the whole internet. This compares it against **your own reading diet**, the only corpus your memory actually drew from, and tells you which phrases you probably absorbed without noticing.

## Problem
The "Did Ente copy my code without attribution?" debate is about deliberate copying. The more common failure is accidental. Cryptomnesia is a documented memory error: you reproduce someone else's phrasing or idea and sincerely believe it is your own. Turnitin can't catch it, because the source is some Substack post you skimmed, not a paper in its index. And the polished line you're proudest of is often the one you didn't write.

## How it works
1. **Ingest.** Point the tool at your reading trail:
   - Safari/Firefox/Chrome history SQLite (`History.db`, `places.sqlite`)
   - Readwise or Kindle highlights export
   - Pocket/Instapaper export
   - A folder of PDFs
   For each URL it fetches readable text once (Readability) and caches it locally.
2. **Write.** Paste a draft, or watch a Markdown file.
3. **Flag.** Each sentence gets a margin note: "82% match: *'software is a liability you rent'*, from patio11, read 2026-03-14, 11:02pm." The note links to the source paragraph with your passage highlighted next to it.
4. **Choose.** Accept ("I'll cite it"), rewrite, or dismiss as a common phrase.

## Technical approach
- Python + SQLite FTS5 for the corpus. Expect ~5–20k documents for a heavy reader.
- Two detectors run in parallel:
  - **Verbatim echo:** winnowing fingerprints (k=7-word shingles, the MOSS algorithm) over lemmatized text. This catches near-exact lines.
  - **Paraphrase echo:** sentence embeddings (`bge-small` through `sentence-transformers`) in a `sqlite-vec` index, cosine similarity > 0.85. The hit must also share a rare content word (IDF above a threshold), or it gets dropped.
- **The hard part: false positives from clichés.** "At the end of the day" matches everything. Fix: build a background frequency model from a generic web corpus (C4 n-gram counts). Score each match by how unusual it is *in general* times how close it is to *your* source. Only phrases that are rare in the world and present in your history get surfaced.
- Time-decay display: a match from something you read last week is more suspect than one from 2019.
- Everything stays on your machine. Browsing history never leaves the laptop.

## v1 scope (humiliatingly small)
- Firefox `places.sqlite` and Readwise CSV only
- Fetch and cache the last 90 days of articles
- Winnowing detector only (no embeddings yet)
- CLI: `readitbefore draft.md` prints the flagged sentences with source URL and the date you read it

## Out of scope (for now)
- Editor plugins (VS Code / Obsidian)
- Podcasts or video transcripts
- Detecting idea-level borrowing (structure, argument), not just phrasing

## Risks & unknowns
- Paywalled pages and pages that are mostly JS fetch poorly, which leaves gaps in the corpus.
- History shows what you *opened*, not what you *read*. Weighting by dwell time may help.
- People may not enjoy learning that their best line isn't theirs. That is the product.

## Done means
The tool is seeded with 300 real articles from the author's history. A draft has 5 planted sentences paraphrased from those articles and 20 original ones. It flags at least 4 of the 5 planted sentences and no more than 2 of the original ones, in under 10 seconds.
