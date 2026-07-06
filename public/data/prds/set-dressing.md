## Overview
Set Dressing is a once-a-day browser guessing game. Each day it shows one clue — a still of a *fictional* computer UI, HUD, terminal, or "hacking" screen from a movie or TV show — rendered with authentic composite-video wobble and scanlines. You get six guesses to name the title, with a new hint revealed after each miss. For film buffs, retro-computing people, and anyone who's ever paused a movie to read the ridiculous on-screen code.

## Problem
The "Starring the Computer" archive is a delightful rabbit hole but it's a passive catalog. There's no game loop, no daily habit, no bragging. And composite-video/CRT aesthetics are having a moment (see the NES-wobble deep dives) with no playful home. Set Dressing turns props trivia into a shareable daily streak.

## How it works
One puzzle per UTC day, seeded by date so everyone gets the same clue. The board shows the cropped UI still through a shader that adds chroma smear, scanlines, and a subtle horizontal jitter — obscuring era-giveaway details. Guess via an autocompleting title box. Each wrong guess peels back a hint: year → genre → the machine model shown → a wider crop → a one-line quote. Solve in fewer hints = higher score. Result is a spoiler-free emoji grid (📺🟥🟥🟩) to share. A practice/archive mode lets you play past days.

## Technical approach
Fully static: React + a WebGL fragment shader for the CRT effect (barrel distortion, scanline mask, per-line phase offset to mimic the NES composite wobble). Content is a hand-curated JSON DB of entries {id, title, year, genre, machine, imageCrops[], quote, aliases[]} — bootstrapped by scraping/attributing Starring the Computer plus manual additions, with images stored locally (thumbnails, fair-use crops). Daily selection = `hash(date) % puzzlePool`. Autocomplete uses a prebuilt title trie with alias matching (fuzzy via Levenshtein ≤2). Streaks/stats in localStorage; optional serverless endpoint for a global "solved in N" leaderboard. Hard part isn't code — it's curation and legally-cautious cropping so clues are fair but recognizable only to real fans.

## v1 scope
- 30 hand-curated puzzles, one per day
- CRT shader with wobble + scanlines
- Six guesses, progressive hints, autocomplete with aliases
- Shareable emoji-grid result, localStorage streak

## Out of scope
- User-submitted puzzles
- Global leaderboard / accounts
- Video clips (stills only)

## Risks & unknowns
- Image rights for movie stills (mitigate with tiny transformed crops / fair-use)
- Puzzle difficulty calibration — too obscure kills retention
- Content runway: need a pipeline to keep feeding new days

## Done means
Open the site on two different days and get two different date-seeded puzzles; solving one produces a correct spoiler-free emoji grid, and the CRT shader visibly wobbles the still like a mistuned NES.
