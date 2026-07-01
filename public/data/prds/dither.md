## Overview
Dither is a daily 1-bit drawing-and-guessing party game. Every day there's a shared secret word; each player has ninety seconds and a 16×16 monochrome grid — black pixels only — to depict it. Then the drawings enter a blind gallery where everyone guesses each other's words and upvotes the cleverest renders. It's Pictionary meets the charming brutal constraint of 1-bit pixel emoji, for people who like tiny creative constraints and a low-stakes daily ritual.

## Problem
Most drawing games need real art skill and a live group. The 1-bit / 16×16 constraint is a great equalizer — nobody can be *good*, only clever — and it produces adorable, shareable artifacts. But there's no daily, async, competitive home for it. Passive scrolling of cute pixel art becomes something you make and rank.

## How it works
Daily prompt drops. You draw in a 16×16 toggle grid (tap to flip pixels, plus a dither/fill helper), submit before the timer. Submissions are pooled anonymously. In the guessing round you're shown others' grids and try to name the prompt from a shortlist; correct guesses score the guesser, and the drawing earns 'legibility' points. A separate 'style' vote lets people heart the most delightful renders regardless of clarity. Leaderboards for both guessers and drawers; a shareable spoiler-free grid of your day's guesses.

## Technical approach
SvelteKit or plain Canvas front end — the grid is literally a 256-bit bitfield, so a whole drawing serializes to a 32-byte base64 string, trivial to store and diff. Backend is a Cloudflare Worker + KV/D1: one row per submission (userId, promptId, 32-byte bitmap), one per guess. Rendering is a nearest-neighbor upscale of the bitfield to canvas; a dither brush applies an ordered Bayer pattern to a selected region for texture. Prompt list is hand-curated for drawability. The genuinely hard part is anti-cheat/quality in the guessing round — preventing prompt leakage (guess options must be plausible distractors, not the raw word early), and scoring that rewards clear *and* creative without letting one dominate. Realtime isn't required; it's fully async with a daily cron rollover.

## v1 scope
- 16×16 toggle grid + submit, fixed daily prompt
- Anonymous gallery of the day's submissions
- Multiple-choice guessing (word + 3 distractors), score per correct
- Single leaderboard, 32-byte bitmap storage

## Out of scope
- Dither brush, style/heart voting, accounts, multi-color, realtime rooms, mobile app

## Risks & unknowns
Cold-start (needs enough daily players for a fun gallery); prompt curation for drawability; keeping guessing non-trivial without being impossible.

## Done means
Two players on the same daily prompt each submit a 16×16 drawing, then correctly/incorrectly guess each other's word, and both the guess score and a persisted 32-byte bitmap render back identically on reload.
