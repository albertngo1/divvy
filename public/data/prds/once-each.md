## Overview
A 150-second cooperative panic game for 4 players with phones and a shared TV. Orders live on other people's phones, so the room must shout to coordinate — but every content word you speak is consumed on utterance and can never be spoken by you again. By the ninety-second mark the room is running a factory on grunts, gestures and increasingly baroque circumlocution.

## Problem
Shouting games flatten into volume contests: the winning strategy is always "say the obvious thing louder." There's no reason to plan an utterance. The itch: make speech a scarce, *individually* metered resource so that choosing which words to burn — and on whom — becomes the actual game, and so that the room's language visibly decays into comedy over one round.

## How it works
Each phone privately shows three things: your console (four named controls), your outstanding ORDERS (each naming a control on someone else's console), and your LEDGER — a scrolling list of every content word you have already spoken, greyed out and dead.

Your phone's on-device recognizer transcribes only *you*. Every content word you utter is stemmed and burned to your private ledger. Function words (the, and, to, is, it, that, um) are free forever. Speak a burned word and the line stalls three seconds, the TV flashes a strike, and your phone buzzes.

The ledger is private, and that is the whole game. Nobody knows what anyone else can still say. "Can you still say VALVE?" is a legal, useful question that permanently costs you VALVE. Teams discover protocols under pressure: pointing, numbering, nicknames coined early and hoarded.

The TV shows the machine, the orders-completed counter, the clock, and one bar per player showing only *how many* words they have burned — never which. Watching a teammate's bar spike while they're mid-sentence is the room's shared tension.

## Technical approach
Host tab + phone PWAs + one PartyKit Durable Object per room (Socket.IO over Tailscale Serve as LAN fallback). Per-phone `webkitSpeechRecognition` runs locally; this is the load-bearing part — attribution of *who* said a word is impossible with one shared mic or a passed phone.

Data model: `Room { code, phase, clockEndsAt, machine, orders[] }`, `Player { id, controls[4], ledger: Set<stem>, burnCount, refreshUsed }`. Phones emit `{type:'utter', stems[], rms, seq}` every ~200ms; the server owns the ledger, penalty ordering, and a monotonic seq, and broadcasts 20Hz diffs to the host.

Genuinely hard parts: (1) interim-result instability — a stem must appear stable across two consecutive frames before it burns, or the recognizer's guesses eat your vocabulary for you; (2) mic bleed, where your phone transcribes your neighbor and burns *their* words onto *your* ledger, which feels like theft. Mitigation: lobby RMS calibration per phone, plus server-side arbitration — a stem burns only to the phone whose RMS is the argmax within a 300ms window. Non-ASR browsers fall back to a tap-to-spend mode over a 40-tile private lexicon.

## v1 scope
- One 150-second round, exactly 4 players, 12 orders, one machine graphic
- 4 controls per player; stems via a tiny Porter stemmer; 60-word function stoplist
- One REFRESH token per player, clearing 5 random burned words
- Chrome/Android + Safari/iOS 17; room code, no accounts, no reconnection

## Out of scope
Multiple rounds, difficulty ramp, per-round scoring history, spectators, non-English, custom lexicons, LLM-generated orders, replay export.

## Risks & unknowns
Vocabulary collapse may curdle from funny to miserable — the round length and REFRESH are the tuning knobs. Players may defensively mumble to avoid burning words, which kills the shouting; a loudness floor for burns may be required, or may make it worse. This sits adjacent to existing word-cost designs; the attrition-plus-private-ledger core has to carry the difference in playtest, not on paper.

## Done means
Four real phones, one 150-second round: ≥90% of deliberately repeated words are caught within 800ms, misattributed burns ≤1 per round, the team completes 12 orders, and at least one player is audibly reduced to pointing and noises before the clock ends.
