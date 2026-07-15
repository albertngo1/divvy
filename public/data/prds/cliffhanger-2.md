## Overview
Cliffhanger is a 3-5 player betting game where the group watches a short clip on the shared TV that pauses right at the suspense beat — a marble run about to hit a fork, a will-it-float drop, a game-show wheel mid-spin. Each player then bets on the outcome, but everyone is holding a *different* secret piece of intel, and not all of it is true.

## Problem
Watching suspenseful clips is passive; "what happens next?" is a shrug you resolve in two seconds. Prediction games flatten to a coin flip when everyone shares the same information. Cliffhanger injects asymmetric private intel so betting becomes about *which of us got a real tip* and *who's confident enough to be trusted*.

## How it works
1. Host TV plays a clip and freezes at the cliffhanger, displaying the possible outcomes (e.g. A: left chute / B: right chute).
2. **Intel deal (private):** each phone is dealt exactly one secret card. Cards are mixed: genuinely predictive ("the left track is greased"), misleading red herrings ("gravity favors the right" — false), and pure flavor ("the marble is red"). Only you see yours. You cannot tell which type you got.
3. **Bet (simultaneous, locked):** each phone splits its chip stack across the outcomes. All bets lock at once; nobody sees another's wager.
4. **Reveal:** the TV plays the rest of the clip. Winning-outcome bettors split the pot parimutuel-style, so trusting a rare-but-true tip that others' false tips steered them away from pays huge.
5. Host TV shows every player's tip, their bet, and payouts — the fun autopsy of who got lied to.

PRIVATE per phone: your single intel card + your bet allocation. SHARED on TV: the paused clip, outcome list, lock progress, and post-reveal grid.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). The clip is host-local video, so there's no multi-device frame-sync problem. Data model: `Clip{id, pauseAt, outcomes[], correct}`, `IntelCard{text, type, biasesToward}`, `Player{chips, card, bets:{outcome:amt}}`. On round start the server deals one card per player from a hand-balanced deck and never broadcasts cards to other clients. Sync is trivial (bets + a reveal signal). The genuinely hard part is content: authoring clips with clean discrete outcomes and a *calibrated* tip deck where truth and lies balance so the game isn't solved — plus ensuring cards never leak over the wire.

## v1 scope
- 3-4 players, ONE pre-authored clip with two outcomes.
- One hand-tuned intel deck (1 true, 1 false, 1 flavor minimum).
- Single simultaneous locked bet, fixed chip stack.
- Parimutuel payout + reveal grid.

## Out of scope
- Reading anonymized live odds / a second bet round.
- Multi-round bankroll, clip library, user-uploaded clips.
- More than a handful of outcomes.

## Risks & unknowns
- Deck calibration: too many true tips makes it deterministic; too many lies makes it random.
- Replayability is low per clip (once solved, the tips are known).
- Card leakage would break the whole premise — server must gate strictly.

## Done means
Three phones join, each receives a different secret intel card no other phone can see, all lock hidden bets, the clip resolves on the TV, and the host shows correct parimutuel payouts alongside each player's revealed tip.
