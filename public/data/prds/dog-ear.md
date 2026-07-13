## Overview
A shared-reading league. A group subscribes to the same longform pieces; days later the app surprise-quizzes each member with LLM-generated questions. You score on what you *retained*, not what you read, and points decay over time. For book-club types who suspect they forget everything.

## Problem
"How to read more books" is the wrong target — you forget ~90% within a week. Reading is passive and unaccountable; the only things people compete on are volume and streaks, which reward skimming. Nobody competes on the thing that matters: retention. (The arXiv "designed forgetting" line is exactly the enemy.)

## How it works
A group picks a reading (paste a URL or upload text). Everyone reads on their own time and marks "done." The app then fires surprise quizzes at spaced intervals — 1 day, 1 week, 1 month later — each an LLM-generated set of 3–5 comprehension questions drawn from the source. You answer cold, no re-reading allowed. Scoring rewards durability: a correct answer at the 1-month interval is worth far more than at 1 day. The leaderboard ranks the group by retention, not pages read.

## Technical approach
Next.js web app. Ingest article via a Readability/Mercury parser → clean text. Quiz generation with Claude (claude-sonnet-5): chunk the source, prompt for a mix of factual + inference questions with a rubric answer key. Grade free-text answers with an LLM judge scoring 0–2 against the key. Schedule quizzes via a queue/cron (Supabase cron or a small worker) firing email/push at each interval. Data model: `readings`, `memberships`, `quiz_instances` (reading × user × interval), `responses`, `scores`. Hard part: generating questions that test genuine comprehension rather than trivia, grading free text fairly, and preventing re-reading during a quiz.

## v1 scope
- one group, paste one article
- a single quiz fired 24h after "done"
- 3 LLM-generated questions, LLM-graded
- a simple two-column scoreboard

## Out of scope
Multi-interval spaced scheduling, push notifications, mobile app, hard anti-cheat lockdown, whole-book (vs article) support.

## Risks & unknowns
LLM question quality and grading fairness; trivially cheatable by re-reading/screenshots; whether being quizzed feels playful or like homework; per-quiz cost.

## Done means
Two people read the same pasted article, each receives 3 auto-generated questions a day later, their free-text answers are LLM-graded, and the higher-retention reader visibly tops a two-person leaderboard.
