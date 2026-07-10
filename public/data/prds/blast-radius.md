## Overview
Blast Radius is a B2B security scanner for teams shipping LLM agents. Feed it an agent's tool/MCP configuration and it computes the *reachability graph* of a compromise: if an attacker gets one injected instruction into the model, which tools fire, which data stores they touch, and what leaves the building. For AppSec teams, platform engineers, and founders wiring Claude/GPT agents to internal tools who currently have no idea how bad an injection could get.

## Problem
Everyone is bolting MCP servers and function-calling onto agents (see: Aura, Perfai, Constellation Gate). Each tool looks fine alone. The danger is the *combination* — a 'read file' tool plus a 'send email' tool plus a 'fetch URL' tool is an exfiltration chain, and no one is modeling that. Prompt injection is the #1 LLM risk and the current answer is vibes. Security teams can't reason about an attack surface they can't see.

## How it works
You point Blast Radius at your config: an MCP server manifest, an OpenAI/Anthropic tool-schema JSON, or a repo it introspects. It classifies each tool by capability tags (reads-secret, writes-external, network-egress, executes-code, mutates-prod) using the tool's schema + description + a lightweight LLM classifier. It builds a directed graph where an edge means 'output of A can flow into input of B,' then runs reachability from every untrusted-input source (a fetched URL, a user message, a retrieved doc) to every egress/sink. Output: a ranked list of injection chains ('untrusted web page → read `~/.aws/credentials` → POST to attacker URL: CRITICAL'), a visual blast-radius graph, and concrete mitigations (require confirmation on this edge, taint-tag this tool, drop this permission).

## Technical approach
CLI + web dashboard. Ingest adapters for MCP (`tools/list`), OpenAI/Anthropic tool schemas, LangChain tool registries. Capability classification: rules on schema shape + an LLM pass (Claude Haiku) with a fixed taxonomy, cached by tool hash. Graph in NetworkX / a Postgres edge table; taint analysis is a reachability search from tainted-source nodes to sink nodes with a configurable trust boundary. Findings scored by a CVSS-like rubric (reach × sensitivity × egress). SaaS: GitHub App that scans PRs touching agent config and comments the delta ('this PR opens a new CRITICAL chain'). Hard part: modeling data flow *through* the model — you must conservatively assume any tainted content in context can influence any subsequent tool call, then let users annotate isolation boundaries to prune false positives.

## v1 scope
- One ingest format: MCP `tools/list` manifest
- Rule + LLM capability tagging over a fixed taxonomy
- Reachability from 'untrusted content' sources to 'egress' sinks
- Static HTML report with the graph and ranked chains

## Out of scope
- Runtime/live monitoring of agent traffic
- Auto-remediation / policy enforcement
- Non-MCP frameworks at launch

## Risks & unknowns
- False-positive fatigue if every 2-tool combo looks scary
- Will the LLM classifier mislabel bespoke tools? (Needs override UI.)
- Buyers may not yet feel the pain enough to pay — timing bet

## Done means
Given a sample MCP config with a fetch tool, a secrets-reading tool, and an email tool, the scanner outputs the exact three-hop exfiltration chain ranked CRITICAL, and reclassifies it to LOW once the user marks the email tool as human-confirmation-gated.
