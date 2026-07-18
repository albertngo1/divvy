## Overview
Shortlist is a drafting party game for 3-4 players that abolishes turn order entirely. The host TV shows a shared market row; each phone secretly ranks the whole row as a wishlist, and the server resolves all claims at once via a single legible cascade. It's the snake-draft experience — the wheel, the sniping, the regret — with none of the sitting-and-waiting.

## Problem
Tabletop drafting is agonizingly serial: you wait three turns for your pick, the card you wanted wheels or doesn't, and everyone else's deliberation is dead time. "Everyone secretly rank, then we resolve" is the fair version, but adjudicating it by hand around a table is unbearable bookkeeping.

## How it works
The TV shows a market of six items (silly cards: "a goose", "one (1) crown", "blackmail material"). Each phone privately holds a secret scoring goal ("you score for animals", "you score for anything shiny") and privately drags the six items into a ranked wishlist — full order, blind, simultaneous. You also plant one single STAR on the one item you most refuse to lose.

When all lock in, the server resolves in one pass: each item goes to whoever ranked it highest; ties break in favor of a STAR; two stars on one item break by hidden random priority. Bumped players cascade to their next-available choice, deferred-acceptance style, until the market empties. The TV animates the cascade — item flies to a paddle, a bumped claim shoots to its next pick — anonymized until the final reveal, where goals and scores are shown. Phone shows your wishlist, your star, your secret goal; TV shows only the market and, at the end, the resolved allocation and scores.

Load-bearing: simultaneous full private rankings plus a hidden star plus asymmetric secret goals cannot live on one shared phone — the entire elegance is that nobody reveals preference order until resolution.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], market[], phase}; Player{id, goal, ranking[itemId], star:itemId, submitted}; Item{id, name, tags[]}. Sync: phones POST ranking + star; on all-submitted the server runs one deterministic deferred-acceptance pass and emits ordered cascade events for the TV. Hard part isn't twitch latency (it's a one-shot commit) — it's a resolution rule that is provably fair AND feels fair when animated: the cascade order and star tiebreaks must be reconstructable so a bumped player sees exactly why they lost an item.

## v1 scope
- 3 players, 6 fixed market items, one draft
- One secret goal card each, one star each
- Deferred-acceptance resolution with star tiebreak
- Animated cascade + final goal/score reveal
- Join by room code, no accounts

## Out of scope
- Multiple market waves, trading, custom items, chat, polished animation, spectators.

## Risks & unknowns
- The cascade may feel like a black box unless the TV clearly shows each bump's reason.
- One star may be too weak or too strong a lever — needs playtest tuning.
- Random goals could make some rankings trivially forced.

## Done means
Three phones join by code, each privately ranks all six items and plants one star, the server resolves a fair deferred-acceptance allocation with visible tiebreaks, the TV plays an anonymized cascade and then reveals goals and scores, and no phone ever sees another player's ranking or goal before reveal.
