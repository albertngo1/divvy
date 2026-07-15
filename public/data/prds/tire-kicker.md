## Overview
Tire Kicker is a B2B QA service that tests whether autonomous AI shopping agents can actually complete tasks on your website. For e-commerce and SaaS teams staring down agentic-commerce traffic (ChatGPT Operator, Claude computer-use, Perplexity buy, and the wave of "Agentcard"-style buyers on Product Hunt), it answers a question their existing analytics can't: *when a real AI agent tries to buy from us, where does it fail?*

## Problem
Sites were built for human eyes and mouse habits. AI web agents choke on things humans breeze past: a checkout button that's an unlabeled `<div>`, a hover-only mega-menu, a captcha wall, a coupon field that eats focus, a "continue" that scrolls off-screen. Today teams find out about these failures anecdotally, or never — the agent just abandons and nobody logs why. Static "agent-readiness linters" score your HTML but don't prove a task completes end-to-end.

## How it works
You give Tire Kicker a URL and a task list ("add a size-M hoodie to cart and reach the payment step", "sign up for the free trial", "find and apply promo SAVE10"). We spin up N real LLM browser agents with different backbones and prompting styles, run each task 5–10 times, and record everything: DOM snapshots, screenshots per step, the agent's chain-of-thought, and where it gave up. Output is a scorecard (task success rate per agent), ranked failure clusters ("3/4 agents couldn't find the size selector"), and a replayable trace with the offending element highlighted plus a concrete fix ("add `aria-label`, expose as a real button").

## Technical approach
Stack: Playwright + `browser-use`/an in-house agent loop, backed by Claude and a couple of open models for backbone diversity. Each run is a container with a fresh profile; we capture a step log `{action, target_selector, screenshot, reasoning, dom_hash}`. Failure clustering: embed each stuck-step's DOM context + reasoning, DBSCAN to group recurring blockers across runs. Fix suggestions come from a rules layer (missing labels, focus traps, non-semantic controls) plus an LLM pass over the cluster. The genuinely hard part is a stable success oracle — deciding a task "completed" without brittle selector assertions; we use a vision+DOM judge model checking for goal-state signals (order-summary present, confirmation text) and require agreement across two judges.

## v1 scope
- Single URL, up to 5 predefined task templates
- 3 agent backbones × 5 runs each
- HTML report: success matrix, top-5 failure clusters, annotated screenshots
- One-line fix suggestion per cluster

## Out of scope
- Real payments (stop at the payment step; test cards only)
- CI/CD integration, scheduled monitoring
- Auth-walled flows beyond a provided test login

## Risks & unknowns
- Agent flakiness could masquerade as site bugs — need enough runs + variance reporting to separate signal.
- Sites may block automation; we respect robots and require customer authorization.
- Judge model false-positives on "success."

## Done means
Given a demo Shopify store with two deliberately broken controls, Tire Kicker reports <50% success on the affected tasks, names both broken elements in its top failure clusters, and its suggested fixes, when applied, raise success to >90% on re-run.
