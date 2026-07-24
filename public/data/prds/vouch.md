## Overview
Vouch is a competitive bluffing game for 3–5 players, a phone-native riff on *Cockroach Poker*. You pass a face-down "critter" card to another player while declaring what it is — truthfully or not. They must call your bluff or peek and pass it on with a fresh claim. Collect too many of any one critter and you lose. Each phone hides both your hand and, crucially, the true identity of the card in play.

## Problem
Cockroach Poker lives on a single load-bearing secret: the face-down card whose real type is known *only to whoever last held it*. Around a physical table cards get glimpsed, penalty piles are fiddly to track, and passing means literally handing the secret to someone. Phones make the secret airtight and count the penalties automatically.

## How it works
Each player holds a private hand (their phone only). The active passer taps a card, picks a target, and declares a type — this posts to the TV as a public claim: "Ada says: FROG." The target's phone privately shows two options: **CALL** (guess truth or lie) or **PEEK-AND-PASS** — secretly reveal the real card to *just them*, then re-declare a type (they may keep the lie, flip it, or tell the truth) and pass to a new target.

On a CALL the server reveals the real card on the TV. Guess right and the passer takes the card face-up into their penalty row; guess wrong and the caller takes it. The Nth card of any single type in your penalty row ends the round — you lose. Load-bearing privacy: currentCard.realType is transmitted ONLY to the current holder's connection and never appears in broadcast state. Each peek privately leaks the truth to exactly one new person. A shared phone would spill the secret to the whole room and collapse the bluff.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. Data model: Room { hands: {playerId: Card[]}, penaltyPiles, currentCard: { realType, claimHistory[], seenBy[] }, turn }. The hard parts: (1) **strict secrecy** — realType must never enter any broadcast payload or log, only a targeted message to the holder; (2) the **pass-chain state machine** — peek → re-declare → new target — with loop prevention so a card can't be passed to someone in seenBy. The TV renders claims and penalty rows but the hidden type until reveal.

## v1 scope
- 3 players, one round to a loser
- 3 critter types × 4 cards; lose at 3-of-a-type
- Actions: declare, call, peek-and-pass
- TV shows current claim + penalty rows + the loser reveal

## Out of scope
- Full 8-type deck, multi-round match scoring
- "Call your own bluff" and other variants
- Animations, emotes, rematch flow

## Risks & unknowns
- Peek-pass loop edge cases (everyone has seen it) need a fallback rule
- Any realType leak in state/logs breaks the game — needs audit
- The bluff loop is unfamiliar; players need a quick onboarding

## Done means
Three phones join, each seeing only its own hand. A declared card shows as a claim on the TV with its type hidden. A peek reveals the real type on exactly the peeker's phone and nowhere else. A correct call moves the card to the right penalty row on the TV, and reaching 3-of-a-type ends the round with the loser shown.
