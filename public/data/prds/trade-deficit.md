## Overview
A local-only macOS script that turns your iMessage archive into a balance-of-payments statement for every relationship you have. Every "stay in touch" app nags *you* to reach out more. This one inverts the premise and asks who is carrying whom — then lets you run a controlled experiment on the answer. For anyone who has vaguely suspected that a friendship is one-directional and wants the receipt.

## Problem
Relationship effort is invisible because it is spread over years in tiny increments. You remember the good conversations, not who initiated them, and self-report is hopeless — everyone overestimates their own outreach. Meanwhile the entire category of texting-stats apps reports volume ("you sent 8,400 messages 💬"), which measures nothing: volume is high precisely in the threads where you're doing all the work.

## How it works
1. Read the local iMessage DB, bucket messages into *conversations* by splitting on gaps ≥6h.
2. Attribute each conversation's **silence break** to whoever sent its first message. Initiation share per contact is the headline number.
3. Layer three asymmetries: median reply latency in each direction (same-day replies only, to avoid censoring bias), words-per-message ratio, and question-asking ratio (who does the interrogative labor).
4. Combine into a signed balance in [-1, +1] with a bootstrap CI resampling *conversations*, so a thin thread reports "unknown" instead of a dramatic wrong number. EWMA over years shows drift — the slow ones are the interesting ones.
5. Output a static HTML page: one diverging bar per contact, sorted by deficit, sparkline of the balance over time.
6. The ruthless part — **"stop serving"**: pick a thread, and the tool records a 21-day window in which you initiate nothing, then reports whether they reached out and how long it took.

## Technical approach
Python + stdlib `sqlite3` against a *copy* of `~/Library/Messages/chat.db` (requires Full Disk Access). Core tables: `message` (`date` in Apple epoch nanoseconds, `is_from_me`, `text`, `attributedBody`, `cache_has_attachments`), `handle`, `chat_message_join`. Real gotcha: on recent macOS `message.text` is frequently NULL and the content lives in the `attributedBody` NSKeyedArchiver blob — extract with `typedstream`/`plistlib` or fall back to a byte-scan for the `NSString` payload. Contacts resolved via a read-only copy of the AddressBook SQLite so the report shows names, not phone numbers.

Data model: `msgs(contact_id, ts, from_me, n_words, has_question)` → `convos(contact_id, start_ts, initiator, turns)` → per-contact metrics. Latency asymmetry needs a confound fix: someone who sleeps 11pm–7am looks unresponsive, so normalize each side's latency against their own hour-of-day activity histogram before comparing.

## v1 scope
- 1:1 threads only, group chats excluded
- Initiation share + reply latency; skip questions and words for now
- One HTML file with diverging bars, top 25 contacts by message count
- "Stop serving" is just a dated JSON note plus a follow-up command

## Out of scope
WhatsApp/Signal/Instagram ingestion, sentiment analysis, any network call, iOS app, notifications, LLM commentary.

## Risks & unknowns
The output can be genuinely upsetting and it's easy to over-read noise — the CI is a correctness requirement, not a nicety. Deficits often have benign causes (they call, you text). `chat.db` schema shifts between macOS releases. Someone might use this to justify dropping a friend who was going through something.

## Done means
On a real archive it produces a ranked ledger for ≥25 contacts where every balance carries a confidence interval, thin threads are explicitly marked *insufficient data*, latency is timezone/sleep-normalized, and the whole run completes offline with the network cable out.
