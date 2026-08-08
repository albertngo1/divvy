## Overview

An explorable explanation, and secretly a wordgame, about *free word order*. You get one line of Latin verse as six draggable word-tiles. Rearrange them. A panel shows, live: (a) is this order still grammatical, (b) how probable is it under a Latin language model, (c) where does it rank among all 720 permutations, and (d) where the poet's actual order sits. For anyone who took two years of Latin and never got a feeling for why the words are in that insane sequence.

## Problem

Everyone is told "Latin has free word order because the endings carry the grammar," and nobody is ever *shown* it. The Ancient Library-style tools parse a word for you but never let you break the sentence to feel where the constraints actually are. Meanwhile the genuinely startling fact — that great verse systematically chooses low-probability orderings, that hyperbaton is measurable — is sitting in the Perseus treebanks unvisualized.

## How it works

Pick a line (start with famous ones: *arma virumque cano Troiae qui primus ab oris*). Words are tiles carrying their morphological tags, shown as small colored case-badges. Drag to reorder. Three readouts update:

- **Parse**: run the dependency parser; if it still yields the same dependency tree with the same head-attachments, the order is *meaning-preserving* and the tiles glow. If the parse flips (a different noun becomes the subject) the app says so out loud: "now the *arms* are doing the singing." This is the delightful part — the failures are funny.
- **Surprisal**: log-probability of the token sequence under a Latin LM, drawn as a per-word bar.
- **Rank**: a strip plot of all 720 permutations sorted by probability, with a marker for *yours* and a gold marker for *the poet's*. On most hexameter lines the gold marker sits in the bottom decile.

A "scramble mode" turns it into a game: given a shuffled line, restore the *poet's* order, scored not by exact match but by how far down the probability ranking you got — because guessing the boring order is the trap.

## Technical approach

Data: the Perseus/PROIEL Latin dependency treebanks via Universal Dependencies (`UD_Latin-Perseus`, `UD_Latin-PROIEL`), CoNLL-U, CC-licensed, thousands of gold-annotated verse lines with morphology already tagged — no OCR, no scraping. Frontend: SvelteKit, tiles as a flex row with a drag library, D3 for the rank strip.

Computation is precomputed and static — this is the key simplification. For each curated line, offline: enumerate all `n!` permutations (cap at n=7, i.e. 5040), score each with a small character/word-level Latin LM (a KN-smoothed 5-gram trained on the ~2M-token Latin UD + Latin Library corpus is enough, and it's a 20MB JSON the browser can hold; a distilled Latin BERT is the upgrade path), and run each through a trained parser (Stanza's Latin model, or UDPipe 2) to get its tree. Ship, per line, a single JSON: `{perm_index: {logprob, tree_hash, head_of_each_token}}`. The client just looks up the permutation index of whatever the user dragged — zero inference at runtime.

The hard part is defining "still means the same thing" rigorously: identical unlabeled attachment is too strict (coordination reorders legitimately) and label-only comparison is too loose. v1 uses labeled attachment score against the gold tree with a hand-tuned equivalence class for coordination, and shows the parse rather than hiding it, so a suspicious user can argue with the app.

## v1 scope

- 12 hand-picked lines, all exactly 6 words
- Drag-to-reorder, gold-order marker, probability rank strip
- Parse readout as "same meaning / different meaning" plus the changed edge
- No accounts, no scores saved, static JSON on a CDN

## Out of scope

Greek, prose, arbitrary user-entered sentences, meter/scansion analysis, translation.

## Risks & unknowns

Parsers trained on real Latin may behave erratically on permutations no Roman ever wrote — mis-parses could undercut the whole premise; the "poets choose rare orders" claim needs verification across a few hundred lines before it becomes the headline; n! blows up past 7 words.

## Done means

On *arma virumque cano Troiae qui primus ab oris* (windowed to six words), a visitor can drag to the flattest prose order, see it rank in the top 5% by probability, see Virgil's actual order in the bottom 10%, and read one sentence explaining which dependency edge stretched to make that happen.
