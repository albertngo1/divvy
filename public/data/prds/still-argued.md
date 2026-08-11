## Overview

A browser extension (and a standalone permalink viewer) that repaints any English Wikipedia article according to how *contested* each piece of text is. Settled prose reads normally. Sentences that editors have repeatedly reverted, restored, and re-litigated glow with increasing heat, and hovering one shows its fight record: how many times this exact wording has been removed and put back, by how many distinct accounts, when the last skirmish was, and a jump link to the talk-page section where it was argued. For students, journalists, and anyone about to cite Wikipedia in an argument.

## Problem

Wikipedia renders a stable, uncontroversial fact and a sentence that four editors have knife-fought over since 2019 in identical black Georgia. The provenance exists — every revision is public — but it's buried behind a diff UI nobody opens. So readers absorb the contested claims with exactly the same confidence as the settled ones, and that's precisely backwards: the fought-over sentences are the ones carrying the article's load.

## How it works

1. You load an article. The extension fetches token-level provenance and computes a per-token conflict score.
2. Sentences are shaded on a 5-step ramp from "never touched since first written" to "deleted and restored 10+ times."
3. Hover a hot sentence → a card: `restored 11×, 7 editors, last fight 2024-03, current wording survived 94 days (article median: 1,340)`.
4. Two toggles. **Settled only** greys out everything contested — the article as its least controversial self. **Fresh ink** inverts it: show only text younger than the article's median age, i.e. what changed while you weren't looking.

## Technical approach

Core data is the WikiWho API (`api.wikiwho.net/en/api/v1.0.0-beta/all_content/<title>/`), which returns every token in the current revision with `o_rev_id` (origin revision), plus `in`/`out` arrays — the revision IDs where that token was re-inserted and removed. Conflict score per token = `len(token['in'])`, which is literally the count of delete/restore cycles; sentence score = the 90th percentile of its tokens (max is too jumpy, mean washes out a single hot clause). Sentence segmentation via a wink-nlp tokenizer, aligned back to WikiWho's token stream by greedy offset matching on the raw wikitext-stripped surface forms — this alignment is the genuinely hard part, since WikiWho tokenizes punctuation and templates differently than any sentence splitter.

Editor diversity comes from `editor` ids on each token; the MediaWiki API (`action=query&prop=revisions`) fills in timestamps and edit summaries for the linked revisions. Talk-section linking is a cheap TF-IDF cosine match between the hot sentence and each `==Section==` of the Talk page. Manifest V3 extension, content script injects a `<style>` sheet and wraps sentences in spans; a Cloudflare Worker caches WikiWho responses (they're slow, ~2-6s for a big article) keyed by page + latest revid.

## v1 scope

- English Wikipedia only, article namespace only
- One heat ramp, no toggles
- Hover card with restore-count, editor-count, last-fight date
- Worker-side cache with 24h TTL
- Ships as an unpacked extension you sideload

## Out of scope

Other languages; a diff viewer; sockpuppet or POV-pusher detection; any claim about who was *right*; mobile.

## Risks & unknowns

WikiWho coverage is a beta service and can lag current revisions — need a graceful "provenance is 3 revisions stale" badge. Long articles blow past request timeouts. Vandalism-and-revert pairs will register as conflict noise; may need to discount tokens whose out-revision is tagged `mw-rollback`.

## Done means

On the [Gaza war] and [Nutrition] articles, at least three sentences render in the top heat band, each one maps to a real Talk-page dispute a human reviewer confirms, and the full page renders in under 4 seconds warm-cached.
