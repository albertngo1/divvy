## Overview
Unsigned is a 3–6 player cooperative writing game where the group produces one heartfelt anonymous letter — and the win condition is *staying anonymous*. Everyone writes a private slice; the group succeeds only if the finished letter can't be de-mixed back into its authors.

## Problem
Two itches. First: group cards always sound like a committee wrote them. Second: we love saying "that line is SO you." Unsigned turns voice-blending into the objective — can you write a sincere paragraph that sounds like *nobody in particular*? The tension between keeping the keepsake warm and keeping it voiceless is the game.

## How it works
The host picks a recipient/occasion ("a goodbye letter to Sam, who's moving away"). Each phone is PRIVATELY assigned one paragraph slot plus a tiny content nudge ("reference a shared memory," "wish them luck"). Everyone writes 1–2 sentences SIMULTANEOUSLY and blind — you never see another player's text.

The host assembles the paragraphs in slot order into one letter signed "— Everyone" and renders it as a keepsake PNG. Then the anonymity round: the host shows the paragraphs unlabeled, and each phone privately submits a full attribution ballot — guessing which player wrote each paragraph. The server tallies. The group WINS anonymity if total correct attributions land at or below chance (1/N per paragraph). If one paragraph gets over-identified, the TV says only "a voice leaked in paragraph 3" — never naming the exposed writer.

Each PHONE privately holds: its slot, its nudge, its own draft (hidden until reveal), and its secret ballot. The HOST shows the timer, the assembled letter, and the verdict.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). It's a phase state machine: `WRITE → ASSEMBLE → ATTRIBUTE → REVEAL`, each transition gated on all-submitted. Data model: `players[]`, `paragraphs{authorId, slotIndex, text}`, `ballots{voterId, guesses[]}`. Realtime demands are low — it's turn-based — so the hard part isn't sync; it's the anonymity scoring and its framing: computing a fair "≤ chance" threshold for small N and surfacing leaks without shaming anyone. Ballots and authorship never leave the server except as aggregate verdict, so no client can out a writer.

## v1 scope
- 3 players, one recipient, three fixed paragraph slots.
- Simultaneous blind text entry, one round.
- Assemble + export letter PNG.
- Private ballots, simple ≤-chance win/lose verdict.

## Out of scope
- LLM style analysis or auto-generated "voice" hints.
- Editing or seeing others' paragraphs before reveal.
- Multiple rounds, per-player elimination.

## Risks & unknowns
- At 3 players, voices may be too distinguishable for real anonymity — the sweet spot might be 5–6.
- A player writing an obvious in-joke outs themselves and tanks the group; framing must nudge toward blandness-as-teamwork.
- Writing takes time; the nudges must keep paragraphs short and on-tempo.

## Done means
Three phones write blind and simultaneously, the host assembles and exports the letter as a PNG keepsake, private ballots tally on the server, and the host shows a single at-or-below-chance anonymity verdict without naming any exposed author.
