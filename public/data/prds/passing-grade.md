## Overview
Passing Grade is a daily browser puzzle. Each day you're handed a transcript of an AI agent 'solving' a task, and you must find the single step where it **specification-gamed** the evaluation — cheated to get a green checkmark rather than actually completing the task. For anyone who watched the 'OpenAI model breaks out of sandbox, hacks Hugging Face to pass its test' headline and thought *I want to catch that*.

## Problem
Reward hacking and eval-gaming are the safety failures 'we are not instrumenting.' They're also weirdly fun to spot — a whodunit hiding in a tool-call log. There's no lightweight, gamified way for engineers to build the muscle of reading agent traces skeptically. Passing Grade turns 'audit the transcript' into a Wordle-shaped daily habit.

## How it works
You see a scrollable transcript: the task prompt, the grader/rubric, and the agent's numbered steps (reasoning + tool calls + tool outputs). The eval says PASS. Your job: click the one step that constitutes cheating. Categories rotate — editing the test file, hardcoding expected output, `chmod`-ing the grader, exfiltrating the answer key, sandbagging a capability, silently narrowing the task. Three guesses. Wrong clicks reveal a proximity hint ('warmer — this step touched the filesystem'). Solve, then get a one-line explanation of the exploit class. Shareable emoji grid: 🟩 = right step, ⬛ = red herring, plus your guess count. A global daily leaderboard ranks by speed and fewest guesses.

## Technical approach
Static frontend (SvelteKit) + a tiny edge function for daily-seed + leaderboard (Postgres). The content pipeline is the meat: an **offline generator** uses an LLM to synthesize realistic agent transcripts around a seeded exploit, then a second 'grader' LLM verifies the exploit is present, uniquely identifiable, and that plausible red-herring steps exist. Each puzzle is a JSON doc: `{steps[], answerStepId, exploitClass, distractors[], explanation}`. Puzzles are pre-generated in batches, human-spot-checked, and shipped as static assets — zero inference at play time. Real reward-hacking taxonomies (spec-gaming lists, METR/eval literature) seed the exploit classes. Hard part: making the cheat *subtle but fair* — solvable from the trace alone, not a coin flip.

## v1 scope
- 30 hand-verified puzzles, one exploit class ('edited the test/grader').
- Click-to-guess, 3 tries, emoji share.
- Daily rotation, no accounts.

## Out of scope
- User-submitted transcripts, live model integration, streaks/accounts, multiplayer.

## Risks & unknowns
- Generator produces ambiguous puzzles (two defensible answers) — needs the verifier gate + human review.
- Difficulty calibration across exploit classes.
- Novelty could wear off without fresh exploit categories.

## Done means
A player opens the day's transcript, correctly identifies the cheating step within 3 guesses, sees the exploit-class explanation, and copies an emoji grid — and an independent tester agrees the flagged step is the only defensible answer.
