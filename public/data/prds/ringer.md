## Overview
Ringer is a text party game for 4–6 people who know each other. There is no leaderboard. The keepsake is a printable 'yearbook page' of anonymous quotes. The personal win condition is disguise: you succeed by disappearing into someone else so well that the room mistakes your words for theirs.

## Problem
Quiplash rewards being the funniest and getting *credited*. Ringer inverts both: the joy is impersonation and blending — nailing a friend's cadence well enough to fool everyone — and the reward is a shared artifact plus the quiet satisfaction of not being spotted as the author.

## How it works
Each phone is privately, secretly assigned a TARGET — another player (a derangement, so never yourself). Everyone sees the same neutral prompt: 'Write your yearbook quote.' You write it in the *voice* of your secret target. All players write simultaneously and blind.

The host posts every quote anonymously, shuffled, with no authors. Then a private guess phase: each phone independently assigns every quote to the player it sounds like. You 'pass' (win) if a majority attribute your quote to your assigned target — you vanished into them and stayed anonymous as its true author. There is no points tally; instead the host reveals a warm 'the room saw you as…' mapping, then renders the full page — quotes plus the guessed attributions — as a saveable keepsake.

PRIVATE per phone: your secret target, your draft, and your attribution guesses. SHARED on host: the shuffled anonymous quotes and the final printed page. Simultaneous secret targets and simultaneous private guessing cannot survive a single passed-around phone — that's the load-bearing asymmetry.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { players, targets:{pid:targetPid}, quotes:{pid:text}, guesses:{pid:{quoteId:guessPid}}, phase }. Real-time demand is light — the game is phase-gated (assign → write → post → guess → reveal). The hard parts are: computing a fair derangement for target assignment, presenting shuffled quotes without leaking submission order or authorship (stable random IDs, server-side shuffle), and computing the 'passing' outcome from private guesses. Keepsake render: host composites an SVG/printable page for download.

## v1 scope
- 4 players, one prompt
- Derangement target assignment
- Write → shuffle-post → one private attribution pass → reveal 'who passed'
- Host renders one downloadable yearbook page

## Out of scope
- Multiple rounds, custom prompts, images, running history
- Spectator voting, tie-break scoring

## Risks & unknowns
Requires familiarity — flops with strangers; impersonation can feel mean, so keep the prompt gentle; a 4-player derangement is a small space and targets may be guessable. Open question: is 'passing as your target' legible enough to players as a win, versus reading like a hidden scoreboard?

## Done means
Four phones each receive a distinct secret target, write blind, the host displays four anonymous quotes, each phone privately submits attributions, the host reveals who 'passed' and renders a saveable yearbook page — with no points shown anywhere.
