## Overview
Ascender is a 3-5 player concurrent-room game that produces one keepsake: a framed acrostic poem whose hidden vertical word is a surprise dedication (an honoree's name, or a word-of-the-night). It's for a birthday table, a leaving-do, or friends who want a small handmade thing at the end of a night — not a scoreboard.

## Problem
Group 'let's all write something for X' moments collapse into one person doing the work while everyone reads over their shoulder. There's no privacy, no simultaneity, and no payoff moment. Acrostics are a lovely form but writing one solo is a chore and reading one aloud spoils the reveal instantly.

## How it works
The host secretly picks a target WORD (default: a chosen guest's first name, entered at lobby time by whoever set up the room). The server splits the word's letters across players in reading order and assigns each player one or more letters — but each phone is told ONLY its own letter(s) and a single shared TOPIC ('summers we spent', 'the drive home').

PRIVATELY, each phone shows: your letter (big), the topic, a text box, and a live constraint 'your line must start with M'. You cannot see anyone else's letter or line. Everyone writes simultaneously under a soft 3-minute timer. Because nobody knows the neighboring letters, nobody can guess the hidden word mid-game.

The HOST screen shows only: the topic, filled/empty slot dots, and a 'writing…' pulse per player — never the letters, never the lines. On submit-lock, the host animates the poem assembling line by line top to bottom; as the first letters stack up the hidden word emerges vertically, landing on the honoree's name. The finished acrostic renders as a saveable PNG (and a read-aloud order). No points, ever.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). Data model: Room{code, topic, targetWord, phase} and Player{id, assignedLetters[], line, locked}. The server is the only holder of targetWord and of the letter→player map; phones receive just their slice. Sync is trivial (a handful of small text payloads, no real-time tick). The genuinely fiddly part is letter assignment for words shorter or longer than the player count (double-up letters, handle repeats and spaces) and rendering a typographically decent poster server-side — an offscreen canvas with a webfont, exported as PNG.

## v1 scope
- 3-5 players, one round, one preset target word entered by host.
- Single shared topic from a tiny hardcoded list.
- Blind simultaneous line entry, soft timer, manual 'reveal' by host.
- Assemble poem, animate vertical-word reveal, export one PNG.

## Out of scope
- Scoring, multiple rounds, rhyme/meter validation.
- Player-chosen fonts, editing after lock, re-rolls.
- Attribution guessing games.

## Risks & unknowns
- Short names (3 letters) with 5 players — need graceful multi-line-per-letter. Long names may drag.
- A weak line can undercut the dedication; a 'nudge to fit the topic' hint may help.
- Reveal only lands once per group per word; replayability is thin (fine for a keepsake).

## Done means
Three phones each shown a different secret letter, three blind lines submitted, and the host renders an acrostic whose first column spells the preset word and downloads as a PNG — with no phone having seen another's letter before reveal.
