## Overview
A prop-bet party game for 3-5 people watching one short video clip together on a shared screen. Each player holds a private betting slip of prop cards; the fun is deciding, second by second and alone, exactly when to cash each one out.

## Problem
Watching things together is pure passive consumption, and 'second screen' apps just bolt trivia onto it. Yet groups already do this instinctively — 'five bucks says he drops it.' There's no game that turns those gut prop bets into a structured, private, high-tension competition where your slip is yours and nobody else's, watched against a screen everyone shares.

## How it works
The host TV plays a curated 60-90s clip (a cooking-fail montage, a nature-doc hunt, a game-show round). Before it starts, each phone is privately dealt a DIFFERENT hand of 4 prop cards drawn from the clip's authored event pool — 'someone says "oh no,"' 'a dog appears,' 'something breaks.' No two players hold the same slip, so everyone watches the same picture while privately scanning it for their own cues.

Each card is dormant (worth zero) until its event actually occurs in the clip. The instant it fires, the card ACTIVATES: its multiplier spikes and then decays back toward zero over ~4 seconds. You must tap CASH OUT during that decay window to bank it — cash too early (before it fires) or miss the window entirely and you get nothing. The cruelty: two of your cards can fire at once and you can only tap one at a time.

PRIVATE on each phone: your 4 cards, their live states (dormant / active-decaying / spent), and your running bank. PUBLIC on the host TV: the clip itself plus anonymous 'cash-out' confetti pings when *someone* banks *something* — all FOMO, zero information about what or whose.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Model: Room{clipId, phase, players[]}; Player{id, hand:Card[], bank}; Card{propId, state, activatedAt, multiplier}. Each clip ships with a hand-authored event track [{propId, tOffsetMs}]. The host is the clock authority: it reports the real video.currentTime back to the server every 100ms, and the server derives all event activations and decay windows from that reported playhead — so buffering or a seek can't desync the betting from what people actually see. Cash-out is a client→server message; the server validates the card is inside its decay window using its own playhead (never trusting client time) and banks a server-computed multiplier. Hard part: keeping the host's picture and the server's decay math frame-aligned across a refresh or stall.

## v1 scope
- 3 players, one 60s pre-authored clip with ~8 events
- 4 cards per private hand, drawn from the 8
- activate → decay → cash-out, server-authoritative
- final bank screen with a winner

## Out of scope
- User-uploaded clips or automatic event detection (all events hand-timed in JSON)
- Multiple rounds or seasons, bankroll wagering, spectators, accounts

## Risks & unknowns
- Authoring accurate event timestamps by hand is tedious and brittle
- Decay window needs playtest tuning: too short = infuriating, too long = no tension
- The simultaneous-double-fire bind may feel unfair with only 4 cards

## Done means
Three phones join, watch one 60s clip on the TV, each sees a distinct private 4-card slip, at least one player successfully cashes a card inside its decay window, and the final banks differ across players and match a hand-verified event log.
