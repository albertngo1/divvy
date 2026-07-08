## Overview
Ballpark is an estimation party game for 4-8 players — *Wavelength* inverted. There is no psychic and no hidden target dial. Instead, the target is emergent: it's the room's own secret average opinion. Each phone is a private dial you use twice — once to give your honest opinion, once to predict where the whole room will land. For groups who like spicy-prompt debate games but are tired of one person being 'the clue-giver.'

## Problem
*Wavelength* is great but leans on a single clue-giver, a shared physical dial, and an arbitrary randomly-placed target. Ballpark removes all three: the target becomes the group's genuine hidden consensus, every player participates every round, and the only hardware is the phones already in people's hands. Crucially, the game only exists because opinions stay private — reveal them and there is nothing left to predict.

## How it works
The host TV shows a spectrum prompt: 'How overrated is pineapple pizza? underrated ←→ overrated.' Phase 1 (OPINE): each phone PRIVATELY drags a slider 0-100 for its own honest take — hidden from everyone. Phase 2 (GUESS): each phone PRIVATELY guesses the GROUP AVERAGE (0-100). The server computes the true mean of the Phase-1 opinions and scores each player by how close their Phase-2 guess is to that mean. Then the host TV performs the reveal: every player's real opinion flies in as a dot, the true-average line drops, and each player's guess marker lands beside it.

Private vs shared: each phone privately shows its two sliders in sequence; the host TV shows only the prompt during play, then the full reveal + ranking. Per-phone privacy is the entire engine — if opinions were public (one passed phone, or a shared screen), predicting the average would be trivial and the game would collapse.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{prompt, opinions:{pid->0..100}, guesses:{pid->0..100}, phase}`. Two barrier phases (OPINE, GUESS) each wait for all submissions before advancing. Server computes mean and `score = round(100 - |guess - mean|)`. Real-time sync is trivial (small integers). The genuinely hard part is not sync but prompt calibration: prompts must reliably split the room so the average lands interestingly mid-spectrum — a prompt where everyone answers 100 is a dead round. This needs a hand-curated, deliberately divisive prompt set.

## v1 scope
- 4 players, one prompt, one round
- Two hidden sliders per phone (opinion, then average-guess)
- Absolute-distance scoring
- Minimal host reveal: dots, the true mean line, and a ranked list

## Out of scope
- Multiple rounds, prompt categories/packs, live-visible dial dragging, tie-break rules, custom prompts

## Risks & unknowns
- Unanimous rooms make guessing trivial and boring
- Anchoring — players' average-guesses correlate with their own opinion
- Prompt quality is make-or-break; bland prompts kill it

## Done means
Four phones each set a hidden opinion, then a hidden average-guess; the server computes the true mean; the host reveals every real opinion plus the average and ranks all four players by guess accuracy — all in a single round.
