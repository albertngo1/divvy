## Overview
Make a Market gives one player the least glamorous and most tense seat at the table: the book. The group watches a clip on the TV; one player privately sets the odds on a prop before anyone else has seen it, and then takes the other side of everything the room throws at them. Everyone else races to get money down at a good price before the line moves.

For groups who enjoy a bit of arithmetic menace with their couch time.

## Problem
Betting games about a show are almost always "pick a side, house pays out." That's a coin flip with extra steps — the house is a script, so nobody is ever *responsible* for a price. The interesting decision in real betting isn't picking a side, it's pricing one. Nobody has put that seat in a party game, because it only works if one person's screen is completely different from everyone else's.

## How it works
1. Three phones, 100 chips each. One is designated THE BOOK (fixed in v1).
2. The TV pauses the clip at a decision point. **Privately, 15 seconds early,** the book's phone shows the prop text and a pricing dial: set a payout for YES and for NO. The UI constrains implied probabilities to sum between 1.00 and 1.40 and shows, live, two numbers the book alone sees — *your edge: 12%* and *most you can lose: 41 chips*. This screen is the game.
3. Prices publish to the TV. **Privately on the bettors' phones:** side + stake up to 30, then COMMIT. The price is locked at the moment they commit.
4. The TV shows only the money split bar and the current prices — never who bet or how much.
5. After 20s the book's phone gets ONE private offer: **move the line.** Costs 5 chips, applies only to bets placed after. Bettors get a final 15 seconds at the new price. Early confident money got the fat price; late money gets the corrected one.
6. The clip resumes, the prop resolves, and the book pays winners at their individually locked prices out of their own bank, keeping losers' stakes.

A single passed-around phone destroys this outright: the book would see every bet as it was placed, and the bettors' race for the pre-move price wouldn't exist.

## Technical approach
PartyKit Durable Object; host tab plays the video and heartbeats `currentTime`. State: `{bookId, prices:{yes,no}, priceVersion, bets:[{pid, side, stake, priceVersion, serverTMs}], banks}`.

The hard part is a genuine market-microstructure race: a bettor taps COMMIT at the exact instant the book moves the line, and the price they *saw* is no longer the price that *exists*. Every bet message carries the `priceVersion` the client had rendered. The server accepts a bet if the version matches current, or if it matches the immediately-prior version and arrived within a 400ms RTT-tolerant grace window (a "last look"); otherwise it rejects with a RE-QUOTE card on that phone showing old price vs new. Getting this deterministic — and legible to the person who just got re-quoted — is most of the build.

## v1 scope
- 3 players: 1 book, 2 bettors, roles fixed, no rotation
- One clip, one prop, one line move, one settlement
- Plain-language exposure line on the book's screen, no decimal-odds education
- Host screen: video, prices, money bar, result

## Out of scope
Rotating the book seat, multiple props, laying off risk, parlays, chip persistence between rounds, clip library, bettor-authored props.

## Risks & unknowns
- The pricing UI may read as homework rather than play; the fix is aggressive plain language ("pays 3 chips for every 2")
- With only two bettors the book has almost no order flow to react to, so the line-move decision may be flat — the mechanic may need 4+ bettors to sing
- The book may just always price maximum overround; needs a rule that a book earning zero action loses a small fee

## Done means
Three phones, one clip. The book sets a two-way price nobody else sees until publish, two bettors commit privately at locked prices, one line move re-quotes at least one late bet correctly, and the book's bank moves by exactly the hand-computed amount at settlement. A bettor who commits during the move gets either the old price or a clear re-quote — never silently the wrong one.
