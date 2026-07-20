## Overview
Sprawl is a small B2B SaaS that turns raw LLM-provider billing exports into a *profiler-style flamegraph of dollars*, attributed down a recursive agent call-tree to the PR, ticket, or engineer that caused it. For eng managers and platform teams at startups now running Cursor/Claude Code/Kimi agent swarms.

## Problem
Agent swarms make cost both huge and unattributable. A single `implement-feature` agent spawns planners, coders, reviewers, and test-fixers, each burning tokens across several models. The monthly Anthropic/OpenAI invoice is one scary number; nobody can say *which* task, PR, or person caused the $400 spike, so budgets get set by panic. Existing dashboards show spend by API key and day — useless when 200 ephemeral agents share one key.

## How it works
You wrap agent invocations with a tiny SDK (or drop in an OTel exporter) that stamps every LLM call with a `trace_id`, `parent_span_id`, and tags (`pr=1423`, `ticket=ENG-88`, `agent_role=test-fixer`). Sprawl ingests these spans plus the provider's usage export, reconciles token counts to real dollars, and renders a flamegraph where **width = cost**. Click a frame to see the sub-agents it spawned and where the money actually went. Anomaly alerts fire when a single trace exceeds a rolling p95 ("ENG-88's swarm cost 6x its median").

## Technical approach
Stack: TypeScript SDK + OpenTelemetry spans, ingest via a Fastify collector into ClickHouse (columnar, cheap group-by over millions of spans). Cost reconciliation joins spans to provider exports (Anthropic Usage & Cost API, OpenAI usage endpoint, Kimi export CSV) by timestamp + model + token count; a nightly job closes the gap between metered and invoiced cost, distributing rounding proportionally. Flamegraph is d3-flame-graph fed a folded-stack aggregation computed in a single recursive CTE over the span tree. The genuinely hard part: reconstructing the parent/child tree when agents run across machines and the SDK isn't wired everywhere — we fall back to time+key heuristics and flag low-confidence attribution instead of lying.

## v1 scope
- One-provider (Anthropic) ingest + manual CSV upload
- SDK for a single language (TS) that stamps trace/parent/tags
- One flamegraph view, cost-weighted, click-to-zoom
- Group-by PR and by tag; CSV export
- p95 anomaly email

## Out of scope
- Real-time streaming (batch hourly is fine)
- Auto-routing / cost *optimization* (we measure, not steer)
- On-prem/self-host tier

## Risks & unknowns
- Provider usage APIs lag 24–72h and don't expose per-request cost, so attribution is proportional, not exact — will customers accept "confident estimate"?
- Instrumentation friction: if teams don't stamp spans, the tree collapses to flat spend.
- Competition from providers adding native tagging (mitigate by being multi-provider + git-aware).

## Done means
A design-partner team pipes one week of real Claude Code swarm activity through the SDK, opens the flamegraph, and correctly identifies the top-3 most expensive PRs — matching a hand-audit of their invoice within 10%.
