## Overview
Draw a Blank is a fast, loud Jackbox-shaped party game for 3–5 players riffing on Anomia — the game where a symbol match triggers a panicked race to name something in a category and your brain just... blanks. Draw a Blank makes the categories PRIVATE per phone, so nobody can see the tableau, and turns the opponent into your secret judge.

## Problem
Anomia is played with face-up cards on a table: everyone sees every category, symbol collisions are public, and it needs a physical deck plus honor-system judging. That's exactly the friction a phone can dissolve — and hidden categories add a whole new layer of "I can't even see what I'll be asked."

## How it works
Every player's phone PRIVATELY shows their single current face-up card: a **symbol** (one of ~6 shapes/colors) and a **category** (e.g. "a board game," "a river," "an 80s band"). The host TV shows only the pulse of the game — whose turn it is to flip, a running "blank meter," won-card counts — never anyone's actual card.

On each flip the server deals a new top card to one seat. The server (not humans) watches for a **symbol collision** between any two live cards. The instant two symbols match, both those phones DETONATE into a duel: your phone now privately shows *your opponent's* category — the thing you must name — while hiding your own. You blurt an answer out loud and slam a big **BLURTED** button. Here's the load-bearing twist: your *opponent's* phone is privately showing them your category and a thumbs up/down — **they judge you**, you judge them, simultaneously and privately. First player whose blurt gets an opponent thumbs-up steals the loser's card. Play to a small target, one duel proves it.

Privacy is the whole game: you never see the tableau, you can't pre-plan because you only learn the target category the moment the duel fires, and the judge role lives on a second private screen. A single passed phone literally cannot run a two-sided simultaneous duel.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Player { id, card:{symbol,category}, wonCards, role }`, `Duel { a, b, aJudged, bJudged, winner }`. Server owns the deck and does collision detection on every flip — this is the genuinely hard part: it must lock both duelists atomically, freeze all other flips, and race-resolve the two async thumbs verdicts (who steals if both blurt near-simultaneously) with server timestamps as tiebreak. Sync is otherwise discrete and low-rate (flip, detonate, verdict). Blurt content is judged socially, never parsed.

## v1 scope
- 3 players, ~20-card curated deck, 6 symbols.
- Private card per phone; server-side collision detect.
- Duel screen: show opponent's category, BLURTED button, private thumbs judge.
- First accepted blurt steals a card; first to 2 cards wins.

## Out of scope
- Wild cards / double-symbol cards.
- Voice recognition or auto-judging.
- Rematch flow, scoreboards, big decks.

## Risks & unknowns
- Simultaneous-blurt race feels unfair if verdicts arrive out of order — needs a crisp tiebreak rule.
- Reading a category off your phone the instant a duel fires may be too slow / disorienting (that might also be the fun).
- Social judging disputes when a blurt is borderline.

## Done means
Three phones each show a private live card, the server detects a symbol collision and detonates a duel on exactly the two involved phones, each duelist sees the opponent's category and privately thumbs the other, and the first accepted blurt transfers a card — all over the real WebSocket server on phones.
