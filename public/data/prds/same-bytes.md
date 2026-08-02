## Overview
A diff tool and public index for the one thing nobody inspects: the literal byte string a chat model receives after templating. Paste a model id and Same Bytes renders one canonical conversation through the upstream Hugging Face Jinja template, the `tokenizer.chat_template` baked into a GGUF quant, and the Go template inside an Ollama Modelfile — then tokenizes all three and diffs at the token-ID level. For anyone who runs local models and quietly wonders why the quant feels dumber than the demo.

## Problem
Quantizers hand-copy chat templates. GGUF repos lag the upstream repo by months. Ollama rewrites Jinja into Go `text/template` by hand. The failure modes are silent and specific: a double BOS because `add_bos_token: true` *and* the template emits `<s>`; a missing `<|eot_id|>` so the model never stops; a dropped system role; a trailing-newline shift that moves every subsequent token boundary. None of this throws. It just costs you a few points of quality and a lot of confusion.

## How it works
One fixture conversation — system message, user turn, assistant turn, a tool call, a second user turn. Render it in each runtime's own engine. Tokenize each rendering with that runtime's own vocab. Align the ID sequences and paint the divergence. Classify findings with rules: DOUBLE_BOS, MISSING_EOS, ROLE_TAG_MISMATCH, SYSTEM_DROPPED, WHITESPACE_ONLY_BUT_RETOKENIZES, TOOL_BLOCK_DIVERGENT. Whitespace that tokenizes identically is reported as cosmetic and greyed out.

## Technical approach
Python + FastAPI + a small Go sidecar. HF side: `transformers.apply_chat_template` against `tokenizer_config.json`. GGUF side: the metadata KV block sits at the head of the file, so `HTTP Range: bytes=0-4194303` on `https://huggingface.co/{repo}/resolve/main/{file}.gguf` (following the LFS/CDN redirect and re-issuing the Range) is enough — parse magic, version, `tensor_count` u64, `kv_count` u64, then KV pairs until `tokenizer.chat_template` and `tokenizer.ggml.*` resolve; widen the range and retry if truncated. Never download the weights. Ollama side: registry manifest at `registry.ollama.ai/v2/library/{model}/manifests/{tag}`, pull the layer with mediaType `...image.template`, execute it in the Go sidecar. Tokenize with the Rust `tokenizers` crate binding plus llama.cpp's vocab from the same GGUF KV. Diff via `SequenceMatcher` over ID lists. SQLite table `(repo, file, runtime, sha, findings_json, checked_at)`; a nightly crawl of the top 500 GGUF repos by downloads produces a public "template rot" leaderboard. Hard part: three template languages with genuinely different semantics, and establishing ground truth for which upstream repo a quant descends from (`general.base_model.0.repo_url`, else README parse, else manual map).

## v1 scope
- One fixture conversation, hardcoded
- Two runtimes only: HF upstream vs GGUF metadata
- 20 hand-picked popular models
- Static generated HTML table, no server

## Out of scope
Multimodal templates. Running actual inference. Auto-fixing or opening PRs. LoRA/adapter chat formats.

## Risks & unknowns
Some storage backends may reject Range requests; needs a fallback partial-download path. GGUFs without an embedded template inherit a runtime default — must be modeled, not reported as a bug. Cosmetic diffs will dominate unless the token-ID filter is strict, and a noisy leaderboard is worse than none.

## Done means
Enter a repo id, get a colored token-ID diff within 5 seconds without downloading weights, and the public table names at least one top-100 GGUF whose template genuinely diverges from upstream in a way that changes token IDs — verified by hand against the source repo.
