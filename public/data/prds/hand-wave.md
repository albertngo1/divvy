## Overview
Hand-Wave is a daily browser puzzle: you're shown a short, confident, AI-style mathematical proof that contains exactly one invalid inference. Your job is to click the line where it cheats. For puzzle-a-day people, math nerds, and anyone who's watched an LLM 'prove' something with breezy authority.

## Problem
The headline that GPT proved the Cycle Double Cover Conjecture put a question in everyone's mouth: how would I even know if it were wrong? Reading a machine proof is a new literacy nobody's been trained in — the failure mode isn't gibberish, it's one plausible-sounding step that quietly doesn't follow. That specific skill — spotting the hand-wave — has no gym to practice in.

## How it works
Each day: a numbered proof of a small, checkable claim (a divisibility fact, a graph-coloring bound, an inequality). One line is a real fallacy — dividing by a possibly-zero quantity, an off-by-one in induction, asserting the converse, a quantifier swap, an unstated assumption. You read, then click the guilty line. Wrong click reveals a red herring's defense ('this step is actually fine, because…'); correct click reveals the named fallacy and a one-line fix. Wordle-style: one puzzle a day, streak counter, emoji share of how many lines you scanned before nailing it. A 'proof court' hard mode gives you three proofs, only one flawed.

## Technical approach
Fully client-side, date-seeded. The corpus is pre-generated offline, not live-LLM at play time (keeps it deterministic and cheating-proof). Generation pipeline: a small library of proof templates over parameterized true lemmas, plus a catalogue of ~15 canonical fallacy transforms that mutate one step while keeping surrounding prose coherent; an LLM (Claude) polishes the prose to sound uniformly confident so the flaw isn't stylistically obvious, and a symbolic checker (SymPy / a tiny custom verifier per template) confirms the intended flawed step is the *only* invalid one. Data model: each puzzle = {claim, lines[], flawIndex, fallacyName, fix, decoyDefenses[]}. Hard part: guaranteeing uniqueness of the flaw and that the 'valid' lines are genuinely valid — auto-verification is what keeps the puzzle fair.

## v1 scope
- 30 hand-authored puzzles, one flaw each
- Click-a-line UI with reveal
- Daily seed + streak in localStorage
- Emoji share string

## Out of scope
- Live proof generation at play time
- Proof court multi-proof mode
- User-submitted proofs

## Risks & unknowns
Auto-verifying that only one step is wrong is genuinely hard; proofs may be too niche for casual players or too easy for mathematicians; polish LLM might accidentally introduce a *second* flaw.

## Done means
A player loads today's puzzle, reads a coherent proof, clicks a line, and gets correct/incorrect feedback with the named fallacy; the flawed line is verifiably the sole invalid step across all 30 shipped puzzles.
