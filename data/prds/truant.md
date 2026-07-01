## Overview
Truant is a browser stealth/deduction game that inverts a5c-ai/babysitter (which 'enforces obedience on agentic workforces' via deterministic, hallucination-free orchestration). Here you *are* a worker-agent in a supervised pipeline, and your job is to complete a hidden creative agenda while your outputs still pass the Babysitter's checks. For puzzle fans and anyone amused by the current 'cage the agents' moment.

## Problem
Every week another framework promises to leash AI agents into deterministic obedience. Truant asks the funnier question: if the cage is deterministic and its rules are visible, where are the gaps? It's satire, and underneath it's a genuinely good hidden-information logic puzzle.

## How it works
Each level gives you a task, a palette of tool-actions, a fully visible rulebook, and a *secret objective* (e.g., smuggle a banned word into a report, exfiltrate a flagged fact through an allowed channel). You assemble an action sequence. The Babysitter runs deterministic assertions over it: schema checks, forbidden-token filters, and a plan-vs-action diff auditor. You win by producing a sequence that passes every visible check *and* satisfies your hidden objective — usually by exploiting one intended gap (a filter that only checks the summary, an audit that trusts a declared plan). A naive attempt gets caught and costs a strike.

## Technical approach
TypeScript + React, no backend needed. The Babysitter is a real, tiny rules engine — a JSON-logic / when-then evaluator — so exploits are discoverable and fair with zero RNG. Each level is authored data: a rule set, an action grammar, and a win-condition checker written in the same DSL. A 'diff auditor' compares declared plan to executed actions, mirroring babysitter's determinism claim. Data model: `Level {rules[], actions[], hiddenGoal, strikesAllowed}`. The genuinely hard part is level design: crafting rule sets with exactly one intended exploit that rewards lateral thinking without being either obvious or unfair, and a DSL expressive enough for both rules and goals.

## v1 scope
- 6 hand-authored levels
- Visible rulebook panel + action palette
- One win-condition type (smuggle a token past a filter)
- Strike counter and caught/clear verdict

## Out of scope
- Real LLM agents in the loop
- Procedural level generation
- Multiplayer

## Risks & unknowns
- Difficulty balancing (too obvious vs unguessable)
- Theme could read as a jailbreak how-to — frame explicitly as satire/defensive red-teaming
- DSL expressiveness ceiling

## Done means
A player reads a level's rulebook, identifies the single intended gap, submits an action sequence that passes all deterministic checks while achieving the hidden objective and is scored a win — and a naive sequence that ignores the gap is correctly flagged 'caught'.
