## Overview
Preflight is a local transparency proxy + menubar meter for developers who use agentic coding CLIs (Claude Code, Grok CLI, OpenCode, etc.). It answers the HN-front-page question — 'this tool sends 33k tokens before reading the prompt' — for *your* setup, live.

## Problem
Agent CLIs silently prepend huge system prompts and tool schemas to every request. You pay for those tokens and they shape latency and quality, but they're invisible. The recent wire-level analyses were one-off gists; there's no always-on, tool-agnostic way to watch your own overhead and catch when an update balloons it.

## How it works
You point your CLI's API base URL at Preflight's local proxy (or trust its mitmproxy CA and run transparently). Every outbound request to an LLM endpoint is intercepted, the JSON body is parsed, and each message is tokenized and categorized: system prompt, tool/function schemas, conversation history, files/context, and finally *your* actual prompt. The menubar shows a live sparkline of pre-prompt overhead and a percentage 'signal-to-noise' (your prompt ÷ total). Click for a per-request waterfall and a 'biggest offenders' list of the fattest tool schemas.

## Technical approach
mitmproxy in reverse-proxy or transparent mode with a Python addon hooking `request`. Match hosts `api.anthropic.com`, `api.openai.com`, `api.x.ai`, `generativelanguage.googleapis.com`. Tokenize with the right tokenizer per provider — `tiktoken` for OpenAI, Anthropic's token-counting endpoint or a local heuristic for Claude, tekken for others. Categorization keys off role fields, `tools`/`system` blocks, and content-part types. Data model: rolling SQLite of {ts, host, model, catTokens{}, promptTokens}. Menubar via `rumps` (macOS) or a tiny Tauri tray. Hard part: streaming request bodies and matching them to responses without adding latency, plus tokenizer drift across model versions.

## v1 scope
- mitmproxy addon that logs categorized token counts for Anthropic + OpenAI
- CLI table output: overhead vs prompt per request
- One rolling total in a macOS menubar item

## Out of scope
- Blocking/trimming requests (read-only observer)
- Non-LLM traffic, response-token accounting, cost dollarization
- Windows/Linux tray in v1

## Risks & unknowns
- TLS interception friction (users must trust a local CA)
- Providers may batch/encrypt bodies unexpectedly
- Tokenizer accuracy for Claude without an official local tokenizer

## Done means
With Preflight running, launching a real coding CLI and typing one short prompt shows a menubar number and a CLI breakdown correctly attributing the bulk of tokens to system+tools, matching a manual count within ~5%.
