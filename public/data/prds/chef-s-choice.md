## Overview
A 3–5 player betting game played over a real table of snacks. The shared screen is the menu; the phones are private dossiers, private serves, and private wagers. You never choose your own food — you choose someone else's, and you get paid on how accurately you predicted their reaction. For groups already staring at a takeout menu or a bag of gas-station snacks.

## Problem
Deciding what a group eats is the most passive, lowest-stakes negotiation there is: someone reads a menu aloud, everyone says "I'm easy", and the food arrives to no one's surprise. Meanwhile the room is quietly full of information — who's a coward about spice, who says they like anything and doesn't — and none of it is ever worth anything.

## How it works
**Setup (60s, private).** Each phone answers three taste questions in private: one food you'd never finish, sweet or salty right now, one texture you can't stand. The server shreds these and redeals: each player receives exactly **one** other player's **one** answer as a Dossier card. You have hard edge on exactly one person. You do not know who holds edge on you.

**The menu.** The host screen lists 8 numbered items physically present on the table, typed in by the host.

**The serve (simultaneous, private).** Every phone privately picks one item and one other player to receive it — a Serve — and privately stakes 1–3 points on the rating that player will give it, 1–5. All phones submit at once.

**Reveal.** The host screen draws the serve graph: who fed whom what. Nobody's stake or predicted rating is shown yet. Now, with serves public, each phone may place one **side bet** on somebody else's serve — a rating call, stake 1.

**Eat.** Ninety seconds. Each eater rates privately; the host reveals all ratings simultaneously. Exact call pays stake ×3, off-by-one pays ×1, off-by-two-or-more pays −stake. Declining to eat scores the item a hard 1, so serving something genuinely vile is not free money — you had to have bet the 1. The Bullseye bonus: serve someone the exact thing their own Dossier says they hate, and call it inside one, for double.

## Technical approach
Host tab plus phone PWAs on one PartyKit room. Model: `Player{id, name, tasteAnswers[3], dossier:{aboutPlayerId, text}, score}`, `MenuItem{id, label}`, `Serve{fromId, toId, itemId, calledRating, stake}`, `SideBet{fromId, serveId, calledRating}`, `Rating{playerId, serveId, value}`.

The DO owns two things clients cannot be trusted with: the dossier redeal (a derangement — never hand a player their own answer, and prefer not to hand two players facts about the same target) and phase gating. Everything interesting is a simultaneous-commit phase, so the server buffers submissions and only broadcasts on the last arrival or timer expiry — no partial leakage, no advantage to the fast phone. Sync is simple; the genuinely hard part is the **redeal fairness constraint** with 3 players, where derangements are nearly forced and edge distribution gets lumpy, plus the fact that a real human eating is an unbounded-latency operation the timer has to survive gracefully.

## v1 scope
- 3 players, one round, 8 menu items typed by the host, ~6 minutes
- Three fixed taste questions, one dossier card each
- One serve per player, one side bet per player, ratings 1–5, stakes 1–3
- Host screen: menu, serve graph, simultaneous rating reveal, score bars, dossier reveal at the end

## Out of scope
- Real restaurant menu import, delivery integration, photos of the food
- Multi-round, dietary/allergy safety logic beyond a hard "decline" button, persistent taste profiles across sessions
- Any scoring subtlety beyond exact/near/miss

## Risks & unknowns
- Requires physical snacks on a table; the game has an inventory dependency no other party game has.
- Allergies make "serve someone something awful" genuinely risky — the decline button must be one tap and unpunished for the eater.
- Three players may be too few for the dossier edge to feel secret; with 3 the deal is close to forced.
- Eaters may perform a rating for laughs rather than report honestly, which mostly helps but breaks the Bullseye.

## Done means
Three phones, eight real snacks, one round played end to end. The server-side deal never gives a player their own taste answer (asserted in a unit test over 10,000 shuffles). No phone can see another's serve, stake, or dossier before its reveal phase, verified from captured socket traffic. All ratings reveal in one frame on the host. Final scores reconcile by hand against the stated payout table, and in playtest at least one player used their dossier to deliberately serve a landmine.
