## Overview
A cooperative information-reconstruction game. Every player sees the same short paragraph on their phone, but each phone has a *different* set of words blacked out. As a group, players ask each other yes/no questions to piece together the full text — no one can just read theirs aloud (that's cheating), so the fun is in the guessing protocol they invent together.

## Problem
Asymmetric-information games are almost always social deduction (find the impostor). They're rarely cooperative reconstruction: everyone has a piece of the truth, and success requires clever communication under constraints. On paper this is impossible — you'd need to hand-cut 6 different redacted printouts. On phones it's trivial: the server hands each player a different mask over the same base text, and per-phone privacy is what makes the puzzle exist.

## How it works
Room joins. Server picks a paragraph (~50 words) and generates a mask per player: each phone gets ~30% of words redacted as black bars, with the redacted sets *overlapping partially* between players (so no single player has the full text, but the group union does). Players read what they can see on their phone. To reconstruct, they ask each other yes/no questions ("does the fourth word start with S?", "is the noun after 'quickly' a color?"). No reading aloud allowed — self-policed. When the group thinks they have it, they submit a joint guess (host types the full paragraph on their phone). Compare to original, score by word-accuracy.

## Technical approach
WebSocket room, single shared paragraph, per-player masks. Server generates masks so `union(masks) = full paragraph` but no individual mask covers more than 70%. Paragraph deck is curated JSON (~50 entries: song lyrics, movie quotes, absurd sentences, Wikipedia openings — anything with texture). Per-phone privacy is load-bearing: if any player could see another's screen, the game trivially collapses. Rendering: monospace font, black `<span>` for redacted spans (fixed-width so word lengths are still visible). Optional Haiku for hint generation later; v1 is pure human reasoning. Scoring is exact-word match on the group's submitted reconstruction.

## v1 scope
- 3-6 player rooms
- Curated paragraph deck (~50)
- Server-generated per-player masks (30% redacted, overlapping union)
- Word-length preserved (fixed-width bars)
- Host submits the group's reconstruction
- Exact-word scoring with a visible diff on reveal
- One paragraph per game

## Out of scope
- LLM-generated paragraphs or hints
- Structured Q&A protocol (players self-organize)
- Best-of series / running score
- Difficulty tuning per player
- Time pressure

## Risks & unknowns
- Mask generation math: guaranteeing full union without making it too easy or too hard
- Self-policing "no reading aloud" — trust-based, no enforcement
- Paragraph selection: some texts are too guessable (song lyrics everyone knows) or too obscure
- Group size sweet spot — 3 might not have enough overlap, 6+ might trivialize it

## Done means
3-6 players can join a room, each see the same paragraph with a different overlapping redaction mask, discuss verbally, submit a group reconstruction typed by the host, and see a scored diff against the original. No player ever sees another player's mask.
