## Overview

A five-minute, one-round shopping standoff for 4 players. Everyone buys a gift for the same recipient. Fit earns points; duplication annihilates them. Two gifts that share a hidden category are *both* stamped RETURNED — zero, regardless of how perfect they were. For groups who like Wavelength but want the needle to punish agreement.

## Problem

Everyone read the same wishlist, saw the same reviews, heard the same offhand comment about being cold — and four thoughtful people independently buy the identical scarf. That's a real, extremely funny social failure driven by *shared evidence*, and party games never model it. They reward convergence: guess what they'd guess, match the room. This one makes correlated reasoning the trap.

## How it works

**Host screen:** a recipient card — "Aunt Deb" — showing exactly **2** of her 6 trait tokens (e.g. NEW PUPPY, HATES CLUTTER). The other 4 traits are dealt privately, 2 per phone, arranged so **every private trait sits on exactly two phones**. That's the collision engine: your best private clue is shared with exactly one rival, and you don't know which.

**Phone (private):** your 2 traits, plus a catalog of 6 gifts with visible names and prices and a *hidden* category tag (WARMTH, PLANTS, KITCHEN, COMFORT, PET, EXPERIENCE). Catalogs overlap by category but never by item name — your "chunky throw" and their "heated shawl" are both WARMTH, and neither of you can see that.

1. **Shop (45s):** pick a provisional gift.
2. **One word:** each phone types a single word. All four reveal **simultaneously** on the TV, attributed by name. This is the only channel — enough to stake a claim, enough to bait.
3. **Commit (20s):** switch or stand. No un-committing.
4. **Reveal:** fit = how many of Deb's 6 traits your gift's category serves. Then collisions resolve: any gift sharing a category with another player's gift is stamped RETURNED, scores 0, and the TV prints a literal gift receipt with both buyers' names on it. Highest surviving score wins. If everyone collided, Deb gets a gift card and nobody wins.

The two *public* traits shove all four players toward the same aisle. Dodging costs fit. Standing costs everything if you guessed the wrong rival.

## Technical approach

Host tab + phone PWAs + authoritative WS server (PartyKit Durable Object, or Socket.IO over Tailscale Serve). Sync is easy — this is a phase state machine with barriers, not a real-time game.

Model: `Round {traits[6], publicTraits[2], deal: playerId→trait[2], catalog: playerId→Item[6] {name, category, price}, words: playerId→string, picks: playerId→itemId}`. The server owns the trait→category fit matrix and **never** ships categories to clients; phones render names and prices only.

The genuinely hard part is not sync — it's the **deal generator**. It must guarantee: (a) every private trait appears on exactly two phones; (b) each player's locally-optimal item has a *different name* but the *same category* as exactly one rival's locally-optimal item; (c) at least one player has a genuinely viable second-best dodge, or the round is decided by the deal. Implement as rejection sampling over a hand-authored 24-item deck at room creation, rejecting deals that fail the checks. Second: the one-word broadcast must be buffered server-side and revealed on barrier — no typing indicators, no early leaks, timeout auto-submits a blank.

## v1 scope

- Exactly 4 players, room code, no reconnect
- One recipient ("Deb"), one fixed 6-trait set, one round, ~5 minutes
- 4 catalogs of 6 items, 6 categories, hand-authored
- Text only, no art beyond the receipt stamp
- Winner is a number on the TV

## Out of scope

Multiple rounds or recipients, a real player as recipient, generated or LLM-written catalogs, score history, 3/5/6 players, price as a spendable budget, the gift-card tiebreak animation.

## Risks & unknowns

Category collisions feel like cheating unless the tag is legible from the item name — "movie tickets" and "pottery class" both being EXPERIENCE must be obvious in hindsight or players feel robbed. The one-word channel may collapse into everyone typing the category name, which is fine (it becomes an open chicken standoff) but may resolve too cleanly to be funny. Four players may be too few for the every-trait-on-two-phones structure to breathe. If fit scores dominate, it degenerates into Wavelength — hence the collision penalty must be total (0), never partial.

## Done means

Four phones, one laptop, under six minutes: the TV prints at least one gift receipt naming two players who bought differently-named items in the same category, both scored 0, and the round was won by someone who deliberately bought a worse gift. At least one player says "I almost picked that."
