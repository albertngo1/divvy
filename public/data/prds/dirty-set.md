## Overview
A local CLI + tiny web view for one investor who writes down *why* they own things. Positions depend on premises; premises are machine-checkable where possible. When a premise goes false, dependency invalidation propagates and every position downstream is marked STALE until you explicitly rebuild — restate the thesis, resize, or sell. Think `zig build --watch` for convictions.

## Problem
Everyone says "know your thesis." Nobody has a mechanism that *notices* when the thesis died. Reasons rot silently: you bought a utility for the rate cut that never came, and eighteen months later you own it for reasons you invented afterward. The failure mode isn't being wrong, it's carrying an invalidated position while quietly editing the story.

## How it works
You keep a plain-text repo:

```yaml
premise: rates_stay_high
  check: FRED:DGS10 >= 4.0 sustained 30d
premise: dc_capex_grows
  check: manual, review every 90d
position: NVDA
  weight: 12%
  depends: [dc_capex_grows, rates_stay_high]
```

A nightly job evaluates every checkable premise. A falsified premise flips to DIRTY and the dirty bit propagates transitively through the DAG (topological sort, same as a build system's dependent-set walk). `thesis status` prints the STALE set ordered by *blast radius* = position weight × premise fan-out. Rebuilding is a command, not a vibe: `thesis rebuild NVDA` opens an editor, records a timestamped entry, and the position goes CLEAN again.

The mischief: rebuilds are diffed. If you edit a premise's *text* rather than admit it broke — "rates stay above 4%" quietly becoming "rates stay above 3.5%" — the tool logs a **goalpost move** and surfaces a lifetime counter. It also tracks *carry time*: median days a position spent STALE before you acted, which is the single most damning number in personal investing and nobody measures it.

## Technical approach
Python 3.12, `typer` CLI, SQLite for history, YAML for the human-edited graph (so it lives in git and `git log` is the audit trail). Data: FRED via `api.stlouisfed.org/fred/series/observations` (free key) for macro series; Stooq or a cached yfinance pull for prices; company fundamentals from SEC `companyconcept` XBRL endpoints (`data.sec.gov/api/xbrl/companyconcept/CIK.../us-gaap/Revenues.json`) for premises like `revenue_yoy > 25%`. Predicate grammar is deliberately tiny: `SERIES op VALUE [sustained Nd]`, `SERIES yoy op VALUE`, plus `manual, review every Nd` which simply expires. Evaluation is a `lark` grammar → AST → pandas resample.

Goalpost detection: on each premise edit, compare normalized old/new predicate — if the operator direction is preserved but the threshold moved toward the current data value, flag it. Prose premises get a similarity check (sentence-transformers, offline MiniLM) so near-identical rewrites are caught.

The genuinely hard part is ergonomics. A premise language rich enough to be honest but cheap enough to actually write is the whole product; too strict and you write nothing, too loose and every premise is `manual`.

## v1 scope
- YAML graph, 3 predicate forms, FRED only
- `thesis check`, `thesis status`, `thesis rebuild`
- Dirty propagation + carry-time stat
- No web view, no broker sync — paste your weights

## Out of scope
Broker APIs, tax lots, backtesting, any buy/sell recommendation.

## Risks & unknowns
You may write six premises and stop. Sustained-condition semantics get fiddly around data revisions (FRED restates). Goalpost detection could feel accusatory enough that you delete the tool — which, arguably, is also a result.

## Done means
Your real portfolio is encoded, a scheduled nightly run has flipped at least one premise DIRTY without you touching it, and `thesis status` correctly named the positions you should have been rethinking.
