## Overview
Baton is a physical hot-potato relay for 3-6 players in one room. A single invisible baton exists at any moment, held by exactly one phone. Passing it isn't a tap on a shared screen — you throw it *through the air* as a sound, and the nearest phone catches it. It's for a rowdy living-room crowd that wants to be out of their seats.

## Problem
Hot-potato apps degenerate into passing one phone hand-to-hand, which is slow and cheat-prone (people stall). The itch: make the pass a genuine physical event tied to where bodies actually are in the room, using hardware nobody games with — the speaker and mic as a short-range channel.

## How it works
The host TV shows the room roster, a big countdown timer, and a live 'baton trail' of who has held it. Every phone runs silently until it holds the baton. **Privately, only the holder's phone** turns hot: it vibrates, glows red, and shows a giant THROW button. Everyone else's phone shows 'listening…' and is secretly running its mic.

When the holder hits THROW, their phone emits a short, near-ultrasonic chirp at its own assigned frequency. Every other phone's mic measures how loud that chirp arrived. Loudest = physically closest = catcher. The server hands the baton to that phone; it lights up and the trail extends on the TV. You keep flinging it away from yourself; whoever is holding it when the timer expires loses the round. Because you must be *near* your intended catcher to reliably reach them, players cluster, dodge, and reposition around the room — the furniture is the board.

**Per-phone is load-bearing:** the baton's location is private to one device, and a catch requires every other phone listening *simultaneously* and reporting independently. A single passed-around phone cannot be both thrower and the field of catchers.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room { players[], batonHolderId, timerDeadline, roundState }`; each player gets a unique chirp frequency (e.g. 17.5–19.5 kHz, spaced). Messages: `throw{fromId}`, `chirpHeard{fromId, magnitude}`, `batonAssigned{toId}`. On THROW, the holder broadcasts intent; the server opens a ~300ms consensus window, collects `chirpHeard` magnitudes from all non-holders (WebAudio `AnalyserNode` FFT peak-bin), and assigns the baton to the max reporter. The genuinely hard part: reliable near-ultrasonic across heterogeneous phone speakers/mics (rolloff varies wildly), rejecting the thrower's own echo, and ambient noise — plus getting the consensus window tight enough to feel instant.

## v1 scope
- 3 players, one 60-second round.
- Single baton; audible chirp (~4 kHz) is an acceptable fallback if ultrasonic is flaky.
- Rule: holding the baton when the timer hits zero = you lose.
- Host shows timer + baton trail only.

## Out of scope
Scoring across rounds, multiple simultaneous batons, spectator mode, anti-cheat against fake `chirpHeard` reports, phone-to-phone data over sound.

## Risks & unknowns
Ultrasonic reliability on cheap Android; mic gating requires HTTPS + user gesture; two phones equidistant → tie-break; a whiffed throw (no one hears it) must safely bounce back to holder.

## Done means
Three phones in a room; the baton visibly hops from the throwing phone to whichever teammate is nearest ≥8 of 10 throws, the TV trail matches reality, and the holder at T=0 is correctly marked out.
