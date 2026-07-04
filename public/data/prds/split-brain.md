# Split Brain

## Overview
Cooperative visual puzzle. A single image (photo, painting, meme) is chosen and cropped into N tiles; each phone shows exactly one tile (each player sees their piece and nothing else). The group's shared goal is to correctly identify what the whole image depicts. Communication is text-only in a shared chat, and each player has a 20-word budget per round to describe their tile. Reveal happens after guess submission. Per-phone entirely load-bearing because if anyone can see anyone else's tile, the whole puzzle collapses.

## Problem
Cooperative deduction games (Hanabi, Just One, Codenames) all involve constrained language, but nobody has explored *visual asymmetry* as the source of the puzzle. It's a genuinely different flavor: describing what you SEE (with intentionally limited vocabulary) versus what you KNOW. Also uniquely satisfying at reveal: seeing the full image after only having glimpsed a corner is inherently delightful.

## How it works
Room code join, 3-8 players. Server picks a source image (from a curated pack: paintings, photos, landmarks, celebrity portraits, memes). Server crops the image into N tiles (one per player), assigns one tile per phone. Each player looks at their tile in private. Shared chat opens with a 20-word budget per player. Players describe what they see. Discussion continues until any player types a guess prefixed with `!guess`. If correct: round scored, reveal shows the full image. If wrong: round fails, reveal shows full image + everyone's descriptions. Session = 5 rounds, cumulative score.

## Technical approach
PartyKit / Durable Objects. Room state = `{image_id, tiles: {player_id: tile_url}, chat_log, word_budgets: {player_id: int}, guesses}`. Image library = ~100 hand-curated images per category (art, photos, celebs, memes) hosted on the homelab. Tile crop: server pre-crops all images to a 3x3 grid; players get N of the 9 tiles (randomly, without overlap). Chat via WebSocket, server enforces per-player word count. Optional: Haiku validates whether a guess text semantically matches the image title (accepts "Mona Lisa" for "The Mona Lisa by da Vinci").

## v1 scope
4 players, 5 rounds, 1 image pack (~30 curated images across paintings + celebrities + memes), fixed 4-tile crop (2x2), 20-word budget per player, single-guess-ends-round mechanic. No difficulty tiers, no image variety by round (random across all categories), no LLM guess matcher (exact-string only).

## Out of scope
LLM semantic guess-matching, custom image uploads, difficulty tiers (harder = smaller tile sizes, less-recognizable images), per-category rounds, spectator mode, hint mechanics, hint mechanics ("give one more word"), replay of failed rounds, adaptive tile selection ("edge pieces vs center pieces").

## Risks & unknowns
Image licensing is the biggest single risk — v1 must use Creative Commons or public-domain images only. Some tiles will be trivially recognizable (a Mona Lisa eye) and some completely unhelpful (blank sky corner) — balance across the 4 tiles matters. Playtest: is 20 words per player enough? Probably need to tune. The exact-string guess is annoying (typos, disambiguation) but LLM matcher is v1.1 to keep scope small. Test: does the group actually piece together the image through descriptions, or does everyone just guess wildly? The unlock moment is "OH WAIT it's THAT one" as descriptions accumulate.

## Done means
4 friends open the room, play 5 rounds, correctly guess at least 2. If at reveal the group cheers "OH I HAD THE EAR!" at seeing the full image, v1 shipped.
