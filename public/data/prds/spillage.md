## Overview
Spillage is a local, offline forensic scanner for your own LLM conversation history. Feed it your official data export (OpenAI conversations.json, Anthropic/Google exports, or a scrapemychats dump) and it produces an 'exposure report': a severity-ranked timeline of every secret, credential, and personal detail you've pasted into a model over the years. For anyone who has ever debugged with a real .env open in another tab.

## Problem
People paste API keys, connection strings, prod logs, proprietary source, and real names/addresses into chatbots constantly. Those turns now live on vendor servers — and, as the recent HN discussion around chat-export tooling shows, in local dumps too. Nobody audits what they've leaked. There's no 'git-secrets for the things you told an AI.' The blast radius is invisible until a key you forgot about turns up in a breach.

## How it works
You run `spillage scan ./export/`. It parses every user turn, then runs three detectors: secret detection (gitleaks-style regexes + Shannon-entropy on high-entropy tokens), PII named-entity recognition (names, emails, addresses, SSNs, card numbers), and pasted-code fingerprinting (language + rough provenance). Output is a local HTML/Markdown report: a chronological leak log ('2025-03: 14 live-pattern API keys, 3 AWS-shaped'), each finding ranked by severity with the surrounding turn redacted for context, a de-duplicated 'unique secrets' list, and an action checklist ('rotate these', 'this address appears 40×'). Everything runs offline — no key is ever validated over the network. Optional `--redact` emits a scrubbed copy of the export.

## Technical approach
Python CLI. Pluggable parsers for each vendor's export schema normalize to a common model: `(conversation_id, timestamp, role, text)`. Detection layers: detect-secrets/gitleaks rulesets for structured secrets, entropy thresholds for unstructured tokens, Microsoft Presidio or a small local spaCy NER for PII, and guesslang/heuristics for code blocks. Findings carry `(type, severity, span, redacted_context)`. Offline-by-default is the entire trust story and is enforced by shipping with no network client. Hard part: precision/recall on secrets without a cloud model (regex misses novel key shapes; entropy over-flags base64 UI blobs), and keeping up with drifting vendor export formats.

## v1 scope
- OpenAI + one other export parser
- Secret detection (regex + entropy) and card/email/SSN PII
- Single self-contained HTML report with severity ranking
- `--redact` scrubbed-copy output

## Out of scope
- Live monitoring / browser extension
- Any network calls, including key-validity checks
- Automatic key rotation or vendor API integration

## Risks & unknowns
- False-positive rate on entropy detection could bury real findings
- Export formats change; parsers rot
- Users may not know how to obtain their export

## Done means
Given a sample export containing three planted secrets and two PII items, Spillage produces a report listing all five, ranked, with redacted context, and makes zero network connections during the run.
