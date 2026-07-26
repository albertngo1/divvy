## Overview

Magic Comma is a Python steganographic codec and CLI. It embeds a short cryptographic mark into a `.py` file using only choices that an opinionated autoformatter deliberately preserves, so the mark survives `black`, `ruff format`, and code review — the diff looks like ordinary style noise. Built for maintainers who want provenance on contributed code (see Debian's live vote on LLM-authored contributions), for bot authors who want to honestly self-label their output, and for anyone who thinks a formatter's degrees of freedom are a hilarious place to keep secrets.

## Problem

Provenance metadata for source code lives outside the code: commit trailers, PR checkboxes, CI attestations. All of it evaporates the moment someone copies a file, squashes history, or re-exports a patch. Meanwhile projects are being asked to answer "was this written by a generator?" with nothing but vibes. And normal steganography carriers (whitespace, zero-width chars, comment padding) are annihilated by the first `black` run every modern repo does on save.

## How it works

Black's *magic trailing comma* is the rare formatting decision the tool honors rather than imposes: a call/collection/signature ending in `,` is exploded one-element-per-line; without it, Black collapses it if it fits in the line budget. That's a free, formatter-stable bit — but only at sites where **both** forms are legal and the collapsed form actually fits in 88 columns. Magic Comma finds those eligible sites, orders them deterministically, and writes bits.

`magiccomma stamp --key ~/.mc.key file.py` computes `HMAC-SHA256(key, normalized_AST(file))`, truncates to 24 bits, expands with a rate-1/3 repetition code, and writes it across eligible sites. `magiccomma check --key ...` re-extracts, majority-votes, recomputes the expected HMAC from the *current* AST, and reports a match confidence with an explicit binomial false-positive rate: "18/21 carrier bits agree, p = 0.0004."

## Technical approach

- **libcst** for a concrete syntax tree (lossless formatting), not `ast`.
- Site eligibility: for each `Call`, `List`, `Dict`, `Set`, `Tuple`, `Parameters` node with ≥1 element, render both variants and call `black.format_str` on the enclosing statement to confirm the collapsed form survives at line-length 88 and that the exploded form round-trips. Nodes inside `# fmt: off` regions, single-element unparenthesized tuples, and `*args`-terminated signatures are excluded.
- Site ordering: sorted by a stable key of (qualified enclosing scope path, node type, element count) rather than byte offset, so inserting code above a site doesn't rotate the whole codeword.
- Normalized AST for the HMAC: strip all formatting, comments, and docstrings so the mark keys on *semantics* — editing whitespace doesn't invalidate it, editing logic does.
- Decoding is soft: report a confidence, never a boolean.

**The genuinely hard part** is capacity versus fragility. A 500-line module might expose only 15–25 eligible sites, and every real edit adds, deletes, or resizes some. That forces short payloads, erasure-tolerant coding, and a statistical claim instead of exact recovery — plus honest accounting of the null distribution, because unstamped code has trailing commas too, and roughly half of them will "agree" by chance.

## v1 scope

- Trailing-comma carrier only; Black defaults only (88 cols, no preview features).
- Two commands: `stamp`, `check`. Single file in, single file out.
- 24-bit HMAC, 3× repetition, no fancy ECC.
- A `--report` flag printing per-site bit, agreement count, and p-value.

## Out of scope

Other languages. Other carriers (parenthesization, import grouping, string quoting — Black normalizes those anyway). Repo-wide stamping, pre-commit hooks, CI actions. Any claim of tamper-resistance.

## Risks & unknowns

Black's preview style may change magic-comma behavior between releases — pin and test against 3 versions. Ruff's formatter matches Black closely but not perfectly; verify. Files with almost no multi-element collections carry nothing and must fail loudly rather than silently stamp 2 bits. Ethically this is a covert channel: it must be documented as trivially strippable (`ruff format --skip-magic-trailing-comma` erases everything) and framed as opt-in provenance, not enforcement.

## Done means

Stamp a 400-line real-world module, run `black`, `ruff format`, then a human-written 40-line feature patch on top — `check` still reports the correct key match at p < 0.01, and `check` against 200 unstamped PyPI modules yields zero matches at that threshold.
