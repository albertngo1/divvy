## Overview
Telephone, but the LLM is the drunk friend in the middle. Each player writes a message on their phone; the server passes it to Haiku with a corruption prompt ("summarize this like a tired intern"; "translate to French and back"; "rewrite as a conspiracy theorist"); the next player sees the *corrupted* version and rewrites it in their own words. Repeat around the room. At the end, reveal the full chain from original to final wreckage.

## Problem
Classic telephone requires whispered in-person passing and produces one funny final answer. What's actually great is the *chain* — reading the drift step by step — but you never see it. Doing it on phones lets everyone see the full chain at reveal, and dropping an LLM into each hop is a fresh mechanic: the corruption is unpredictable, unbounded, and often better than what humans produce (LLMs hallucinate confidently in ways that beat human miscopying).

## How it works
Room joins in a fixed order. Player 1 writes a starting sentence on their phone ("My uncle collects taxidermied squirrels"). Server sends it to Haiku with a random corruption style, gets back a distorted version, sends *that* to Player 2's phone. Player 2 reads it, then rewrites it in their own words (any way they interpret it). That rewrite goes back through Haiku with a different corruption style, then to Player 3. And so on. After the last player, the reveal screen shows the full chain: original → Haiku pass 1 → human 2 → Haiku pass 2 → human 3 → ... → final. Everyone reads it together.

## Technical approach
WebSocket room, sequential turn model. Server holds the chain array `[{author, text, corruption_style?}]`. On each hop: (1) show current text on active player's phone only, (2) collect their rewrite, (3) call Haiku with a randomly-selected corruption prompt from a curated list ("compress to 5 words", "add a suspicious detail", "translate to Spanish then back to English", "rewrite in the voice of a soap opera villain"), (4) advance to next player with the corrupted output. Per-phone privacy is load-bearing: each player must only see the *incoming* text, never the original or intermediate steps, or the punchline is spoiled. Reveal broadcasts the full chain to everyone. Latency budget per Haiku call: ~2s.

## v1 scope
- 3-8 players in fixed turn order
- ~8 curated corruption styles, randomly assigned per hop
- Text-only (no images)
- One chain per game
- Reveal shows full ordered chain with author + style labels
- Anthropic Haiku via server-side API call

## Out of scope
- Multiple concurrent chains
- Player-chosen corruption styles
- Image/voice hops
- Scoring / voting on funniest hop
- Persistent chain gallery

## Risks & unknowns
- Haiku latency stalls the whole game (one slow call blocks the room)
- Corruption prompts need heavy calibration — too weak = nothing funny, too strong = incoherent
- API cost per game (small but non-zero)
- Content moderation on user-written seeds

## Done means
3-8 players can join a room, take turns writing/rewriting a message that Haiku corrupts between each hop, and end with a reveal screen showing the full ordered chain — with each player only ever seeing their incoming message, never the ones before or after.
