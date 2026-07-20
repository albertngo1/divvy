## Overview
Regift is a bluff-and-memory party game for 3–6 players — a phone-native riff on the passing-gift game *That's Not a Hat*. Face-down "gifts" travel around the table; each hand-off is a spoken claim that may be true or a bald lie, and you must call it or eat it. The TV shows only anonymous wrapped boxes and the public accusation log; each phone privately holds what *you* believe you're carrying.

## Problem
The whole game is hidden information that decays as gifts move — you saw your card once, then it got swapped, and now you're not sure. With physical cards, everyone at the table can glimpse them, and there's no ground truth to settle a challenge. Passing a single phone around is worse: it would expose every player's private card. Only per-phone secret state (plus a server that alone knows the truth) makes the bluffing honest.

## How it works
The server privately deals each phone one **gift** (an emoji item, e.g. 🧦). Your phone flashes it for 3 seconds, then flips it to a face-down box 🎁. On your turn (the TV highlights your seat) you hand your gift to a neighbor and *declare* what it is on your phone — choosing the truth or a decoy from a short list. The receiver's phone privately shows the claim: **"Maya gives you: 🧦 socks — accept or challenge?"**
- **Challenge →** the server reveals the true card on the TV. If Maya lied, she loses a token; if she was honest, the challenger loses one.
- **Accept →** you now hold that gift, still face-down, knowing only what was *claimed* — which may be a lie you'll unknowingly pass on.
Private per phone: your seat, your face-down box, and — only on your turn or when receiving — the declare/accept UI. The TV shows only wrapped boxes, whose turn it is, and the running challenge log. The truth lives only on the server.

## Technical approach
A Durable Object holds `{ seats, trueCards:{seat:item}, currentTurn, scores, log }`. Crucially, `trueCards` is **never** sent to clients except in a single reveal event during a challenge. Phones receive only their own seat state and the public log. Flow: turn token broadcast → giver's declare → targeted prompt to receiver → accept/challenge → server resolves against `trueCards` → broadcast log + score update → advance turn. Sync is turn-serialized, so contention is low. Hard part: airtight information hygiene — no true-card value may ever ride a websocket message to the wrong client — plus clean turn ordering and reveal-only-on-challenge semantics.

## v1 scope
- 3 players, ~6 gift types
- Private deal + 3-second peek, then flip to face-down
- One lap: each player takes exactly one give+declare turn
- Accept / challenge resolved by server truth on the TV
- Token scores + end screen

## Out of scope
- Multiple laps, action/special cards
- A "peek your own gift" move
- Animations, accounts, persistence

## Risks & unknowns
- With 3 players and one lap, memory load may be trivial — may need more swaps or laps to bite.
- Balancing lie-vs-truth incentives so bluffing is worth the risk.
- Declare-list UX: enough decoys to bluff without overwhelming.

## Done means
Three phones each get a distinct gift shown privately then hidden; one full lap of give-and-declare plays out with each accept/challenge resolved by server truth on the TV; scores tally on an end screen; and at no point does any client receive another player's true card except during an explicit challenge reveal.
