## Overview

A group watches a short video clip on the TV. A live prop market runs alongside it on the same screen. Every phone has been privately dealt exactly one fact about what's coming. For groups who already watch things together and narrate at the screen — this weaponizes the narration.

## Problem

"Bet on what happens next" apps collapse into trivia: everyone has identical information, so the sharpest guesser wins and there's nothing to read. Watching together is passive precisely because nobody has an edge over anybody. The itch is wanting a table where somebody at it *knows*, and the fun of figuring out who.

## How it works

Host loads a clip with three pre-authored propositions ("Does the phone ring before the scene ends?", "Is the money actually in the bag?", "Does anyone leave the room?"). Before playback, each phone is privately dealt **one** fact card from a hand-written deck. Some are decisive ("the bag is empty"), some are noise ("this was shot in Toronto"). You are never told which kind you got.

Playback runs; the market is open the whole time.

- **Each phone shows privately:** your one fact card, your cash, your position in each market, and BUY/SELL on each proposition at the current price.
- **The host TV shows:** the clip, the three live prices, and an anonymized tape — "SOMEONE bought YES at 41¢" — with no names attached.

The engine is price impact. Slam YES on the proposition your card decides and the price jumps on the shared screen; everyone else immediately front-runs the move, and your edge evaporates into their pockets. Holding your fire keeps the secret and earns nothing. The skill is disguise: scaling in slowly, or selling into a rally you caused. At clip's end the host resolves each proposition and positions settle at 100¢ or 0¢.

## Technical approach

PartyKit Durable Object per room, authoritative. Rather than a real order book (hopelessly thin at four players), the server runs an **LMSR automated market maker** with fixed liquidity parameter b, so there is always a counterparty. State: `room {clipId, phase, markets:[{propId, qYes, qNo, b}], players:{id, cash, holdings, factCardId}}`. Phones POST `{propId, side, size}`; the server prices via the LMSR cost function, debits cash, and emits a redacted tape event.

Video sync is deliberately dodged: the host tab is the *only* playback surface, phones never render video, so there is no multi-device A/V alignment problem — just a `currentTime` heartbeat used to freeze markets at preset timestamps.

The genuinely hard part is the **anonymity/latency tradeoff**. If the tape prints instantly, everyone in the room watches a fill land at the exact moment a thumb lifts off a screen, and anonymity dies to physical observation rather than to the game. So the tape batches trades into 2-second windows with shuffled ordering, and prices step only at window close. That lag is load-bearing and needs real tuning — too long and the market feels dead, too short and it's a lie detector.

## v1 scope

- One hardcoded 4-minute clip (public-domain or user-supplied file)
- Three propositions, hand-authored
- Exactly 4 players, one round, no lobby, no rejoin
- Six-card fact deck, one card each
- LMSR with b fixed by hand; no shorting limits, no margin
- Host resolves with three toggles and a Reveal button

## Out of scope

Any content pipeline, live TV or sports, multi-round play, spectators, ML auto-resolution, cross-session scoring, more than one market maker tuning knob.

## Risks & unknowns

Content treadmill is the existential one: every clip needs hand-authored propositions *and* a matched fact deck, and that authoring may be the entire cost of the product forever. Clip licensing. Four minutes may be too short for a price to develop legibly. Biggest behavioral risk: people just watch the show and forget to trade.

## Done means

Four phones, one clip. A player who held a decisive card finishes net-negative because their first trade leaked them — and the table can point at the exact print on the tape where it happened.
