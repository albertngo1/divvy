## Overview
Winner's Curse is a 3–5 player party auction that stages a real economics phenomenon as a punchline. There is one mystery lot on the host TV — a jar of coins, a vintage gadget, a bag of marbles. Nobody knows its true dollar value. Each phone privately holds one partial clue. Everyone submits a single sealed bid at once; the top bid wins and pays it. The joke lands at reveal: the winner is almost always the person whose private clue was the most flattering, so they overpaid. It's a laugh, a gut-punch, and a lesson in one round.

## Problem
Hidden-information auctions are gorgeous in theory and miserable at a physical table: a moderator has to whisper a different clue to each player, collect written bids on slips, tally, and reveal — while everyone peeks. The asymmetry that makes it fun is exactly what makes it unplayable in person. Private phones erase the bookkeeping and make the secrecy free.

## How it works
The host screen shows the lot photo, a countdown, and nothing else — no clues. Each phone PRIVATELY shows one clue fragment: player A sees "more than 40 coins," B sees "mostly pennies and dimes," C sees "the jar is 14 cm tall," D sees "about ⅓ empty." Each clue alone is optimistic-or-pessimistic and misleading; together they pin the truth. Every phone has a bid slider ($0–$50) and a lock button. Bids are simultaneous, blind, and unchangeable once locked. When all lock, the host dramatically reveals: each player's clue, everyone's bid, the winner, the TRUE value, and the winner's profit (usually negative). A one-line verdict fires: "You won! You lost $6."

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room { lotId, trueValue, clues[], phase }`, `Player { id, clue, bid, locked }`. Flow is turn-gated, not tick-synced, so sync is easy: server holds `trueValue` and each private `clue`, sends each phone only its own clue, collects locked bids, and broadcasts the reveal only once every player is locked (or a timer expires). The genuinely hard part is content, not networking: authoring lots whose true value is deterministically computable and a clue set that is individually biased but jointly sufficient — and calibrating so the winner's curse actually bites most rounds. A tiny hand-authored lot library covers v1.

## v1 scope
- 3–4 players, exactly one lot, one sealed-bid round.
- Four hand-authored clues + one known true value.
- Slider bid, lock, reveal screen with profit + verdict line.

## Out of scope
- Multiple rounds, running bankroll, leaderboards.
- Dutch/ascending/second-price variants.
- Procedurally generated lots.

## Risks & unknowns
- If clues are too transparent, everyone bids the same and the curse vanishes; needs playtesting the bias.
- Winner's-curse framing may feel bad-not-fun if it's punishing every time — tune so honest bidders occasionally profit.

## Done means
Three phones each see a different clue, submit blind bids, and the host reveals a winner whose bid exceeds the true value in a majority of test rounds — with no clue ever visible to a non-owner before reveal.
