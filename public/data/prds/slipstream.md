## Overview
A loud, twitchy Anomia riff for 4–5 people. Anomia's fun is the ambush duel and the brain-lock that follows. Slipstream keeps both but makes the ambush invisible: every player privately hunts exactly one other player, in a directed cycle nobody can see, and stealing requires slamming inside an 800ms window *after* your prey commits.

## Problem
Reflex party games flatten into pure reaction time — fastest thumb wins, and there's nothing to think about. Anomia solves this with recall panic but shows every card face-up. Slipstream adds a hidden predator layer, so the fastest move is often not to move: every point you take publicly marks you for someone who may already know your tell.

## How it works
Host screen: one noun at a time, ~1.4s apart, 60 nouns in 90 seconds. "CROWBAR." "MERINGUE." "AMBULANCE." After each word resolves, a one-line burst — `DANA +2` / `RAJ STOLE 2 FROM DANA`.

Each phone privately shows: your category ("things in a hospital", "things made of metal"), your prey's name and color, a full-screen SLAM button, your score.

Slam when a word fits your category: +2. Slam within 800ms after your prey's valid slam: you take 2 from them, regardless of your own category. Slam with neither claim: −1.

The Anomia bite: every valid slam puts you on the clock — the host screen prints `DANA — SAY ANOTHER` with a 3s countdown, and you must shout a second member of your category out loud. Fail and the +2 is voided. Succeed and you've just told the room, including your unseen hunter, what you're watching for. By word 30 a good hunter is pre-hovering their thumb on words that fit your leaked category.

Counterplay is baiting: slam a word that doesn't fit, eat the −1, and drag your hunter into a steal on an invalid slam — which also costs them −1. Steals are attributed publicly the instant they land, so hunt edges burn down over the round and the last 30 seconds are open warfare.

## Technical approach
Socket.IO server behind Tailscale Serve; host browser tab plus phone PWAs. Model: `Room{schedule:[{idx, word, tags[], revealAt}], categories{pid→catId}, hunts{pid→pid} (a derangement), scores{}}`, plus a slam log `{pid, idx, clientTs, adjustedTs}`.

The hard part is fairness. Phones run five ping-pongs at join to estimate offset and RTT; the server stores a per-client clock offset and phones render each word on the *synced* clock, not on packet arrival, so a player on bad wifi doesn't see CROWBAR 200ms late. Slams carry a client timestamp, get translated onto the server timeline, and the server buffers every slam for word N until `revealAt + 1600ms` before resolving — category hits first, then steals against the resolved valid-slam times. Late arrivals inside the buffer are accepted; anything after is dropped. The 800ms window is deliberately fat so jitter can't decide a steal. Clock drift over 90s and clients that lie about `clientTs` are the real unknowns; v1 clamps any adjusted timestamp that precedes its word's reveal.

## v1 scope
- 4 players, one 90-second round, one fixed 60-word list with hand-tagged categories
- 4 hardcoded categories, one server-generated hunt cycle
- Say-another adjudicated by the host laptop's spacebar: pressed = accepted, timeout = voided
- One score screen that reveals the full hunt cycle

## Out of scope
Speech recognition, multiple rounds, custom word packs, reconnect, more than 5 players.

## Risks & unknowns
The 800ms window may reward luck over read. Public steal attribution might collapse the hidden layer too fast at 4 players. The spoken-instance step could stall the stream's momentum.

## Done means
Four phones join, each sees a distinct category and one prey name; the word stream renders within 50ms of each other across all four phones under measured clock sync; a deliberate steal at ~500ms resolves as a steal while the same slam at ~1200ms does not; the end screen prints the hunt cycle and per-player point deltas.
