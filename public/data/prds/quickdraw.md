## Overview
A fast, loud reflex word-duel for 4-6 players riffing on Anomia. Every phone holds a private hand, and duels ambush you the instant your hidden symbol collides with someone else's. For party groups who like Anomia's blurt-energy but want the tension to stay private until it detonates.

## Problem
Anomia's cards are face-up in a shared pile, so the whole table sees a match coming a beat before it lands and the two duelists get a public head start reading each other. The secrecy — the ambush — is gone. And a single device passed around the room can't create simultaneous private hands or surprise collisions; it collapses into slow turn-taking.

## How it works
Each player's phone privately shows ONE card: a colored symbol (from ~6 shapes) plus a category ("a breakfast food," "a US president"). Cards auto-advance every few seconds per phone, or on tap. The server tracks every phone's current symbol. The moment two phones show the MATCHING symbol, only those two players' phones flash red **DUEL** and reveal the *other* player's category. They race to blurt aloud a valid answer to the opponent's category; first to answer wins, loser taps "You got me." The host TV shows a giant "⚡ DUEL: Ana vs Ben" banner but NOT the categories — the audience watches two people scramble over secrets. Winner scores, both draw fresh cards, play continues under a 3-minute clock.

Private per phone: your symbol, your category, your duel alert, and the opponent's category on trigger. Shared host: room code, score bar, live duel banners, timer, winner reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {players[], scores, deckConfig, clock}`; `player {id, currentCard:{symbol,category}, state}`. Server owns every card; clients never see others'. Sync: on each auto-advance tick or tap, the client requests the next card, the server assigns it and runs a collision check across all active symbols, then locks any matched pair into a duel substate and pushes private `duelReveal` events. Hard part: collision detection + fairness under near-simultaneous advances — the server must serialize card assignment (a single-threaded DO actor helps), pick ONE canonical pair if three phones flash the same symbol at once, and debounce so a resolved duel's fresh cards don't instantly re-collide.

## v1 scope
- 4 players, one 3-minute round
- 6 symbols, ~40 category cards
- Auto-advance every 4s + tap-to-advance
- Verbal answers, self-reported winner
- Score bar + duel banner + final high score

## Out of scope
Automated answer validation, wild/double-symbol cards, teams, multiple rounds, spectator voting.

## Risks & unknowns
Self-reported winner disputes; simultaneous 3-way collisions; whether ambush tension survives without shared face-up cards; iOS PWA wake-lock so screens don't sleep mid-round.

## Done means
4 phones join via room code, each privately cycles cards, a symbol match fires a private duel on exactly the two matched phones within ~200ms, the opponent's category shows only to them, the winner scores, and a full 3-minute round completes with a correct final tally.
