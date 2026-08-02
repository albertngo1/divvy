## Overview

Books and Records is a compliance layer for LLM applications at SEC/FINRA-registered firms, insurers, and banks. It treats the **system prompt as a communication with the public** — a template subject to principal review, versioning, and immutable retention — and captures, seals, and produces it on demand alongside the conversations it generated. Buyers: chief compliance officers and heads of AI at RIAs, broker-dealers, and carriers deploying customer-facing assistants.

## Problem

Firms already archive chat transcripts because their vendors made that easy. But a transcript alone is unexplainable at exam time: the examiner asks *why did the bot say that in March*, and nobody can produce the March prompt, the March tool definitions, the March retrieval corpus, or the March model version. Meanwhile the prompt is the thing that actually determines whether every customer got a suitability disclaimer or a performance guarantee. Prompts live in a git repo edited by engineers with no principal approval, no retention, and no immutability — which is precisely the gap Rule 2210 review and 17a-4 retention exist to close.

## How it works

1. **Capture at the gateway, not in app code.** Traffic to model providers passes through a filter that records the exact rendered system prompt, tool/function schemas, retrieved-document hashes, model ID, and sampling params for every request.
2. **Seal.** Each captured bundle is canonicalized, hashed, appended to a per-tenant Merkle log, RFC 3161 timestamped, and written to object storage under compliance-mode retention. Transcripts link to the bundle hash, so any conversation resolves to the exact prompt that produced it.
3. **Review queue.** New prompt versions land in a diff view; a designated principal approves or rejects with comment, producing a signed approval record. A CI check fails the deploy if the prompt hash reaching production has no approval.
4. **Flagging.** Prompt diffs are scanned for regulated language patterns — performance predictions, guarantees, "advice/recommend" verbs, testimonials, missing-disclaimer conditions — each mapped to a rule cite so the reviewer sees *why* it was surfaced.
5. **Exam pack.** One button exports a date-ranged evidence bundle: prompt version timeline, approvals, hash chain proof, and sampled conversations per version.

## Technical approach

- Capture: an Envoy AI Gateway ext_proc filter (plus a drop-in OpenAI/Anthropic-compatible proxy and SDK middleware for teams without a gateway). Out-of-band capture is the whole trust story — engineers cannot forget to instrument it.
- Storage: S3 Object Lock in compliance mode for sealed bundles; Postgres for the mutable index (versions, approvals, flags, links). Merkle log per tenant with periodic published root.
- Flagging: deterministic rule/regex layer first, an LLM classifier second with the rule layer as ground truth, and every flag human-confirmable — the classifier never blocks alone.
- Data model: `prompt_version(hash, rendered_text, tools_json, model_id, params, first_seen)`, `approval(version_hash, principal_id, decision, signature, ts)`, `conversation(id, version_hash, ts)`, `retrieval_doc(hash, source_uri, first_seen)`.
- **Hard part:** proving the sealed prompt is the prompt that actually ran. Gateway attestation plus a nonce echoed by the app SDK; and per-tenant tuning of what counts as a "version" when prompts are templated per user, which otherwise explodes into millions of versions (solve with template extraction: hash the template, store variables separately).

## v1 scope

- Proxy capture for one provider
- Prompt version timeline + diff view
- Manual approve/reject with signed record
- S3 Object Lock sealing and a hash-verify endpoint

## Out of scope

Retention of voice channels, e-comms surveillance, model evals, red-teaming, non-US regimes.

## Risks & unknowns

Whether regulators actually treat prompts as covered records is unsettled — the pitch may have to lead with exam-readiness rather than a mandate; incumbents in e-comms archiving can bolt this on; template extraction is fiddly enough to sink onboarding.

## Done means

A demo app routed through the proxy for 30 days produces, from one conversation ID, the exact system prompt, tool schemas, model version, approving principal, and a verifiable hash-chain proof — exported as a single PDF+JSON evidence pack.
