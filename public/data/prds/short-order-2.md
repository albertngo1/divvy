## Overview
Short Order is a fast, phone-based party game for 3–8 people built on top of the Emoji Kitchen corpus (the 100k+ Google emoji mashups indexed by the emoji-kitchen repo). Each round one player is the 'cook' who must convey a secret word using only fused-emoji tiles, against a countdown; everyone else races to guess it.

## Problem
Charades and Codenames are great but everyone's played them to death, and emoji games flatten to the same 900 standard glyphs. The Emoji Kitchen dataset is a wildly expressive, barely-used visual vocabulary (a crying-cowboy, a bread-cat, a fire-clock) that nobody has turned into a game. The itch: a fresh, giggly communication constraint that fits in a group chat's worth of downtime.

## How it works
One phone is the 'griddle' (shared screen / TV, optional); each player joins a room on their own phone. The cook draws a secret word and gets a searchable palette of Emoji Kitchen fusions. They plate up to 4 mashups onto a shared tray; guessers type answers in real time. First correct guess scores both guesser and cook; the timer ('the dish burns') caps the round. Rotate cooks. Twist rounds: 'no repeats' (can't reuse a base emoji), 'chef's tasting' (guessers can only submit one answer). A round ends with a reveal of which fusions the cook chose and why.

## Technical approach
Stack: a static React client + a tiny websocket server (or a serverless room via Cloudflare Durable Objects). The palette comes straight from the emoji-kitchen repo's combination index (pairs → composited PNG URL from Google's endpoint), loaded client-side; search is a prebuilt inverted index over the two base-emoji names so typing 'cat' surfaces every cat fusion instantly. Game state (tray, guesses, scores, timer) syncs over websockets; rooms are 4-letter codes, no accounts. Word list is a curated ~2k guessable-noun deck with difficulty tiers. The hard part is guess matching (fuzzy/synonym tolerance so 'cowboy'/'cowgirl'/'rodeo' all count) and keeping the fusion image loads instant on a phone (preload the cook's recent-search set).

## v1 scope
- 4-letter room codes, up to 8 players, no login
- Emoji Kitchen search palette + 4-slot tray
- Real-time guessing with fuzzy match + shared timer
- Score rotation over 5 rounds
- One curated noun deck

## Out of scope
- Standalone spectator TV app (phones only in v1)
- Custom decks / user-submitted words
- Persistent profiles, matchmaking, ranked

## Risks & unknowns
- Emoji Kitchen endpoint stability/ToS for hotlinking composited images
- Fuzzy guess-matching feeling fair without being exploitable
- Whether the fusion vocabulary is expressive enough for abstract words (probably nouns-only)

## Done means
Six people in a room on their own phones can play a full 5-round game end to end, fusion images load in <500ms, and at least 70% of rounds get guessed before the timer — with a laugh in the reveal.
