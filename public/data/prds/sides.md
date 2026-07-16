## Overview
Sides is a hidden-role table-read game for 4-5 players. In theatre, "sides" are the partial script pages an actor gets — just their own lines plus cues, never the whole scene. Sides makes that literal and load-bearing: each phone shows only that player's lines, the group performs a short scene aloud, and one player's private script has a single altered line that quietly breaks the story.

## Problem
Hidden-role games lean on dossiers and votes; performance is untapped. Yet a group reading a scene cold, and one actor confidently saying a line that doesn't fit the world everyone else is building, is pure comedy and pure deduction at once — and it's impossible to do by passing one phone around.

## How it works
The host TV shows the scene title, the cast list, and a turn pointer — whose line comes next — plus the end vote. It never shows line text. Each phone privately shows **only that player's lines**, each preceded by a short "cue" (the last few words of the line before it) so you know when to jump in; your phone also buzzes when the server reaches your turn.

One player (who does NOT know they're the imposter) has exactly one of their lines swapped for a **corrupted variant** that contradicts an established fact — everyone else's lines reference "the storm outside," but the imposter's altered line says "what a beautiful sunny day." Because each player sees only their own sides, the imposter lacks the context to notice theirs is the odd one — innocent betrayal. A sharp imposter who senses their line clashes with the cue can ad-lib to paper over it: latent agency without breaking the premise.

After the ~16-line read, each phone shows a blind vote for "whose line didn't fit." Reveal.

Private (phone): your sides, cues, your-turn buzz, vote. Shared (host): cast, turn pointer, title, vote tally, reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: a `Scene` is an ordered `lines[]`, each `{index, character, text, cueSnippet}`, with one line carrying a `corruptText`. On start the server maps characters to players, picks one player as imposter, and delivers each client only its own lines — substituting `corruptText` for the imposter's flagged line. Turn sequencing is server-driven: it broadcasts the current line index to the host (moves the pointer) and buzzes the active phone; the player taps "done" (or it auto-advances) to progress. Sync is trivial — the game is turn-based and human-paced. The genuinely hard part is **authoring**: scenes where a single swapped line reads as a clean, audible contradiction rather than noise, and cue snippets precise enough that players know when to speak without ever seeing others' full lines. Handle a missed cue with a host "nudge" and skip.

## v1 scope
- 4 players, one ~16-line scene
- Exactly one corrupted line on one player
- Server turn pointer + phone buzz
- One blind vote, one reveal

## Out of scope
- Scoring, multiple scenes/rounds
- "Imposter knows" variant
- AI-generated or user-written scenes
- Audio recording / playback

## Risks & unknowns
- Reading aloud is high-friction for shy groups
- The altered line may land too obvious or too subtle
- Cue-based turn-taking can stumble; missed cues stall the scene
- Scene-writing quality gates the whole experience

## Done means
Four players perform a 16-line scene from private sides, exactly one carries a corrupted line, and across playtests the blind vote identifies the imposter above chance while non-imposters can point to the specific line that broke the scene.
