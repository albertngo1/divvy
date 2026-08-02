## Overview
Even Money is a 4-player bookmaking game played over a real menu on the TV. One player is the Book: they see an item's true price and set the over/under line. The other three bet against that line, each holding a different private scrap of evidence. The Book's goal is not accuracy — it is to divide a room they cannot see.

## Problem
A menu is the most-stared-at and least-interesting object at any table. Price-guessing games fall flat because everyone guesses from identical information and the answer collapses to one number. And every betting party game casts the players as bettors; nobody has made the bookmaker the player, even though setting a line that splits a room is the harder and far more social job.

## How it works
The host TV displays a photographed menu with one item highlighted and its price blacked out. Three items per game.

**The Book (private phone):** sees the true price and a line slider. Submits blind, on a 25-second shot clock.

**Each Bettor (private phone):** is dealt a *different* evidence scrap for that item — "the calorie count is 890", "the item directly below it is $14", "this sits in the menu's top-right block". They never learn each other's scrap. Then a sealed OVER/UNDER plus stake.

**Host TV:** item, line, countdown, and a "2 of 3 locked" strip — progress without sides.

Settlement reveals the true price. Bettors on the right side are paid even money by the Book; the wrong side pays the Book. A 3-0 crowd that is right ruins the Book; a 3-0 crowd that is wrong makes their night; 2-1 is a near-wash. So the Book must choose: shave toward balance for safety, or gamble on knowing which way the room is wrong — without knowing what evidence they were dealt.

After three items, each Bettor privately guesses which scrap each other Bettor held. A correct guess steals chips from that Bettor.

## Technical approach
Host tab + phone PWAs + a PartyKit Durable Object. Model: `Room{code, phase, itemIndex}`, `MenuItem{id, imageCrop, truePrice, scraps[3]}`, `Line{itemId, value}`, `Scrap{itemId, bettorId, text}`, `Bet{bettorId, itemId, side, stake}`, `Guess{guesserId, targetId, scrapId}`. Menu content is an authored JSON pack (10 items from two real menus, price plus three scraps each); the host renders a cropped image region per item.

Strict phase machine: SETTING_LINE → BETTING → SETTLE. The hard part is not throughput but per-socket state projection: the server must build a distinct payload per connection rather than broadcasting one room state with client-side hiding, so `truePrice` never reaches a Bettor socket and no scrap ever reaches the Book's. Second problem is dead air while the room waits on the Book — solved by the shot clock, which auto-submits a default line at the item's price-band midpoint.

## v1 scope
- 4 players (1 Book, 3 Bettors), no role rotation.
- 3 items from one hardcoded menu pack.
- Flat 60 chips, stakes in units of 10, even money only.
- Three hand-authored scraps per item.
- One scrap-guessing round at the end.

## Out of scope
Uploaded menu photos, OCR, rotating the Book, variable odds or juice, more than 4 players, persistence, additional item packs.

## Risks & unknowns
Scraps must be genuinely diagnostic *and* genuinely conflicting, or the crowd goes 3-0 every time and the Book has no game — that is authoring work, not code, and it may not survive playtesting. Regional price intuition varies wildly, which can reduce the Book's job to luck. Three bettors allow only two possible splits, which may be too coarse a signal to reward skill.

## Done means
Four phones join; the Book sets a line on three items having never seen a scrap; each Bettor's phone shows one scrap and no other; a 2-1 split resolves to the Book netting plus-or-minus one stake; the TV shows true prices and a final chip ledger; and a socket log confirms no Bettor connection ever received `truePrice`.
