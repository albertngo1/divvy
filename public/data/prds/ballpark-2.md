## Overview
Ballpark is a daily Fermi-estimation game played off a single photograph. Each day you see a real image and a question whose answer is a number you can only *infer* from visible traces: "How many people climb this staircase per day?" (from the polished groove in the steps), "How tall was the person who left this scuff?", "How many years has this bench been here?" You commit a number; you're scored on log-distance from the truth. It's for the people who devoured the "estimating New Yorkers' heights from their scuff marks" post and wanted to *play*.

## Problem
Forensic estimation — reading the world's wear and residue — is a delightful skill that lives only in one-off blog posts. There's no place to practice it competitively, and no daily ritual that rewards good order-of-magnitude reasoning over trivia recall. Wordle proved a tiny daily shareable score is sticky; nobody's done it for physical inference.

## How it works
1. Open today's puzzle: a photo + a question + a units hint.
2. Optionally reveal up to two 'clue chips' (a scale reference, a timeframe) — each revealed chip caps your max score, so restraint is skill.
3. Enter your estimate. Score = round(100 · e^(−|ln(guess/truth)|·k)) — being within 2× still scores well; being 10× off tanks.
4. Reveal shows the actual number, a short 'how it was measured' note, and the global distribution of guesses. Shareable emoji-band result (🎯 within 1.5×, 🟩 within 3×, 🟥 beyond).
5. Streaks, a global daily leaderboard, and async head-to-head 'closer than a friend' challenges.

## Technical approach
- **Client:** static SPA (Svelte), date-seeded puzzle fetch, all scoring client-side against a signed answer revealed post-submit.
- **Puzzle format:** JSON `{image, question, unit, truth, source_note, clues[]}`; answers stored HMAC-committed so the truth can't be scraped before you guess.
- **Content pipeline (the hard part):** sourcing photos with *defensible* ground-truth numbers — municipal foot-traffic counts, dated infrastructure, published crowd figures, or physically measurable references in-frame. This is editorial labor, not code; a small authoring tool that lets me tag a photo, record the true value + citation, and set clue chips.
- **Backend:** a thin serverless function for leaderboard/streaks (SQLite/Turso); no accounts required (device key).

## v1 scope
- One puzzle a day, hand-authored, 20-puzzle backlog.
- Log-error scoring + reveal + emoji share string.
- Local streak counter, no server.

## Out of scope
- User-submitted puzzles and moderation.
- Accounts, friend graphs, real-time multiplayer.
- Auto-sourcing photos with CV — humans author v1.

## Risks & unknowns
- Ground-truth sourcing is the whole ballgame; disputable answers erode trust. Every puzzle needs a citation.
- Ambiguous questions frustrate; needs tight wording and generous scoring curves.
- Content burn rate — one good puzzle a day is real work.

## Done means
A player opens the day's photo, submits a number, and gets a score that a second player can't beat without genuinely reasoning closer to the cited truth; the shareable band string copies cleanly and the same date always yields the same puzzle.
