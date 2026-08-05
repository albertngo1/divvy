## Overview
Green Bar is a watch-mode test runner for documents. You write assertions about your own text — continuity, terminology, structure, tone — and it runs them on every save, printing failures with line numbers like a stack trace. For novelists, technical writers, and anyone maintaining a document longer than their memory.

## Problem
LanguageTool checks grammar. Nothing checks *your* invariants. Halfway through a novel you stop remembering whether Mara's eyes are green, whether the phone exists before chapter 4, whether you already used "the light was wrong" twice. In docs: whether every CLI flag mentioned still exists, whether you said "folder" in one page and "directory" in the next. The current tool for this is rereading, which nobody does.

## How it works
A `prose.test.yml` sits next to the document. Two assertion kinds:

- **Deterministic**: banned phrases, required glossary terms, sentence length ceilings, "every H2 has at least one paragraph", grade level under 9, no repeated 6-gram across the file.
- **Semantic**: natural language, judged by a model over retrieved spans — `mara_eyes: "Mara's eyes are described as green wherever they are described"`, `no_phone_before_ch4: "no scene before chapter 4 mentions a telephone"`.

The runner splits the doc into scenes/sections, embeds them, retrieves candidate spans per semantic assertion, and asks a judge model for a boolean plus the offending span. Output is TAP-style in the terminal and diagnostics over LSP, so it lights up inline in VS Code or Neovim like flycheck. Watch mode re-runs only assertions whose retrieved chunks changed.

## Technical approach
TypeScript CLI. Markdown parsed with remark/mdast (keeps byte offsets for accurate diagnostics), sentences split with wink-nlp. Embeddings from bge-small via transformers.js, stored in sqlite-vec alongside a chunk table. Judge: Claude Haiku with a structured-output tool returning `{pass, span_start, span_end, why}`, temperature 0. Readability and grammar delegate to retext + a local LanguageTool HTTP server.

Two genuinely hard parts. **Stable chunk identity**: line offsets shift on every edit, so caching by line range invalidates the whole file after a one-word change. Use content-defined chunking (rolling hash on sentence boundaries) and key the cache on `hash(chunk_text) + hash(assertion_text)`. **Determinism**: a flaky assertion turns the green bar into noise. Track per-assertion flip history; any assertion that changes verdict on unchanged text gets auto-quarantined and reported separately, exactly like a flaky-test list.

## v1 scope
- Single markdown file, one config file
- 6 deterministic assertion types
- 1 semantic assertion type, sqlite cache
- `green --watch` printing pass/fail + line numbers
- `green init` reads the doc and proposes 10 assertions

## Out of scope
Multi-file projects, .docx/PDF input, autofix, LSP integration, collaborative anything.

## Risks & unknowns
Judge flakiness destroying trust; cost of a cold full-book run (mitigated by chunk caching, but a 120k-word novel is still a real first bill); assertion-authoring friction — if `green init` proposals are bad, nobody writes their own.

## Done means
On a 60k-word manuscript: change one character's eye color in chapter 12, hit save, and the bar goes red within 3 seconds naming that exact line. Revert, it goes green. Re-run twice on unchanged text and both runs agree.
