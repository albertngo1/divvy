## Overview
Family Style turns the ritual of a group staring at a delivery menu into a private appetite market. The TV shows the menu and spotlights one dish at a time; each phone secretly does two things — votes whether *you'd* order it, and bets on how many people total will vote yes. It's for 3–6 friends deciding what to eat who'd rather compete than dither. (Bonus: you can actually order the winners.)

## Problem
Group ordering is agony — nobody wants to state a preference first, everyone defers, and the loud eater dominates. The real information (who quietly wants the dumplings) stays hidden until it's too late. Family Style surfaces that hidden appetite by making it worth money to predict, and makes your own secret vote a chip you can play.

## How it works
Each round the TV spotlights one dish (photo + name + price). **Phone (private):** a yes/no "I'd order this" toggle **and** a prediction — a number for how many of the whole room will end up yes (including you) — plus a fixed chip stake. You lock both secretly; nobody sees your vote or your guess. **TV (shared):** the dish, a countdown, and — after everyone locks — a satisfying tally animation revealing the true yes-count. Payout: whoever's prediction is closest to the actual count takes the pot (ties split). The reflexive twist that makes it a game and not a poll: **your own vote is part of the number you're betting on.** If you predicted "2" you might vote no to protect your bet even though you like the dish — or vote your heart and eat the loss. Over 4 dishes, chips accumulate; the TV crowns whoever read the table's stomach best, and shows the room's top-voted dishes as a de-facto order.

## Technical approach
Host tab renders the menu and the reveal; phones are PWA clients; an authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve) holds all hidden state. **Data model:** `Room{dishIndex, players:{id,balance}, submissions:{playerId:{vote:bool, guess:int, locked:bool}}}`. **Sync:** phones send `lockIn{vote,guess}`; server withholds every submission until all players are locked (or the timer fires), then reveals only the aggregate count + payouts — individual votes are never broadcast, which is the entire reveal and the reason it must be per-phone. **Genuinely hard part:** simultaneity and secrecy of the double-commit — vote and guess must lock together and stay invisible until the barrier clears, with a clean fallback for a player who never locks (auto-fold: no vote, no payout). Reconnects must restore a locked submission without re-opening it.

## v1 scope
- 3 players, one built-in demo menu of 4 dishes, one round per dish.
- Fixed stake, closest-guess-wins-pot, integer predictions 0–3.
- Join by room code; one device per player; no real ordering integration.

## Out of scope
- Importing a real restaurant menu or placing an actual order.
- Variable stakes, weighted payouts, multi-round bankroll tuning.
- Dietary filters, splitting the check, price-guessing sub-games.

## Risks & unknowns
- With 3 players the guess space (0–3) is tiny, so ties are frequent — may need a tiebreak (stake or speed).
- The reflexive vote-manipulation may feel confusing to first-timers; needs a one-line rule on screen.
- Fun depends on menu relatability; a generic demo menu may fall flat.

## Done means
Three phones join, a dish appears on the TV, all three secretly lock a vote and a count-guess, the reveal shows the true yes-count with no individual vote exposed, and the closest guesser's private balance goes up — verifiably, with a locked player's submission surviving a phone refresh.
