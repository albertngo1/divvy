## Overview
Bylaws takes Open Policy Agent's idea — decisions made by evaluating declarative policy against facts — and drops it into the pettiest possible domain: shared-household disputes. Roommates, couples, and co-op houses codify their rules once, then let an impartial engine settle 'whose turn is the dishes' with a straight face and an audit trail.

## Problem
Household friction is rarely about the chore; it's about *fairness feeling arbitrary* and nobody remembering what was agreed. The itch: replace 'but you said' arguments with a shared, versioned rulebook and a neutral adjudicator that shows its work.

## How it works
Housemates author policies in a friendly rule language ('dish duty rotates; whoever cooked is exempt tonight; a late chore incurs one make-up chore'). When a dispute arises, someone files a case with facts (who cooked, who's home, last completion dates). The engine evaluates the rulebook against those facts and returns a ruling plus a step-by-step trace of *which rules fired and why*. Rulings are logged; the completion history feeds back as facts for future cases, so rotations actually rotate. Rule changes require a lightweight quorum (everyone taps 'accept') and are version-stamped.

## Technical approach
Stack: a single-page app (Svelte) + a small Node backend + SQLite, deployable on the homelab. Core engine option A: bundle real OPA compiled to WASM and author policies in Rego, evaluating in-browser. Option B (likelier for v1): a purpose-built rules evaluator over a friendlier DSL that transpiles to a decision function — rules are `when <conditions> then <verdict>` clauses evaluated in priority order against a fact object. Data model: `Rule {id, dsl, priority, version}`, `Case {facts_json, ruling, trace_json, ts}`, `CompletionLog {who, chore, ts}`. The reasoning trace is produced by instrumenting the evaluator to record every predicate's truth value. The genuinely hard part is designing a DSL non-programmers will actually write correctly, and surfacing rule *conflicts* (two rules mandate opposite verdicts) as an explainable error rather than a silent last-wins.

## v1 scope
- A textarea rulebook in a fixed `when/then` DSL for a single household
- File a case with a small structured fact form
- Evaluate and show the verdict + which rules fired, in order
- Persist completion history so a rotation rule reads prior cases

## Out of scope
- Real OPA/Rego integration (start with the mini-DSL)
- Accounts, quorum voting, notifications
- Natural-language rule authoring
- Multi-household / mobile app

## Risks & unknowns
- People may find codifying rules more work than just arguing.
- DSL ergonomics vs. expressiveness is a razor's edge.
- A 'fair' machine ruling can feel *more* infuriating when you disagree with it — social risk, not technical.

## Done means
Two housemates can write three chore rules, file a dish-duty case with the night's facts, and get back a verdict plus a readable trace ('Rule 2 fired: Alex cooked → Alex exempt; Rule 1 assigns to Sam') that correctly rotates on the next case because the prior completion was logged.
