## Overview
Muddle is a build-step / CLI that applies behavior-preserving transforms to your source so that LLM coding agents (and scrapers that ingest your repo) understand it *worse*, while humans-with-a-sourcemap and the runtime still get identical behavior. For devs who want to publish or ship code without handing frictionless comprehension to every crawler.

## Problem
The HN-surfaced arxiv minimal-pair study ('Does code cleanliness affect coding agents?') shows the obvious-in-hindsight result: cleaner code → better agent performance. Run that arrow backwards and you have a lever. People increasingly want to publish code that runs but that an ingesting model can't trivially explain, refactor, or lift — an artful, defensive opposite of prettier/gofmt.

## How it works
You point Muddle at a directory. It parses to an AST and applies guarded transforms: misleading-but-valid identifier renaming (a function that sums is named `normalizeCursor`), control-flow flattening, insertion of semantically-dead-but-plausible branches, expression splitting, and reordering of provably-independent statements. Every transform is gated by an equivalence oracle — your existing test suite plus an optional differential fuzz — and any transform that changes behavior is refused. It emits a `muddle score`: the drop in a local small model's next-token accuracy / perplexity on the transformed file vs the original.

## Technical approach
JS/TS via Babel or ts-morph; Python via libcst. Comprehension delta measured by running transformers.js or a local code model and computing token-level cross-entropy on an 'explain this / predict next token' probe over original vs muddled. Data model: a reversible sourcemap so you can `unmuddle` for maintenance. The genuinely hard part is *guaranteeing* semantic equivalence under aggressive transforms — leaning on the test suite as oracle, a mutation/differential harness to catch gaps, and a conservative refusal policy when coverage is thin.

## v1 scope
- One language (JS).
- Three transforms: misleading rename, dead-branch insertion, independent-statement reorder.
- Require a passing test suite as the equivalence oracle (refuse if tests fail).
- Print one before/after next-token-accuracy number from a single local GPT-2-code model.

## Out of scope
- Size-minification / classic obfuscation.
- Defending against a determined human reader.
- Multi-language, CI plugin, IDE integration.

## Risks & unknowns
- 'Equivalence' is only as strong as your tests — thin coverage means real breakage risk.
- Local-model perplexity is a weak proxy for a frontier agent's comprehension.
- Ethically gray; framing stays strictly defensive (your own code, your own repos).

## Done means
Run `muddle src/` on a sample JS project: the test suite still passes, `unmuddle` restores byte-identical originals, and the local model's next-token accuracy on the muddled file measurably drops vs the original.
