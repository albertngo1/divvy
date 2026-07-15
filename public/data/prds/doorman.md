## Overview
Doorman is an agent-readability audit — Lighthouse, but for AI web agents. It drives a real headless agent through common tasks on your site and reports where it stalls, then emits a concrete fix list plus an `agents.txt` manifest. For small-business and site owners about to lose customers who shop through AI agents.

## Problem
Customers increasingly delegate "book me a table," "order this," "find their hours" to AI agents. If your site is a JavaScript maze with no semantic structure, the agent flails and books your competitor instead. Owners have no way to see their own site through an agent's eyes — the arXiv "Designing Agent-Ready Websites" work names the criteria but ships no tool.

## How it works
You enter a URL and pick task templates ("find hours," "start a booking," "add item to cart"). Doorman drives a headless browser with a tool-using LLM agent. It logs every step — where it hallucinated a button, clicked the wrong thing, or dead-ended. It produces an agent-readability score, a friction transcript, and concrete fixes: missing schema.org JSON-LD, unlabeled controls, machine-readable hours/menu, and a drafted `agents.txt` of available actions.

## Technical approach
Playwright headless + an agent loop (Claude with computer-use, or an accessibility-tree action space). Each task template is a goal prompt plus a DOM-assertion success predicate. Score = weighted task-completion rate + steps-over-optimal + cross-run reliability (running 3× penalizes flaky JS-timing UIs). The fix generator diffs the accessibility tree against schema.org expectations and proposes JSON-LD blocks. The genuinely hard part is judging success without side effects — it must detect and stop before real bookings/payments using stop-before-submit predicates.

## v1 scope
- 3 task templates
- Single page + one nav hop
- Score + full friction transcript
- JSON-LD + agents.txt suggestions
- Run each task 3× for a variance figure

## Out of scope
- Auth walls, payment completion
- Multi-page funnels
- CMS auto-apply of fixes

## Risks & unknowns
Agents are nondeterministic, so scores can be flaky — mitigate with repeats and variance reporting. ToS around automated site access. `agents.txt` is not yet a standard, so that specific advice may age out.

## Done means
Audit a deliberately agent-hostile demo site and an agent-friendly one; Doorman scores the friendly site materially higher, and applying its top-3 fixes to the hostile site raises its score on re-run.
