## Overview
Byte Pair is a daily browser puzzle about tokenization: you're shown a phrase and must place the exact boundaries where a real LLM tokenizer (GPT-4/cl100k, Llama, etc.) splits it. It's Wordle for ML-curious people — the crowd that upvoted GigaToken and argues about glitch tokens.

## Problem
Tokenization is the invisible layer behind every LLM's weirdest failures — miscounting letters, choking on rare 'unspeakable' tokens, pricing surprises — yet almost nobody has intuition for it. Tokenizer playgrounds exist but they're passive inspectors. There's no *game* that builds the muscle memory of 'oh, THAT'S where it splits.' Passive tool → competitive daily puzzle.

## How it works
Each day a seeded phrase appears as a strip of characters. You click between characters to drop token boundaries — your guess at where the BPE merges stop. Submit, and you get colored feedback: green boundary = correct, gray = you split where the model didn't, red = you missed a real boundary. You get 4 tries to match the true tokenization exactly. Difficulty ramps: Monday is 'strawberry', Friday is a mixed-script emoji-plus-code horror. A bonus 'Glitch' round shows a famously cursed rare token (the ' petertodd'/'SolidGoldMagikarp' family) and asks you to type any English sentence whose tokenization *contains* that exact token — scored by fewest characters. Emoji-grid share string, global leaderboard, streaks.

## Technical approach
Fully static front-end (Svelte) + WASM tokenizer so it runs offline with no API cost: compile `tiktoken`'s BPE (or Huggingface `tokenizers`) to WASM, ship the cl100k merge table. The puzzle is pure client-side — tokenize locally, diff the user's boundary set against the true set. Data model: `puzzle(date, phrase, tokenizer_id, true_boundaries[])`, `glitch_round(token_id, min_chars_record)`. Daily phrases are curated offline for maximum surprise (letter-count traps, whitespace-leading tokens, digit chunking, homoglyphs). Leaderboard via a thin serverless KV. The genuinely tricky part is the Glitch round: verifying an arbitrary user sentence actually contains the target token requires running the real tokenizer on their input and checking token-id membership — easy locally, but anti-cheat means re-verifying server-side.

## v1 scope
- One tokenizer (cl100k), WASM, one puzzle/day
- Boundary-placement mode only, 4 guesses, colored feedback
- Emoji share string
- ~30 hand-authored puzzles queued

## Out of scope
- Glitch round (v2)
- Multiple tokenizers / tokenizer-picker
- Accounts, streaks synced across devices

## Risks & unknowns
- Niche audience — great for ML Twitter, invisible to normies
- Boundary-guessing UX may feel fiddly on mobile; needs big tap targets
- Some tokenizations are genuinely unintuitive to the point of feeling unfair — curation is everything

## Done means
A player can load the day's puzzle offline, place boundaries on 'strawberry', submit, see green/gray/red feedback matching cl100k's real split exactly, and copy a shareable emoji grid — all with no network call after initial load.
