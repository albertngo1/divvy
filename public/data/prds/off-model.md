## Overview
A hidden-impostor drawing party game for 4–6 players on a shared TV plus phone controllers. It riffs on The Chameleon and A Fake Artist Goes to New York, but flips the format: instead of one shared paper drawn one stroke at a time, **every player draws their own complete picture simultaneously and blind**. The fun is the reveal — six finished doodles side by side, one subtly wrong.

## Problem
Fake Artist is serial and slow: one shared sheet, one stroke per turn, long dead time, and the collective scribble is rarely legible. The Chameleon's clue round drags and rewards the loudest talker. The itch is a drawing deduction round where *everyone is active the whole time* and the tension lands all at once: "which of these six is off-model?"

## How it works
Each phone privately shows a word. All players but one receive the SAME word ("cactus"); the lone impostor receives a semantic neighbor ("aloe," "pineapple") and is never told they're the odd one out. A 45s timer starts. Every player draws their word on their own phone canvas, fully blind to the others. The host TV shows only six blank frames, the timer, and a moving dot per player (proof they're drawing) — never the strokes. On time-up, the TV reveals all six drawings at once in a grid. Each player privately votes on their phone for the drawing that doesn't fit. Reveal: vote tally, the impostor, and both words.

**Private per phone:** your secret word; your live canvas. **Shared on TV:** blank frames during drawing, the final gallery, the vote result. Per-phone is load-bearing — you need private, differing word assignments AND simultaneous blind canvases; one passed phone forces serial, mutually-visible drawing that kills both the secrecy and the simultaneity.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, majorityWord, impostorWord, players[]}`, `Player{id, name, isImpostor, word, strokes[], vote}`. Strokes are pointer paths batched ~10Hz to the server, which stores them but does NOT rebroadcast to peers during DRAW. Phases LOBBY→DRAW→GALLERY→VOTE→REVEAL are server-timed. The genuinely hard part is not real-time sync (canvases stay private until reveal, so sync is trivial) — it's **word-pair curation**: pairs must be close enough to be plausibly confusable yet drawable differently. v1 ships ~30 hand-picked pairs.

## v1 scope
- Exactly 4 players, one round
- One curated word pair from a fixed list
- Fixed 45s draw, single-color pen, undo only
- One impostor, one majority vote
- TV shows the gallery + reveal; minimal styling

## Out of scope
- Multi-round scoring, colors, brushes
- LLM/auto-generated word pairs
- Reconnect, spectators, >6 players, chat

## Risks & unknowns
- Are 45s blind phone doodles legible enough to judge? May need 60s.
- Pair tuning: too close is unfair to the impostor; too far is obvious.
- Peeking a neighbor's phone — accept it as party friction for v1.

## Done means
Four phones join via a code, each shows a private word (one differs), all draw simultaneously for 45s with peers' canvases hidden, the TV reveals all four at once, players vote on their phones, and the TV correctly names the impostor and both words.
