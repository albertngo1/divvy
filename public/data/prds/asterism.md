## Overview
Asterism is a concurrent-room party game for 3-6 people about silently agreeing on *a picture hidden in a field of dots*. Everyone sees the same nine stars; each person privately connects them into whatever shape feels obvious to them; the group wins when all of those private constellations become identical. It's for a living room with a TV plus a phone per player — a wordless 'we all saw the cat, right?' Schelling puzzle.

## Problem
Most 'match the group' games converge on a word or a number, which collapses to whoever shouts first or the safest cliché. There's no game about converging on a *shape* — the shared intuition that a scatter of points 'obviously' forms a sailboat. That itch (silent visual consensus) has no home.

## How it works
The host screen shows nine fixed dots in a fixed layout, a big Convergence meter, and — critically — the dots with faint lines drawn between them colored by *agreement* (an edge everyone drew glows bright; an edge one lonely person drew is barely visible). It never shows any individual's full drawing.

Each **phone privately** shows the same nine dots and nothing else. Tapping two dots toggles an edge on/off; you build your own constellation freely, retoggling as much as you like. You cannot see anyone else's edges — only your own lines and, glanced up on the TV, the anonymized agreement glow. So you're reading the room's emergent shape off the shared screen and silently steering your private drawing toward it: dropping the stray leg nobody else drew, adding the tail everyone clearly wants.

Win condition: all players' edge-sets become bit-for-bit identical and hold for 2 seconds. The host then reveals the agreed constellation, drawn bold.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { dots: [9 fixed points], players: { id: Set<edgeId> } }` where `edgeId` is a canonical sorted dot-pair (36 possible edges). Each toggle sends `{playerId, edgeId, on}`; server updates that player's set, recomputes a per-edge agreement count and a convergence score (average pairwise Jaccard over edge-sets), and broadcasts only the aggregate: per-edge brightness + meter + the single most-contested edge. The genuinely hard part is a convergence metric that *rewards partial progress and guides* without leaking any one player's exact drawing — solved by broadcasting only edge histograms (counts, never identities) and a scalar meter.

## v1 scope
- Exactly 3 players, one fixed 9-dot layout, one round.
- Win = identical edge-sets held 2s; then reveal. No timer, no score, no re-rounds.
- Host shows meter + agreement-glow edges + one contested-edge pulse.

## Out of scope
- Multiple layouts / random dot fields, difficulty tiers.
- Scoring, streaks, 'closest to consensus' MVP.
- Any labeling ('name the shape'), chat, reactions.

## Risks & unknowns
- The dot layout must genuinely *afford* one obvious shape; a too-symmetric field yields no Schelling point and stalemate. Needs playtested layouts.
- Agreement glow could let one holdout brute-force the group rather than converge — cap by requiring true identity, not majority.

## Done means
Three phones connect to one room; each independently toggles edges; the host glow updates live under ~150ms; when all three edge-sets match and hold 2s the host flips to a revealed constellation and declares a win.
