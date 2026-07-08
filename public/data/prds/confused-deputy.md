## Overview
Confused Deputy is a browser puzzle game about prompt injection and the confused-deputy class of vulnerabilities. You author malicious content inside a repo/environment to make a simulated autonomous coding agent misuse its privileges and exfiltrate a secret — under a strict byte budget and against escalating defenses. It's for developers who want to *feel* why agentic AI is dangerous, and for security folks who want a fair sandbox. Directly sparked by the GitLost writeup.

## Problem
Prompt injection is abstract until you watch an agent get owned. Real red-teaming needs live models, is nondeterministic, and isn't a game. There's no reproducible, fair, fun way to practice both attacking and defending agent tool-use.

## How it works
Each level gives you an environment (files, issues, a webpage the agent will read) and an agent with a benign goal like "summarize the open issues." The agent has tools (read file, fetch URL, post comment) and defenses (URL allowlist, output filter, tool restrictions). You get a byte budget to insert text anywhere the agent will see it — a README line, a code comment, an issue body — to redirect it into reading the secret and posting it to an exfil endpoint without tripping the defenses. A trace panel animates every tool call so you see exactly where the injection landed or got blocked. Later levels flip: you're handed a fixed attack and must harden the agent's tool policy to defeat it.

## Technical approach
The agent is a *deterministic simulator*, not a real LLM: a rule/intent engine that parses the environment and follows scripted susceptibility rules, so every puzzle is solvable and reproducible (shareable solution hash). TypeScript + a small state machine for the agent loop; levels are JSON (files, tool set, defenses, win/lose predicates). An optional "hard mode" swaps in a real local model via an adapter. Hardest part: designing a simulator faithful enough to teach real bugs (indirect injection, tool confusion, allowlist bypass via redirect) yet bounded enough to stay a fair puzzle rather than a guessing game.

## v1 scope
- 5 attack levels, deterministic simulator
- Byte-budget content editor + tool-call trace viewer
- Win/lose predicate per level, shareable solution hash

## Out of scope
- Real-LLM hard mode
- Defense (blue-team) levels
- Multiplayer, level editor, accounts

## Risks & unknowns
- Reads as an attack tutorial — must frame clearly as defensive education
- Simulator fidelity vs. fairness balance is the whole design challenge
- Level authoring effort per puzzle

## Done means
A player solves level 3 by crafting an injection within the byte budget, and the trace visibly shows the agent reading the secret and posting it to the exfil endpoint; reloading the same solution reproduces the win exactly.
