## Overview
Longhand is a 3-5 player keepsake party game for anyone signing a group card — a birthday, a farewell, a thank-you. Every player handwrites the same short greeting on their phone, and the shared artifact is a card composited from everyone's anonymous handwriting. You personally 'win' by making your own hand unrecognizable.

## Problem
Group cards are a chore: one card, one pen, passed around, and your scrawl instantly outs you. Longhand turns the awkward signing ritual into a two-minute game and produces a nicer keepsake than the pen-passed original — while poking at the strange intimacy of recognizing a friend by their handwriting alone.

## How it works
The host TV shows a prompt everyone will write: e.g. "Happy Birthday, Sam" (the honoree can sit out or play). On GO, each phone shows ONLY a private blank canvas and the target phrase; players finger-write it simultaneously, blind to everyone else. Because it's simultaneous and private, you can't peek and copy — and you can't see how conspicuous your own loops are.

On submit, the host TV reveals all samples in an unlabeled shuffled grid. Now the deduction round: each phone privately shows the grid with player-name buttons and asks you to attribute every sample you didn't write to a player. You score nothing for guessing right — instead, each sample that NObody correctly attributed to its author is a 'clean' anonymous hand, and its writer 'wins' that round. The host then composites the samples onto a single card layout (a printable PNG the honoree keeps). Optional: writers who stayed anonymous get a tiny star beside their line only after the card is saved.

The private canvas is load-bearing: pass one phone around and writing becomes sequential and visible, killing both the blind-disguise tension and the simultaneous reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). Data model: Room{code, phrase, phase, players[]}; Sample{playerId, strokes:[[{x,y,t}]], w,h}; Guess{fromPlayer, sampleId, guessedPlayer}. Canvas captured as normalized stroke arrays (not bitmaps) so the host can re-render crisply at print resolution and vary line weight. Sync is turn-gated by phase (write → reveal → attribute → composite); only the write phase has real-time pressure and even that is just a countdown, so latency is a non-issue. Genuinely hard part: fair, legible compositing — auto-scaling wildly different sample sizes into a balanced card grid, and computing the anonymity result (a sample is 'clean' if <50% of other players attributed it correctly).

## v1 scope
- 3-4 players, one fixed phrase entered by host
- One write round, one attribution round
- Stroke-based canvas, black ink only
- Host composites a simple 2x2 grid card, Download PNG button
- Anonymity result shown as stars

## Out of scope
- Multiple pens/colors, stickers, layout themes
- Multiple rounds or scoring history
- Printing/mailing integration

## Risks & unknowns
- Finger-writing is ugly; may need a smoothing pass so samples look charming not sloppy
- Small groups make attribution too easy — anonymity may be rare with 3 players
- Honoree participation logistics

## Done means
Three phones write "Happy Birthday, Sam" simultaneously and blind; the host shows an unlabeled grid; each phone submits attributions; the host renders and downloads a composited card PNG and marks which writers went unidentified.
