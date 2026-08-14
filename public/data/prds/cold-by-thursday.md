## Overview
A local analyzer that treats "will I reply to this email?" as a survival-analysis problem. It fits a Kaplan–Meier curve to your own reply latencies, finds where the curve flattens, and stamps every unanswered thread with an honest probability that you will ever answer it. For one person, on one machine, on their own mail archive.

## Problem
Unanswered mail is a guilt reservoir, and every stat anyone quotes about it is biased. "My average reply time is 4 hours" is computed only over mail you *did* reply to — the mail you ghosted is silently excluded, which is exactly the population you care about. Correctly handled, ghosted mail isn't missing data, it's **right-censored** data, and the moment you treat it that way you get a real number: your ghost rate, and the day a thread is provably dead.

## How it works
1. Point it at an mbox/Maildir export.
2. Thread the mail (JWZ algorithm: `Message-ID` / `In-Reply-To` / `References`, subject-normalization fallback).
3. For each inbound message addressed to you, the event is "you sent a message in that thread," the duration is hours-to-reply, and threads you never answered are censored at `now`.
4. Fit Kaplan–Meier on S(t) = "still unreplied." The plateau of S(t) as t→∞ *is* your ghost rate.
5. Fit a Cox proportional-hazards model on covariates and print the coefficients in plain English: "being on Cc rather than To multiplies your reply rate by 0.18," "messages over 400 words: 0.44."
6. Every open thread gets a badge: `P(you ever reply) = 3%`.

## Technical approach
Python, stdlib `mailbox` + `email`, `lifelines` for KaplanMeierFitter and CoxPHFitter, SQLite for the parsed store, one self-contained HTML report via Plotly. Fully offline; no OAuth, no upload.

Data model: `messages(msg_id, thread_id, ts, from, to_role, n_words, is_list, from_me)` → derived `episodes(thread_id, duration_h, observed)`. Covariates: to/cc role, sender's prior reply rate, thread depth at time of arrival, word count, hour-of-day, mailing-list flag.

Three genuinely tricky parts: (a) **threading** — Gmail exports duplicate messages across labels, and list mail breaks `References`; dedupe on `Message-ID` first. (b) **Defining a reply** — people answer by starting a new thread or changing the subject; v1 accepts only in-thread sends and states the undercount. (c) **Left truncation** — a mailbox that starts mid-conversation inflates censoring; restrict the fit to messages received in a window that ends 90 days before now, so every episode has had a fair chance to be observed.

## v1 scope
- One mbox file in, one HTML out
- The KM curve with confidence band, plus one number: your ghost rate
- Top 20 open threads ranked by survival probability
- No archiving, no writing, no email client integration

## Out of scope
- Drafting or sending replies
- Gmail/Outlook API integration
- Multi-account merging
- Any nagging or notifications

## Risks & unknowns
Replies that happened in Slack, SMS, or in person are counted as ghosts — the model is about *email*, and the report must say so on the first line. Small mailboxes give wide CIs. Proportional-hazards assumption probably fails for time-of-day (check with Schoenfeld residuals). And the honest output may be unpleasant reading.

## Done means
Run against a real multi-year mbox, get a KM curve with a visible plateau and confidence band, and have the tool independently assign <5% survival probability to a thread you already know you ghosted.
