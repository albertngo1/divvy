## Overview
Face Out is a cooperative fireworks-building game for 3–5 players, a phone-native riff on *Hanabi*. Teammates race to play colored, numbered cards into ascending piles — but the twist that defines Hanabi is that you can see everyone's hand except your own. Face Out makes each phone the mask over its owner's cards while turning every other phone into a window onto that same hand.

## Problem
Hanabi's delight is reasoning about what your teammates know about the cards *you* can't see. In the boardgame you hold your cards backwards (awkward, easy to flash) and track clues by memory or fiddly tokens. It's the perfect information-asymmetry engine trapped in ergonomic friction. Phones dissolve both problems: perfect secrecy of your own hand, automatic clue bookkeeping.

## How it works
Each player is dealt a hand of 4 cards. Their own phone NEVER shows those 4 cards — only opaque slots carrying whatever clues they've received. Every OTHER phone privately renders that player's real hand face-up, with clue tags stuck to each card. The shared host screen shows only communal state: the five fireworks piles (highest value played per color), 8 clue tokens, 3 fuse tokens, and deck count.

On your turn (the TV names the active player) your phone offers three actions: **Give a clue** — spend a token, pick a teammate and one attribute (a color or a number); every matching card in their hand gets tagged on *their* phone only. **Play** — blind-pick one of your own hidden slots; if it extends a pile it lands, otherwise a fuse burns. **Discard** — return a token to the pool. Load-bearing privacy: each connection sees a genuinely different projection of the same table. A single passed-around phone is structurally impossible — the game *is* the difference between views.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: Room { deck, hands: {playerId: Card[]}, fireworks, clueTokens, fuseTokens, turnOrder, clueTags: {cardId: {color?, number?}} }. The genuinely hard part is **per-connection filtered views**: the server must never broadcast full state. Each socket receives all hands EXCEPT its own, plus its own hand as opaque slots carrying only received tags. On every action the server recomputes and pushes each player's personalized projection. Reconnection must restore the correct hidden view. Turn locking prevents two phones acting at once.

## v1 scope
- 3 players, one game to completion or bust
- Reduced deck: 3 colors × values 1–5 (Hanabi counts), 3 fuses, 8 clue tokens
- Three actions: clue / play / discard
- TV shows piles + tokens + deck count; final score on end

## Out of scope
- Full 5-color + rainbow variant
- Cross-game leaderboard, animations, undo, hints
- Spectators, custom deck sizes

## Risks & unknowns
- Filtered-view server logic is the whole ballgame — any leak of your own hand kills it
- New players find "can't see my own hand" disorienting; needs a 10-second onboarding
- Clue UI on small screens must make tags legible

## Done means
Three phones join; each sees the other two hands but only opaque slots for its own. A clue tags the right cards on exactly the recipient's phone. A correct play advances the TV pile; a wrong one burns a fuse. The game ends at 3 fuses or an emptied deck, and the TV shows the final firework score.
