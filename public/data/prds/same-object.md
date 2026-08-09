## Overview

A CLI plus GitHub Action that answers one question mechanically: *did this diff change any compiled behavior?* It builds the base and head revisions, canonicalizes the emitted machine code per symbol, and reports a per-function verdict — IDENTICAL or CHANGED. For anyone who reviews or submits large refactors: renames, extract-method sweeps, file moves, formatter runs, dependency-injection rewrites.

## Problem

"It's just a refactor" is an unverifiable claim, so reviewers do one of two bad things: read all 4,000 lines at full attention, or rubber-stamp it. The real behavior change — a `<` quietly becoming `<=` on line 2,317 — hides in the noise. Decompilation projects like sotn-decomp already solved this for themselves with *matching* builds (your C must compile to byte-identical assembly). Nobody has pointed that discipline at ordinary code review.

## How it works

`same-object check main..HEAD` builds both revisions into scratch dirs, extracts every function symbol from the resulting object files, canonicalizes each one, hashes it, and prints a table. The Action posts that table and labels the PR `no-op: 87/91 functions`. The reviewer reads only the 4 that changed. Symbols the tool couldn't build are listed explicitly as UNKNOWN — never silently counted as clean.

## Technical approach

Go CLI driving `clang` and `llvm-objdump`; SQLite for run cache (`runs(rev,target)`, `symbols(run_id,name,canon_hash,cfg_hash)`).

Determinism prep: `SOURCE_DATE_EPOCH`, `-ffile-prefix-map=$PWD=.`, `-fdebug-prefix-map`, `-no-canonical-prefixes`; strip `.debug_*` and `.comment` before comparison.

Canonicalization per symbol, from `llvm-objdump --disassemble --reloc --no-show-raw-insn`:
- rewrite compiler-generated local suffixes (`foo.constprop.0`, `bar.isra.1`) to positional slots
- replace relocation targets with `(symbol, addend)` pairs instead of link-time addresses
- renumber string-literal and jump-table labels by content hash, and sort `.rodata` by content
- drop DWARF line tables entirely

Hash the canonical instruction stream with SHA-256. On mismatch, fall back to a CFG hash: split into basic blocks, hash each block's canonical instructions, hash the edge set — this absorbs pure block reordering. Anything still differing is reported as CHANGED with a Myers diff of the instruction stream.

The genuinely hard part is that inlining and register allocation decisions can hinge on source line numbers and symbol ordering, so a rename can perturb `-O2` output without changing semantics. Mitigation: the strong claim is made at `-O0` (stable, semantics-faithful); `-O2` runs as an advisory pass, and symbols that differ only at `-O2` are labeled *inlining-sensitive* rather than failing the check.

## v1 scope

- C/C++, clang only, x86-64 ELF, one build target
- `-O0` comparison only; no CFG-hash fallback, no register-permutation unification
- CLI prints a table; no Action, no PR label
- verdicts limited to IDENTICAL / CHANGED / UNKNOWN

## Out of scope

LTO, cross-compilers, Rust/Go/Python/JS backends, Mach-O and PE, monorepo build-graph integration, incremental caching across CI runs.

## Risks & unknowns

Too many spurious CHANGED verdicts destroys trust in one afternoon. Inverse risk: reviewers over-trust a green label and skip a genuine behavior change in a symbol the tool listed as UNKNOWN — the UI must make UNKNOWN feel loud, not neutral. Build time doubles.

## Done means

On a real C repo, take a commit that only renames locals and extracts a static helper: the tool reports 100% IDENTICAL. Then flip one `<` to `<=` in that commit and re-run: it reports exactly one CHANGED symbol, named correctly, and nothing else.
