## Overview

Silent auction party game inspired by tabletop classics like Modern Art, Ra, and No Thanks. Every round, an "item" comes up for sale (a category, a claim, a promise); each phone privately types a numeric bid within a budget; highest bid wins the item; second-highest pays their bid too (Vickrey-esque twist). Auction mechanics in person require secret bid tokens, tracking budgets, revealing tokens sequentially — all tedious. Per-phone: bids are actually secret, budgets auto-track, reveal is dramatic.

## Problem

Auction-heavy games are the hardest to bring to a casual party audience: they require paper-tracking money, hidden bid tokens, and complicated bidding sequences that gate the fun. Digital solves all three trivially, but no party game in the concurrent-room genre uses auction mechanics as the core loop. This leaves a genuinely fun kind of tension unexplored: "how much do I really want this? do I think anyone else wants it?"

## How it works

Room code join, 3-8 players. Each player starts with $100 budget (displayed only on their phone). Round: item card appears on all phones ("Right to name Marc's next pet", "the last slice of pizza", "control of the group chat's Spotify Wrapped"). 30-second private bid phase; each phone types a numeric bid within budget. Reveal: highest bid wins the item; both highest AND second-highest pay their bid (Vickrey-esque penalty for overbidding). Winner scores the item's "worth" (revealed only at reveal). Over 8 rounds, items with varying values (some known, some hidden), goal = highest net worth at end. Optional dramatic auction rounds: LLM auctioneer flavor text ("SOLD to the person with $47 remaining!").

## Technical approach

PartyKit / Durable Objects. Room state = `{budgets: {player_id: dollars}, current_item, bids: {player_id: amount}, items_won: {player_id: [items]}, round}`. Item deck hand-authored (~50 items with hidden worth). Bidding UI: numeric input + submit. Reveal animation: bids display ascending. Optional LLM (Haiku) generates auctioneer color text for reveal ("A bold play by Marc at $30, but Emily takes it with $47 — a bargain!").

## v1 scope

4 players, 8 rounds, $100 starting budget, 50 hand-authored items with pre-set worths, second-highest-also-pays rule, no LLM auctioneer flavor, no whisper strategy phase. Score = net worth (item worth - money spent) at end.

## Out of scope

LLM-generated items or worths, auctioneer flavor text, whispered alliances, betting-on-bidding metagames, custom starting budgets, item preview UIs, historical stats, category-restricted rounds.

## Risks & unknowns

The "hidden item worth" is what makes the auction fun — knowing whether to bid $10 or $80 depends on estimating an unknown value. Balance is tricky: items whose worths are too obvious (from names alone) reduce the game to trivia; too obscure and players just bid randomly. Playtest heavily. The Vickrey-esque "second-highest also pays" rule punishes over-bidding but may confuse first-timers — needs a clear reveal animation. Group with big-personality bidders may bid emotionally and drain their budget round 1; hard cap may be necessary. Item quality matters — "the last slice of pizza" only lands if the group actually has pizza.

## Done means

4 friends open the room, play through 8 rounds bidding on items, and finish with a scoreboard reveal. If at least one player gasps at the item's revealed worth and slaps their forehead over an overbid, v1 shipped.
