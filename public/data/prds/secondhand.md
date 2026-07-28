## Overview
Secondhand is a local writing tool for essayists, bloggers, and anyone who suspects their draft is made of other people's sentences. You paste a draft; it renders your text with a *patina* — a per-word wear shading derived from how heavily trafficked each 5-word span is in the historical book corpus — plus two aggregate readouts: **Wear** (how used your prose is) and **Vintage** (what decade your phrasing actually belongs to).

## Problem
Grammar checkers police correctness. Style checkers police adverbs. Nothing shows you the thing that actually deadens writing: phrases you believe you composed that have been composed forty thousand times already. And the naive fix — "be original" — is a trap, because the *least* common phrasings in a draft are usually just clumsy. Writers need a map of wear, not a score to maximize.

## How it works
1. Paste or open a draft. Text is tokenized and a 5-gram window slides across it, never crossing sentence boundaries.
2. Each 5-gram is looked up in a prebuilt frequency index. Raw count alone is useless ("one of the most important" is common because its *words* are common), so each span is scored by **excess frequency**: log(observed) − log(expected under a unigram/bigram model). High excess = a set phrase someone else assembled first.
3. Text renders with sepia shading proportional to excess. Dark = worn. Hovering a span shows the count and a sparkline of its usage 1800–2019, with its peak decade called out: *"peaked 1987."*
4. Two side panels supply the mischief. **Antiques**: your phrases whose usage peaked before 1940 — you are writing like a dead person and didn't know. **Fresh**: 5-grams with zero corpus hits, which are either genuinely yours or a typo, and the tool refuses to tell you which.
5. Vintage is the spend-weighted mean peak year across your spans, so a paragraph can read as "1955" and you get to decide whether that's the voice you wanted.

## Technical approach
Python/Rust + DuckDB. Data: Google Books Ngram v3 English 5-grams (`storage.googleapis.com/books/ngrams/books/20200217/eng/`). ETL: strip POS-tagged variants, drop total count < 40, collapse per-year counts into 24 decade buckets as u16. Store as an FST or marisa-trie keyed on the normalized n-gram → (total, decade vector) in a side array; a few GB on disk, sub-millisecond lookup. Unigram/bigram baselines come from the same corpus for the expected-count model. Front end: a single HTML page over a local FastAPI endpoint, spans rendered as `<span>` with an alpha channel.

The genuinely hard part is the normalization. Without it every function-word run lights up and the tool is noise. Second hardest: reconciling Ngram's tokenization (split contractions, straight quotes, hyphen handling) with modern prose so lookups don't silently miss.

## v1 scope
- Textarea → shaded output, nothing else
- 5-grams only, English only, count ≥ 40
- Hover shows raw count
- Wear number at the top

## Out of scope
Year sparklines and Vintage (v1.1), rewrite suggestions, any LLM, Word/Docs/Obsidian plugins, non-English corpora, web-era text.

## Risks & unknowns
The corpus is books through 2019, so internet-native clichés ("touch grass") are invisible. Quoted material and proper nouns will read as maximally worn — needs a quote-stripping pass. Index build is an hours-long one-time ETL that may scare off contributors.

## Done means
Paste 500 words, get shading in under 300ms on a warm index, and "It was a dark and stormy night" is visibly the darkest thing on the screen while your own best sentence is the palest.
