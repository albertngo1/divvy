## Overview
Screen Test is a once-a-day guessing game where the puzzle is a still frame of a *computer on screen* — a chunky beige terminal in a thriller, a fictional OS booting in a heist film — and you guess the movie in six tries, Wordle-style, with a shareable spoiler-free grid. For film nerds and retro-computing enjoyers who already lose hours on starringthecomputer.com.

## Problem
Starring the Computer is a delightful catalog but it's a *reference*, something you passively read. There's no reason to come back tomorrow, and no way to compete with a friend over who spotted the PDP-11 faster. The push here: take something people passively browse and make them race over it.

## How it works
Each day serves one frame. You type a movie title (autocomplete against a title list). Wrong guesses reveal progressive hints: year → genre → the *make/model* of the on-screen machine → a wider crop of the scene → one line of dialogue. Green when correct; the shareable grid shows how many hints you needed without spoiling the answer. A streak counter and an optional global "solved-in-N" leaderboard. Hard mode: also name the computer model.

## Technical approach
Data comes from starringthecomputer.com, which cross-indexes films ↔ computer models ↔ scene screenshots — scraped politely into a local JSON of {film, year, genre, computer_model, image_url, quote}. Static SvelteKit front end; the daily puzzle is a date-seeded deterministic index into a shuffled puzzle array so every player gets the same one with no server. Guess validation is fuzzy-matched (Levenshtein + alias table for "2001" vs "2001: A Space Odyssey"). Images are pre-cropped to the monitor bounding box at build time with a quick manual pass. The hard part is polite sourcing and getting image rights sorted — likely link back and use thumbnails under fair-use commentary.

## v1 scope
- 30 hand-picked frames with hint ladders
- Date-seeded daily puzzle, 6 guesses, autocomplete
- Shareable emoji grid + localStorage streak

## Out of scope
- Accounts, real leaderboards (localStorage only for v1)
- User-submitted frames
- Video clips instead of stills

## Risks & unknowns
- Image licensing / fair-use posture with the source site
- Frame ambiguity — some computers appear in many films
- Small audience ceiling; it's a nerdy niche

## Done means
On two devices on the same day you get the identical frame, solving it in three hints produces a shareable grid, and the streak survives a page reload.
