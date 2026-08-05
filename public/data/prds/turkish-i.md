## Overview
An explorable website plus a small CLI that maps where real systems *disagree* about whether two strings are the same string. Aimed at anyone who writes a uniqueness check: auth engineers, moderation teams, and the person who just added `.toLowerCase()` to a username field.

## Problem
Every stack folds case slightly differently. `İ` lowercases to `i̇` in Python but `i` in Turkish-locale JS. MySQL's default `utf8mb4_0900_ai_ci` calls `a` and `á` equal. Postgres under a C collation calls almost nothing equal. APFS normalizes filenames; UTS-46 folds domains. Account takeover lives precisely in the gap: your Node validator says the username is free, your MySQL lookup says it belongs to someone else. There are homoglyph checkers and there are Unicode tables, but nobody has assembled the pairwise engine-vs-engine divergence set, which is the only artifact that actually predicts bugs.

## How it works
Type a string. The page shows a column per engine with what each one produces, and highlights every pair of engines that disagree about equality with any candidate in the string's fold class. Below it, the money view: "Validator says distinct, lookup says equal" — a list of concrete strings that would let someone reach an existing account under your selected stack. Pick your stack from dropdowns (Node + Postgres ICU, Python + MySQL ai_ci, Go + SQLite NOCASE) and the site produces a copy-pasteable test-vector file for your test suite.

## Technical approach
Core data: `CaseFolding.txt`, `UnicodeData.txt`, `SpecialCasing.txt`, and `NormalizationTest.txt` from the UCD, compiled at build time into a *preimage* index — invert the fold map so `fold(c) → {all c' folding to c}` (e.g. `k` ← `K`, `K`, `K` U+212A). A string's fold class is the bounded cartesian product of per-character preimages; explosion is controlled by capping preimages per position and prioritizing the ~1,000 codepoints where full folding differs from simple folding, plus the known landmines: dotted/dotless I, final sigma, Cherokee (folds *up*, not down), ligatures like `ﬁ`, and Deseret.

Engines, all runnable in-browser: JS native `toLowerCase`/`toLocaleLowerCase('tr')`; Python `casefold` via Pyodide; ICU full folding via an `icu4x` WASM build; Postgres via PGlite (WASM) with C, `en_US.UTF-8`, and ICU nondeterministic collations plus `citext`; UTS-46/IDNA via `tr46`; APFS/HFS normalization simulated with NFD/NFKC rules. MySQL has no WASM build — ship a precomputed divergence table generated in CI against a real 8.4 container. Front end: Svelte, static, no backend, everything runs locally.

Hard part: keeping the class enumeration honest. Naive cartesian products blow up to millions on a 12-character input; the useful answer is a *ranked* few dozen, ordered by how many engine pairs they split.

## v1 scope
- 200 hand-curated adversarial strings × 5 engines, precomputed
- One HTML table with disagreements highlighted
- No custom input, no stack picker, no CLI

## Out of scope
Homoglyph/confusable spoofing (different problem, well covered), normalization of emoji ZWJ sequences, non-Unicode legacy encodings.

## Risks & unknowns
PGlite collation support may not expose the full libc/ICU matrix in WASM — fallback is CI-precomputed tables for anything unavailable in-browser. Also a real dual-use concern: this hands attackers a takeover wordlist. Mitigation is framing and defaults — lead with the test-vector export and the CI check, not the attack list.

## Done means
Paste `KELVIN` or `ıstanbul` and the page names at least one engine pair that disagrees, with a one-click test-vector download; running the exported vectors against a stock Express + Postgres signup flow reproduces a real duplicate-account insert.
