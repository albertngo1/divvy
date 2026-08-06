## Overview

A 4-minute betting game for 3–4 people that runs on top of a single song playing on the room's speaker. Each phone privately holds four prop cards about that song — things that will or won't happen before it ends. You didn't pick them, you can't discard them, and they settle automatically. The only agency you have is *trading them to each other while the song plays*, at prices set blind.

## Problem

Most "bet on the media" party games let you choose your bets, which turns them into trivia about the source material — whoever knows the song wins. The itch is the opposite: a market where you're stuck with a position you didn't want, and the fun is adverse selection. Also: background music is the most passively-consumed thing at any gathering, and nobody has made the background the board.

## How it works

1. **Deal (private).** Song starts. Each phone gets four cards, e.g. *"the word 'tonight' is sung again," "there's a full stop with no fade," "handclaps enter," "a key change."* Each settles +10 chips if true at song end, 0 if not. Only you see your card text.
2. **Public grades.** The host TV shows each player's hand as face-down tiles labeled only with a grade band — **A / B / C** — that reflects the card's *prior* odds, not its truth. So the room knows Priya holds an A and two Cs; nobody knows what they are.
3. **The floor (the song's runtime).** At any moment you can privately offer a card to one named player at 1, 3, or 6 chips. They see: the grade, the price, who's offering — never the text. Accept, and the card and its (unknown) fate transfer; the TV logs the trade publicly as `PRIYA → SAM · B · 3♦`.
4. **The trap.** Halfway through the song, that A-grade card about the key change is already dead and only its owner knows. Offering it cheap screams lemon. Offering it expensive screams bluff. Sitting on it screams nothing — which is also information.
5. **Settle.** Song ends. TV replays a marked timeline showing exactly which props hit. Chips are tallied per current owner.

## Technical approach

Host tab + phone PWAs + authoritative Socket.IO server behind Tailscale Serve. State: `{songId, tStart, cards: {id, text, grade, resolvesAt, truth}, ownerByCard, offers:[{cardId, from, to, price, expiresAt}], chips}`. Props are **pre-annotated per track** with timestamps, so settlement is deterministic — no room vote, no judge, no argument.

The hard part is a shared clock. Everyone must agree that the key change already happened before a trade lands, or the seller's advantage becomes a latency exploit. Fix: the *server* is the clock. Playback runs from the host tab, which heartbeats its audio `currentTime` every 250ms; the server timestamps every offer and acceptance against that authoritative song position, and any accept that arrives after a card's `resolvesAt` is voided rather than executed. Phones show a coarse progress bar only — they never drive timing.

## v1 scope

- 3 players, one hand-annotated 3-minute song, one round.
- Three cards each, all grade-B (no grade bands yet).
- Fixed 3-chip price — offer, accept, decline. No negotiation.
- Deterministic settlement from a hardcoded JSON of prop timestamps.
- Host tab plays a local audio file. No Spotify.

## Out of scope

Streaming-service integration, auto-annotation of arbitrary tracks, multi-song sets, counter-offers, short selling, spectator mode.

## Risks & unknowns

- Trading while listening may be too much divided attention in 3 minutes — the song might become wallpaper instead of the board.
- Content prep is the real cost: hand-annotating props per track doesn't scale past a demo playlist.
- With three players and no grades, offers may be too legible to be interesting.

## Done means

Three phones join, each holds three private prop cards on a locally-played song, at least one card successfully changes hands mid-playback with the TV logging it anonymously by text, a post-song trade lands after its prop resolved and is correctly voided by the server, and the final scoreboard credits every card to its owner at settlement.
