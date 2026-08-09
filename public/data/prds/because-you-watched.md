## Overview

A 10-minute game for 4–6 people that runs *instead of* the argument about what to stream — and ends with the group actually watching whatever wins. Each player is secretly paid to get a specific title chosen, and separately bets on what the room will really pick.

## Problem

Browsing a streaming grid together is the most-performed, least-enjoyed group ritual there is: everyone reads the same shelf, nobody commits, and the loudest person decides. The shelf is already a shared screen and the phones are already out. Nothing in that ritual is private, and that's why it's dead air.

## How it works

Host screen: a shelf of 8 real titles with posters, arranged in three rows — **Trending Now**, **Because You Watched**, and **Buried**. Titles move between rows as the market moves them. The TV never shows who did anything.

Each phone privately shows: (1) your **Backing card** — one of the 8 titles, different for every player, worth a fat bonus if the room picks it; (2) 5 anonymous **boost tokens**; (3) your chip stack.

Round 1 (60 s): spend boosts. Boosts apply in a 4-second batch tick, so the shelf visibly re-sorts but authorship is unattributable — you see three things jump and can't tell if that was one player or three. Talking is legal and encouraged; lying about your Backing card is the whole point.

Round 2 (30 s): sealed wager. Each phone bets chips on which title the room will pick in the open vote. Payout is pari-mutuel off **boost volume** — a title with 9 boosts pays 1.2×, a title nobody touched pays 6×. This is the knot: every boost you spend on your own Backing card shortens its odds and destroys your wager on it, so the sharp play is to boost your card just enough to make it viable while quietly wagering on the ignored title you can feel the room drifting toward.

Open vote on the TV. Bonuses and wagers settle. The winning title actually plays.

## Technical approach

Host tab + phone PWAs + one Socket.IO room behind Tailscale Serve (or a PartyKit DO). Data model: `Title {id, poster, boosts, row}`, `Player {id, backingTitleId, tokens, chips, wager}`, `Room {phase, tickSeq}`. Titles and posters come from a static local JSON dumped once from TMDb — no live API at play time.

Sync strategy: the server holds all state; boosts are accumulated into a 4-second bucket and broadcast only as a re-sorted shelf, never as individual events. The hard part is the anonymity window — naive per-boost broadcast leaks authorship through timing, so the server must batch, shuffle within the batch, and animate re-sorts at a fixed cadence regardless of how many boosts landed. Second hard part: settlement must be computed server-side and revealed in one payload, or a fast phone can infer odds mid-wager.

## v1 scope

- 4 players, 8 hardcoded titles, static posters
- One 60 s boost round, one sealed wager, one open vote
- Backing cards dealt distinct; 5 tokens, 100 chips flat
- Settlement screen showing final odds and everyone's Backing card
- No actual playback integration — the winner is just announced

## Out of scope

Streaming-service integration, more rounds, spectators, personalized per-phone metadata layers, reconnects.

## Risks & unknowns

The two incentives (bonus vs. wager) may cancel into paralysis; bonus size needs tuning against long-shot payouts. Anonymous boosting may feel weightless if the shelf re-sorts too smoothly to read. And the room may simply vote for the funniest title regardless of the market, which is either a failure or the best joke in the game.

## Done means

Four phones join, each holds a different secret Backing card, boosts land anonymously on a batched tick with no phone able to attribute them, the shelf visibly re-sorts on the TV, and the settlement screen shows at least one player who won more from a long-shot wager than from their own backed title.
