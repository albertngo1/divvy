## Overview
A leading-indicator watcher for AI model releases, built for someone trading Polymarket/Kalshi/Metaculus questions like "Will <lab> ship <model> before <date>." It converts public engineering exhaust into a dated, backtested hazard estimate.

## Problem
These markets resolve on an announcement, which is the *last* step of a months-long public engineering trail. Weights don't appear from nowhere: inference engines must learn the architecture, tokenizers land, serving catalogs get entries, certificates get issued. Everyone trades the blog post; nobody systematically watches the plumbing.

## How it works
A ladder of watchers, ordered by typical lead time:
1. **Inference-engine support PRs** — new model classes under `vllm/model_executor/models/`, new arch strings in llama.cpp's `convert_hf_to_gguf.py` registry and `src/llama-model.cpp`, new `transformers/models/<name>/` dirs, MLX ports. Often authored by the lab's own employees weeks ahead. Author's commit-email domain and HF org membership are the credibility weight that filters speculative community PRs.
2. **Hugging Face Hub** — `api/models?author=<org>&sort=createdAt`, repos flipping gated→public, `config.json` commits on empty repos, model-card 404→200.
3. **Serving catalogs** — OpenRouter model list, Bedrock/Azure catalog APIs, and anonymous codenames appearing in LMArena battles.
4. **Paperwork** — crt.sh certificate transparency for new product subdomains, USPTO TSDR filings.

Each hit becomes an event `(org, candidate_name, signal_type, evidence_url, first_seen)`. Events are matched to open market questions by org + fuzzy name, and scored with a survival model: P(release before date | first signal at t).

## Technical approach
Python + SQLite + ntfy push. Clone the watched repos locally and poll `git log --diff-filter=A` rather than burning GitHub API quota. The backtest is free and is the whole edge: `git log` over vLLM/llama.cpp/transformers yields exact first-commit dates for ~200 historical models, and HF `createdAt` yields the release date, so you can fit a log-normal lead-time distribution per signal type per org and honestly measure the false-positive rate. Live prices via the Polymarket CLOB API for expected-value ranking. Hardest part is entity resolution — internal codename (`kimi-k3-preview`, `qwen3-next`) to eventual market-question wording — plus deduping the same release across four signals.

## v1 scope
- Three local repo clones, polled hourly.
- One regex-ish rule: new file under a model directory + org whitelist.
- Print `org / candidate / url / date` and push to ntfy. No markets, no model.

## Out of scope
Auto-trading, position sizing, options, anything outside AI-release questions.

## Risks & unknowns
These markets are thin, so the edge may not be monetizable at size. Edge decays as others watch the same repos. Some labs land support PRs *after* announcing. Scraping arena/catalog endpoints has ToS friction; the git-based signals do not.

## Done means
Replaying repo history from 2025-01-01 to today, the tool produces a signal ≥3 days before public announcement for ≥60% of tracked releases, with a published median lead time per signal type and a counted false-positive rate — and it fires live on the next real release.
