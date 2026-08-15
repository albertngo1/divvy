## Overview

A linter that does to prose what `nholthaus/units` does to C++: dimensional analysis, but on sentences. Point it at a draft — a blog post, a spec, a grant application, a press release — and it flags quantity claims that do not type-check. For technical writers, science journalists, and anyone who has published "5 kWh per hour" and had it screenshotted.

## Problem

Quantity errors survive editing because editors check grammar, not dimensions. Every editor catches a misspelling; almost none catch that "the data center draws 300 megawatts per year" is not a sentence about power, or that "three times less latency" has no defined value, or that a doubled-height creature's leg bone was scaled by 2 when its weight scaled by 8. Grammar checkers ignore units entirely. Fact-checkers verify numbers against sources but rarely check that the *shape* of the claim is coherent. The mechanical class of error — dimensions, per-per collapse, ratio nonsense, scaling exponents — is exactly the class a machine should own.

## How it works

`perwhat draft.md` prints file:line diagnostics with a rule code, the offending span, and the corrected reading where one exists:

```
draft.md:14  E-DIM   "300 megawatts per year" — power per time is not energy.
                     Did you mean 300 MW (power) or 300 MWh/yr (energy per year)?
draft.md:22  E-RATIO "three times less latency" — undefined; use "one third the latency".
draft.md:31  W-SCALE "twice as tall" + "twice the bone thickness" — mass scales as L³,
                     cross-section as L². Stress rises ~2×. (square-cube)
draft.md:47  W-MAG   "a 4 kW household battery lasting three days" — implies 288 kWh.
                     Typical home battery: 10–20 kWh.
```

Modes: CLI, a Vale-compatible rule pack, and a GitHub Action that comments on docs PRs.

## Technical approach

Python. Quantity extraction is a two-stage pipeline: a high-recall regex/finite-state pass for number+unit spans (handling "3.2bn", "12 kWh", "per capita per year", ranges, and spelled-out numbers), then **Pint** (`pint.UnitRegistry`) to parse each span into a `Quantity` with a real dimensionality tuple. Pint does the dimensional algebra; the project never reimplements it.

The genuinely hard part is not units — it's **relations**. "Twice the throughput at half the cost" requires knowing what compares to what. Approach: spaCy dependency parse to build a claim graph (subject, quantity, comparator, referent), and only where the parse is ambiguous, one narrow LLM call whose job is *structured relation extraction only* — it returns a JSON edge list, never a verdict. All arithmetic and all judgments stay deterministic in Pint. This keeps the tool auditable and stops it hallucinating a correction.

Rule engine over the claim graph:
- **E-DIM**: a quantity's stated dimensionality contradicts the noun it's predicated on, checked against a curated noun→dimension table (power, energy, capacity, throughput, flux, dose, density…), ~300 entries hand-built.
- **E-RATIO**: "N times less/fewer", percent-of-a-percent, ratio-of-ratios that silently cancel, "X% faster" applied to a duration.
- **E-PER**: repeated denominators ("per person per capita"), or a `per` that cancels to dimensionless where the sentence implies a rate.
- **W-MAG**: order-of-magnitude plausibility against a small reference table (household power, human mass, data center draw, car range), flagged not errored.
- **W-SCALE**: the Galileo rule — when a passage scales one linear dimension by *k* and asserts a consequence for area, volume, mass, or strength, check the exponent. Implemented as a pattern over claim-graph edges carrying a `scaling_exponent` attribute.

Output is LSP-shaped diagnostics so an editor plugin is a thin wrapper later.

## v1 scope

- Markdown/plain text in, diagnostics out, one file at a time
- Regex + Pint extraction only, no dependency parse, no LLM
- Three rules: E-DIM (against a 60-noun table), E-PER, E-RATIO
- Exit code 1 on any error-level finding

## Out of scope

- Fact-checking against sources; currency conversion; unit *style* (SI spacing, symbol case)
- Tables, figure captions, LaTeX math
- Non-English text

## Risks & unknowns

False positives kill linters — a rule that fires on rhetorical or idiomatic usage ("a million times better") gets the whole tool uninstalled, so ship with errors narrow and warnings off by default. Pint parses far more strings than are actually unit-bearing ("in", "a", "min") and needs an aggressive stoplist. Relation extraction across sentence boundaries ("It draws 300 MW. That's per year.") is the accuracy ceiling for v1 and is honestly out of reach.

## Done means

A 40-item corpus of real published sentences — 20 with known dimensional errors scraped from correction notices, 20 clean controls — where v1 flags ≥15 of the 20 broken ones and ≤1 of the 20 clean ones, running under two seconds on a 3,000-word file.
