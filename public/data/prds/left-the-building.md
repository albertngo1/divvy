## Overview
Left the Building is a local forensic scanner for AI coding-agent session logs. Claude Code, Codex, Cursor, Aider, Gemini CLI and friends each keep months of unencrypted JSONL/SQLite transcripts under your home directory. Those transcripts contain everything you ever pasted: .env files, prod connection strings, customer rows from a debugging session, a private key you were reformatting. The tool answers one question nobody can currently answer: *which secrets have left this machine, to which vendor, on what date?* For any developer who uses agents at work, and for the security engineer who has to write the incident report.

## Problem
Secret scanners (gitleaks, trufflehog) look at repos. Nothing looks at the largest uncontrolled corpus of pasted secrets on a developer laptop. Worse, the exposure is *retroactive and permanent* — the paste already went to a third-party API months ago, and the local file is still sitting there for the next piece of malware to hoover up. Today the only honest answer to "did we leak that key to a model provider?" is a shrug.

## How it works
1. Discover: walk a registry of known session paths (`~/.claude/projects/**/*.jsonl`, `~/.codex/sessions`, Cursor's `state.vscdb` SQLite, `~/.aider.chat.history.md`, `~/.gemini/tmp`).
2. Detect: stream every user-authored block through a secret-detection pass and record a *finding* with provider, session id, byte offset, and the message timestamp.
3. Reconstruct egress: this is the interesting part. A finding existing in a file does not mean it was uploaded — but the transcript records turn ordering and, for most providers, cache breakpoints and token counts. Rebuild the approximate request body per assistant turn and mark each finding as `sent` (was inside the context window of at least one API call), `local-only`, or `unknown`, with the count of turns it was resent in.
4. Report: a timeline per secret — first paste, last resend, provider, project — plus a deduped revocation checklist grouped by credential type, with the exact rotation doc URL per vendor.
5. Redact: rewrite the JSONL in place, replacing the secret span with `«redacted:sha256:ab12…»` so the transcript still reads correctly and search tools still work, and log the rewrite to an append-only audit file.

## Technical approach
Rust CLI (single static binary, no network by default — that matters for the pitch), `serde_json` streaming over line-delimited JSON, `rusqlite` for Cursor's LevelDB-backed vscdb. Detection is two-layer: ~180 high-precision regexes with checksum validation where the format allows (AWS AKIA + secret-key entropy pairing, Stripe `sk_live_`, GitHub `ghp_`/`github_pat_` with their base62 CRC, JWT header decode, PEM blocks), plus a Shannon-entropy + charset-class fallback over quoted strings assigned to key-ish identifiers. Secret identity across rotations and across files is a SHA-256 of the normalized value, so nothing sensitive is written to the index. Index is SQLite: `finding(hash, kind, provider, session, ts, span, egress_state)`. The genuinely hard part is egress reconstruction — every provider's transcript format differs, none of them explicitly logs "this is what I sent," and context truncation means old turns silently stop being uploaded; the model has to be a documented, conservative approximation that over-reports rather than under-reports. Second hard part: false positives in a corpus that is 90% source code, where every base64 blob looks like a key. Optional `--verify` does a read-only liveness probe (e.g. GitHub `/user`, AWS `sts:GetCallerIdentity`) so the checklist can say *still live* — off by default, loudly.

## v1 scope
- Two providers: Claude Code JSONL and Aider markdown history.
- Twelve detectors, all high-precision, no entropy fallback.
- `scan` prints a table; `report --json` emits findings.
- Egress state is binary: `in-context-at-least-once` vs `unknown`.
- No redaction yet — just `--show-paths` so you can do it yourself.

## Out of scope
- Server-side deletion requests to vendors, browser-based chat UIs, team/fleet aggregation, real-time hooks that block a paste before it happens.

## Risks & unknowns
- Transcript formats are undocumented and change without notice; needs fixture-based tests per provider version.
- The `--verify` mode is a live-credential prober — mis-scoped, it looks exactly like an attack tool. Read-only endpoints only, explicit opt-in, no output of the secret itself.
- Legal-adjacent framing: some users will discover a reportable breach. The report needs to be defensible, so under-claiming is the safe bias.

## Done means
Run `ltb scan` on a laptop with six months of agent history and get, in under 20 seconds, a list like `AWS access key AKIA… — first sent 2026-03-14 to Anthropic, resent in 41 turns across 3 sessions, still live` — and every line of it survives manual verification against the raw transcript.
