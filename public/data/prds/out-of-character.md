## Overview
Out of Character is an offline desktop tool that treats your calendar like a language and runs masked prediction over it. For every event in your year, it hides that slot, hands the model everything around it, and asks: what does a person like this do at 2pm on a Thursday in March? The gap between the prediction and reality is the score. For anyone with two-plus years of calendar history and a suspicion they've become predictable.

## Problem
Year-in-review tools count things — meetings attended, hours booked, longest streak. Counting tells you nothing. The interesting question isn't "how busy were you," it's "how much of your year could a stranger have written for you from a two-line description?" Nobody has an instrument for that. And the answer is genuinely useful: the low-surprisal hours are the ones to automate, delete, or stop feeling proud of.

## How it works
1. Point it at a local `.ics` export (Google/Apple/Fastmail all export one).
2. It builds a persona sheet once: your recurring skeleton, typical hours, top collaborators — deliberately generic, the kind of description a stranger could write.
3. For each event, it constructs a masked context — the persona sheet plus the surrounding week with that one slot blanked — and asks the model to emit five candidate events for the hole, with weights.
4. Surprisal = distance between the real event's embedding and the weighted-candidate mixture, calibrated per-user so the median hour scores 0.5.
5. The output is a **residual year**: a 365×24 grid where predictable hours fade to background and unforecastable ones burn. Plus rankings — your most out-of-character day, your most replaceable recurring meeting, the month you were least yourself.
6. Ambient mode: the grid renders as a live wallpaper that fills in one column per day over the year, so a genuinely strange Tuesday visibly lights up your desktop.

## Technical approach
Python + SQLite; `icalendar` for parsing, with a normalization pass that strips Zoom links, collapses "Weekly Sync (recurring)" titles, and resolves attendee emails to stable IDs. Two model paths: local (Qwen3-class 7–27B via llama.cpp, so nothing leaves the machine — the right default for a calendar) or the Anthropic API for people who don't care. Candidate generation asks for structured JSON — five `{title, category, duration_min, attendee_count, weight}` objects. Scoring uses a local embedding model (bge-small or nomic-embed) over a canonicalized event string; surprisal is `1 − max_i(w_i · cos(e_real, e_i))`, then per-user z-scored, because raw cosine is uselessly compressed. The genuinely hard part is leakage: recurring events are trivially predictable from the surrounding week, so the mask must remove *all* instances of a recurring series from context, not just the target — otherwise the whole year scores as boring and the instrument reads nothing. Second hard part is calibration: a model that always guesses "meeting" makes everything look surprising, so the tool ships a null baseline (predict from marginal category frequency) and reports lift over it. Wallpaper via a small `wgpu`/Canvas renderer writing a PNG the OS picks up on a timer.

## v1 scope
- One `.ics` file in, one PNG residual grid out
- Local model only, batch run, no UI beyond a CLI progress bar
- Three rankings: strangest day, most predictable recurring event, lift over the null baseline

## Out of scope
- Email, Slack, location, or wearable data
- Any suggestion of what you *should* do
- Live wallpaper (v2), multi-year comparison (v2)

## Risks & unknowns
Calendars are sparse and lie — half of real life isn't on one, so the residual may just measure logging habits. Recurring-event leakage could flatten the signal. A 7B local model may be too weak to make interesting guesses; needs a bake-off against the null baseline before anything else is built.

## Done means
On a two-year real calendar, the tool beats the marginal-frequency baseline by a measurable margin, and its top-5 "most out of character" days match days the owner independently recalls as unusual, before seeing the output.
