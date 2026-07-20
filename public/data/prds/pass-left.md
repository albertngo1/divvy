## Overview
Pass Left is a 3-6 player concurrent-room game that captures the single most elegant tabletop drafting mechanic — simultaneous pick-and-pass ('booster draft': take one card, pass the pack) — which is fiddly and slow in person because everyone shuffles physical packs, hides fanned hands, and waits on the slowest picker. On phones it becomes instantaneous and perfectly private. Each player is secretly chasing a different scoring goal.

## Problem
Booster drafting is beloved but physically clumsy: passing stacks of cards around a table, protecting a hidden hand you can barely hold, and the whole room stalling on one indecisive person. The good part — everyone picking simultaneously from a hand only they can see — is exactly what private phones do effortlessly. The private, rotating hand is the entire point; a single passed phone can't reproduce four secret hands changing at once.

## How it works
The host TV shows only public, ambient state: a ring of players with a face-DOWN pile growing in front of each (a count, not contents) and a round timer. It never shows any card faces until the final reveal.

Each phone privately shows the HAND currently in front of you — say 5 cards — and a countdown. You tap ONE card to draft it (it drops face-down into your private tableau, visible only to you), and the instant everyone has picked (or the ~12s timer fires), each remaining hand slides one seat to the LEFT. You now see a new, smaller hand you've never seen before. Repeat until hands are empty. Crucially, every phone also privately holds a SECRET OBJECTIVE dealt at the start (e.g. 'most cards sharing one color,' 'a run of consecutive numbers,' 'avoid the three cursed cards'). You're reading the shrinking packs to guess what others are hoarding — and to hate-draft the card that completes their set.

At reveal, the host flips every tableau face-up at once, applies each player's hidden objective, and shows the scores plus who drafted the game's single most-contested card.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: Room{seatOrder, round, deadline}; Hand{ownerSeat, cards[]}; Player{id, seat, tableau[], secretObjective}. The server holds all hands and enforces the pass: a pick removes exactly one card from the seat's held hand and appends to that player's private tableau. When all seats have picked (or the deadline hits, auto-picking a random card for stragglers), the server rotates every Hand's ownerSeat by one and pushes each player ONLY their new hand over the private socket. The genuinely hard part is the simultaneous-pass barrier: picks must be atomic (no double-drafting one card), and the rotation must fire exactly once when the last of N picks lands OR the timer expires — whichever first — without a race where a late pick arrives during rotation. Server resolves by locking the round on the triggering event and dropping post-lock picks into the auto-pick path.

## v1 scope
- 3 players, ONE pack of 9 cards (three picks each), ONE draft.
- Three hand-authored secret objectives, one per seat.
- Face-down TV counts only; single flip-and-score reveal.

## Out of scope
- Multiple packs / multi-pack drafts.
- Card art or real card semantics beyond color+number.
- Trading, rare-drafting economy, running score across games.

## Risks & unknowns
- With only 3 cards each, is there enough draft tension? May need the 5-card starting hand to bite.
- Hidden objectives must be legible in one glance at reveal or the payoff falls flat.
- Timer length: too short frustrates, too long kills the simultaneity that makes it elegant.

## Done means
Three phones each draft three cards from rotating private hands they alone can see, the TV shows only face-down growing piles during play, and the final flip scores each player against a secret objective no one else knew — with the server provably never letting two players draft the same physical card.
