## Overview
Abstain is a browser trivia game built on an inverted scoring rule: calibrated uncertainty beats confident guessing. An AI 'advisor' offers an answer to every question — often persuasive, sometimes wrong — and your job is to decide whether to trust it, override it, or abstain. It's for anyone who read that AI advice measurably suppresses people's willingness to say 'I don't know' and wants a fun way to fight back.

## Problem
The arXiv finding is blunt: AI advice makes people abstain less, even when the advice is wrong and accuracy is paid for. We're being trained into false confidence. There's no lightweight way to *notice*, let alone *practice*, healthy skepticism toward a fluent machine.

## How it works
Each round shows a question with four options plus an explicit ABSTAIN button. The AI advisor posts a short, confident recommendation. Scoring uses a proper-scoring-rule payoff: correct answer = +3, wrong answer = −4, abstain = +1 (you never lose by admitting ignorance). Over a session you build a calibration profile: how often you followed the AI, and your 'AI-trust delta' — accuracy when you agreed with it vs. overrode it. A daily seeded set gives everyone the same board for a leaderboard and emoji share.

## Technical approach
Static frontend (Svelte) + a tiny serverless scorer. Question bank from OpenTriviaDB / curated CSV with known answers. The advisor is an LLM (Claude Haiku) prompted to answer confidently; a controller deliberately corrupts a tunable fraction (~30%) of advisor answers to a plausible distractor, always phrased with equal confidence — this asymmetry is the whole game. Scoring implements a discretized proper scoring rule; the calibration engine logs (followed_ai, was_correct, abstained) tuples and computes per-player over-reliance and Brier-style calibration. Hard part: making wrong advice *genuinely tempting* and well-distributed, and tuning the abstain payoff so abstaining is optimal only under real uncertainty, not as a dominant strategy.

## v1 scope
- 10-question daily seeded round, four options + ABSTAIN
- LLM advisor with a controlled wrong-rate
- Proper-scoring-rule scoring, no login
- End-of-round card: score, AI-trust delta, calibration blurb
- Shareable emoji result

## Out of scope
- Accounts, persistent history across days
- Multiplayer lobbies
- Voice advisor

## Risks & unknowns
Balancing the abstain payoff so it isn't degenerate; LLM latency/cost per round; ensuring corrupted answers are wrong-but-plausible, not obviously off; question-bank quality and dispute handling.

## Done means
A fresh visitor plays the daily 10, sees an advisor that is confidently wrong ~30% of the time, and finishes with a score plus an 'AI-trust delta' showing their accuracy was higher when they overrode the AI than when they followed it — computed correctly from their logged choices.
