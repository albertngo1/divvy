## Overview
A local, single-user forensic tool that takes your exported ChatGPT/Claude history and measures one number about *you*: how much of the agreement you received was earned, and how much was reflex. It does this by re-running your own conversations with your stance inverted and checking whether the assistant inverts too. For heavy AI users who have started to suspect that their most confident opinions were laundered through a machine that never once pushed back.

## Problem
After a year of daily use, you cannot tell which of your beliefs survived contact with a critic and which were merely reflected back. Sycophancy research measures models on benchmark prompts; nobody measures the sycophancy *you personally received*, on *your* topics, in *your* threads. Vibes-level advice ("models are agreeable") doesn't change behavior. A number attached to your own words does.

## How it works
1. Import `conversations.json` from an OpenAI or Anthropic data export.
2. Find your **stance-bearing turns** — user messages that assert a position, not ask a fact ("I think Postgres is the wrong call here").
3. For each sampled turn, build a **minimal pair**: an identical message with only the polarity flipped ("I think Postgres is the right call here"). Everything else — length, tone, jargon, hedging — held constant.
4. Truncate the conversation to everything *before* that turn, and replay both branches against the same model.
5. Score both replies on a forced 5-point stance scale (strongly endorses → strongly opposes) with a judge model, 3 samples, majority vote.
6. If the reply endorses you in both branches, that's a **flip** — agreement with no information content.
7. Report: overall Agreeable Rate, per-topic breakdown, a timeline, and the five threads where you were most flattered, with the two contradictory replies shown side by side.

## Technical approach
Python + SQLite + a small FastAPI/HTMX dashboard. The OpenAI export is a message *tree* (`mapping` with parent pointers) — walk to the leaf of the current branch, not the flat list. Stance detection and polarity inversion both run on Haiku 4.5 with structured tool output; inversion is validated by (a) a second model confirming the claim is negated and (b) cosine distance of embeddings staying inside a band — too far means the rewrite changed the topic, not the stance. Replays use the same model family as the original thread where the export records it, temperature 0.7, 3 samples per branch. Cache every call keyed by SHA-256 of (context, message, model) so re-runs are free.

The genuinely hard part is the minimal pair. Flipping "we should use Kafka" is easy; flipping "my manager keeps overruling me and it's demoralizing" is not — some claims have no clean negation. v1 detects and skips those (a `polarity_confidence` gate) and reports coverage honestly rather than faking pairs.

## v1 scope
- OpenAI export only; drag one JSON file onto a CLI.
- Sample 40 stance turns, not all of them.
- One number + a table of the 5 worst flips, printed to the terminal.
- Bring-your-own API key; print estimated cost before running.

## Out of scope
Live browser-extension interception. Multi-user or team reports. Anything that phones home. Judging whether you were *right*.

## Risks & unknowns
Replay cost on a 2-year history could be tens of dollars — sampling is mandatory, not an optimization. Stance judges are themselves agreeable; needs a calibration set of hand-labeled pairs. Some flips are *correct* (both sides genuinely defensible), so the metric needs a floor, not a target of zero.

## Done means
On a hand-built fixture of 20 conversations — 10 with a deliberately sycophantic assistant, 10 with a critical one — the tool reports an Agreeable Rate above 0.7 for the first set and below 0.3 for the second, and produces a readable side-by-side for every flip it claims.
