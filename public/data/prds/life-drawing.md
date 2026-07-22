## Overview
A local-multiplayer drawing game for 4–8 phones plus a shared TV/host screen. Every round, all players draw the same secret prompt under a brutal timer and a crude, uniform brush. Then a hidden **AI impostor** entry — generated from the same prompt — is shuffled into the gallery. The room votes on which drawing is the machine. Humans win by spotting the AI *and* by getting their own scribble mistaken for it.

## Problem
Watching LLMs 'draw the Mona Lisa with colored pencils' is a hit spectator genre right now — but it's passive; you just scroll the results and go 'huh.' There's no game where *you* are in the arena against the model, and where the fun is the uncanny-valley judgment call. Party games also badly need a fresh mechanic that isn't another prompt-writing/typing loop.

## How it works
1. Host screen shows a room code; phones join (no app, just a URL).
2. Each round reveals a secret prompt (e.g. "a nervous lighthouse"). Everyone has 15s on an HTML5 canvas locked to one fat brush and a 6-color palette — deliberately lo-fi so no one draws like an illustrator.
3. The server also asks a model to render the same prompt in the *same* crude constraints.
4. Gallery appears anonymized on the TV. Everyone privately votes 'which one is the AI.'
5. Scoring: +points for correctly IDing the AI; +points to any human whose drawing received AI-votes (you fooled the room); the AI 'wins the round' if it survives the vote. Reveal animates who drew what.

## Technical approach
Stack: Node + WebSocket rooms, a static phone client (canvas → compact stroke list, not pixels), host view in the same app. The genuinely hard part is **style parity** — if the AI entry looks too clean, the game is trivial. Two levers: (a) force every entry (human and AI) through the same normalizer — downscale to ~256px, quantize to the 6-color palette, thicken lines; (b) generate the AI drawing as *strokes*, not a photo: prompt an LLM to emit SVG polyline paths mimicking a hurried human doodle, or run a doodle-style diffusion pass then posterize. Data model: `rooms`, `rounds(prompt, ai_stroke_json)`, `submissions(player, strokes)`, `votes`. Prompts are a curated deck of concrete-but-weird nouns/adjectives that are drawable in 15s.

## v1 scope
- One room, 4 players + 1 AI entry per round
- Fixed brush/palette, 15s timer, 5 rounds
- AI entry via LLM-emitted SVG strokes (no diffusion)
- Vote + reveal + running score on host screen

## Out of scope
- Accounts, matchmaking, image-model rendering, custom prompts, mobile-native app.

## Risks & unknowns
- Style parity: too-good or too-weird AI both kill the tension — needs playtest tuning.
- Latency: AI stroke generation must finish inside the round window (pre-generate during drawing).
- Prompt deck must be reliably drawable by non-artists.

## Done means
Five people in a room draw 'a nervous lighthouse,' a machine-made scribble slips into the gallery, the room votes, and at least once across a session the AI survives the vote — and everyone argues about it.
