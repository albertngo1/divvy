## Overview
Punt is a single- or two-player browser game built around a live arXiv finding: *AI advice suppresses people's willingness to say 'I don't know,' even when the advice is wrong and accuracy is incentivized.* Punt weaponizes that. It's a calibration duel: an AI 'oracle' offers you help on every question, and the scoring rewards you for punting — declining — precisely when you shouldn't trust it. For anyone who suspects they've gotten too deferential to the confident machine.

## Problem
We're quietly outsourcing our epistemic backbone to chatbots. There's no fun, visceral way to *feel* your own overconfidence-under-AI-influence and train it back down. Calibration tools are dry; this makes the failure mode a game mechanic.

## How it works
Each round shows a question with three options plus a fourth: **Punt** ('I don't know'). Before you answer, the oracle chimes in with a fluent recommendation and a confidence bar. Crucially the oracle is *rigged* to be wrong a hidden fraction of the time while sounding identical. Scoring: correct answer +3; wrong answer −4; **a correct Punt (you punt on a question you'd have gotten wrong) +2; a needless Punt (you punt on one you'd have nailed) −1.** Because guessing wrong is heavily penalized, the skill is calibration: trust the oracle when your own prior agrees, punt when it's confidently pushing you somewhere you're unsure. A post-game chart plots your accuracy *with* vs *against* oracle advice — your personal suggestibility number.

## Technical approach
Stack: SvelteKit + a static question bank (start with ~300 hand-tagged trivia items with a known-answer and a designed 'plausible trap' distractor). The oracle text is pre-generated per question (two variants: honest and misleading) via a batch Claude call at build time — no live LLM needed at play time, so it's cheap and offline-capable. Data model: `question{id, options, answer, trap_option, oracle_honest, oracle_misleading, mislead_rate}`. Scoring engine tracks a per-session `withAdvice` / `againstAdvice` confusion matrix; the 'suggestibility index' = P(you switch to oracle pick | oracle wrong) − P(switch | oracle right). The hard part is authoring questions where the *misleading* oracle blurb is genuinely seductive, not obviously bogus — that's the whole game.

## v1 scope
- 30 seed questions with honest/misleading oracle blurbs
- Four-choice + Punt UI, the asymmetric scoring above
- End screen: score + your suggestibility index

## Out of scope
- Live LLM at runtime, accounts, multiplayer netcode
- Adaptive difficulty / question generation on the fly

## Risks & unknowns
- Balancing penalties so punting is viable but not dominant
- Writing traps that fool without feeling unfair
- Replayability with a fixed bank (needs a big, rotating set)

## Done means
I can play 30 rounds, and the end screen correctly reports a higher score for a run where I punted on the questions the oracle lied about than for a run where I obeyed the oracle every time — proving the mechanic rewards calibrated distrust.
