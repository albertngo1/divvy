## Overview
Augur is a daily browser wordgame built on real oracle-bone script (甲骨文) rubbings. Each day it shows you one ancient glyph and challenges you to identify the modern Chinese character it became. For language nerds, sinophiles, and anyone who saw the AlphaOracle decipherment paper and wanted to try it by hand.

## Problem
Oracle-bone script is the origin of Chinese writing and visually gorgeous, but it lives locked in academic databases. There's no fun, low-friction way to *play* with the pictographic logic — to feel a sun-glyph resolve into 日 or a walking-legs glyph into 步. And there's a quietly thrilling fact hobbyists never get to touch: over a thousand oracle-bone characters remain **undeciphered**. The itch: make both the solvable joy and the unsolved mystery playable.

## How it works
**Daily mode:** a rubbing image appears. You get graded hints on a stamina budget — reveal the semantic radical, reveal a gloss of the meaning ('a hand grasping'), reveal the pinyin's first letter. Fewer hints = higher score. You type or pick the modern character; Wordle-style emoji share ('☀️→日 in 2 hints'). Streaks and a global histogram of how many hints everyone needed.
**Unsolved mode:** you're shown a genuinely undeciphered glyph. There's no answer key. You submit your *reading hypothesis* (a meaning + a rationale), vote on others' hypotheses, and the most-upvoted community readings accrete — a playful crowd echo of the 'humans being outcounterexampled' thread, except here the machine can't grade you either.

## Technical approach
Static frontend (Svelte) + a small Postgres for scores/hypotheses. Data: 小學堂 (Academia Sinica) and open oracle-bone datasets (e.g. HUST-OBC) provide glyph images mapped to modern characters plus radical/gloss metadata; a preprocessing script normalizes rubbings (crop, threshold, transparent PNG) and builds the daily rotation JSON. Scoring is deterministic from hints-used. The hard part is data hygiene: multiple variant forms per character, contested mappings, and licensing on rubbing images — solved by curating a vetted ~800-glyph daily pool and clearly separating it from the unsolved pool, with source attribution per image.

## v1 scope
- ~200 vetted daily glyphs in rotation
- 3-tier hint system + deterministic score
- Emoji share string
- Local streak (localStorage), no accounts

## Out of scope
- Unsolved/community-voting mode (v2)
- Handwriting/stroke input
- Non-Chinese ancient scripts

## Risks & unknowns
- Image licensing on academic rubbings — must confirm reuse terms
- Character encoding: some ancient forms lack Unicode; render as images
- Difficulty tuning — pictographs are guessable, phonetic loans aren't
- Niche audience; needs the share loop to spread

## Done means
A visitor loads the page, sees today's rubbing, uses hints, correctly identifies the character, gets a shareable emoji string, and returns tomorrow to a different glyph — with the daily pool served from a curated dataset of at least 200 real, sourced oracle-bone images.
