## Overview
A cooperative one-word-at-a-time storytelling game. Everyone in the room takes turns contributing a single word to a shared story that unfolds sentence by sentence on all phones. No one owns the direction, no one can steer alone, and the result is a group-authored short story that reads like a fever dream. Wholesome, low-stakes, and finishable in ten minutes.

## How it works
Room joins, turn order established. A shared story canvas appears on every phone. On your turn, your phone shows a text input; you type one word (letters + basic punctuation) and submit. The word appears live on every other player's phone. Turn passes. Sentences end on periods (typed by whoever's turn lands there). After N sentences (default 5) the story is done and everyone reads the whole thing on their phone. Optional: Haiku generates a title.

## Problem
Group storytelling games either give one person too much control (they hijack the direction) or ask people to write full sentences (paralysis, blank-page fear). One word at a time is the sweet spot: contribution is fast, no one can dominate, and the emergent narrative is genuinely surprising. It's been played verbally forever ("and then... a wolf... appeared..."); doing it on phones lets the story render live across every screen and preserves it for the reveal.

## Technical approach
WebSocket room. Simple state: `{ story: [word, word, ...], turnIndex, playerOrder }`. On submit, server appends the word, broadcasts the updated story to all clients, advances turnIndex. Input validation: strip whitespace, allow letters + basic punctuation (`.`, `,`, `!`, `?`, `'`), reject multi-word inputs. Per-phone architecture is load-bearing in a subtle way: only the active player sees the input field; everyone else sees the live-updating story with a "waiting on Priya..." indicator, which keeps the pace and prevents backseat-writing. Optional Haiku call at the end to generate a title — one API call, low latency risk. No LLM during play.

## v1 scope
- 3-10 player rooms
- Fixed turn order (join order)
- Single-word input with basic-punctuation validation
- Live story rendering on all phones
- Fixed length: 5 sentences then end
- End-of-game reveal screen with full story
- No title generation

## Out of scope
- Haiku-generated title
- Voting on best word / MVP
- Branching stories
- Player-chosen themes/genres
- Save/share stories externally
- Undo / skip turn

## Risks & unknowns
- One player being AFK stalls everyone (need a soft timeout)
- Someone will type slurs — need at least a basic wordlist filter
- Very short stories may feel unsatisfying; very long ones lose steam
- Punctuation rules trip people up (do periods end the turn or the sentence?)

## Done means
3-10 players can join a room, take turns adding one word to a shared story that renders live on every phone, reach 5 sentences, and see the finished story on a reveal screen. The active player is the only one with an input field at any moment.
