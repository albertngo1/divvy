## Overview

A 4-minute push-your-luck game for 3 players that steals the actual soul of a deckbuilder — you construct the randomizer, then you have to ride it — and squeezes it into one shared deck on the TV with secret authorship. Everyone draws from the same pile. Nobody knows who put what in it. Only you know your landmines.

## Problem

Deckbuilders are the best-loved genre that cannot survive a party: they're solitaire in parallel, forty minutes long, and all the interesting state is private math nobody else can see. Strip it to the one moment that's actually social — the deck betraying you — and make the betrayal authored by the person sitting next to you.

## How it works

**Setup (private, 60s).** Each phone shows a private pool of 8 cards: gains worth +2 to +6, and 2-3 BOMBs. Each player secretly picks 5 to shuffle into a communal 15-card deck. The TV shows only "2 of 3 sealed" and a growing deck stack. Nobody learns the total bomb count.

**The run (public).** The TV flips one card every 4 seconds into a shared POT. Gains add to the pot. The third bomb flipped ends the round and everyone still in scores zero.

**The private lever.** Every phone holds a BANK button, live at all times. Pressing it snapshots the current pot as your personal score and takes you out. The TV shows only how many torches are still lit — never who just bailed. Two multipliers make your private seed load-bearing: your own gain cards pay YOU double when they flip, so you want to stay in until yours appear; and your own bombs pay you a +3 bounty per player still in when they blow. So you seed a bomb, bank right before you think it's due, and get paid for everyone else's greed.

**Reveal.** The TV replays the deck in order with ownership colors: "you all died to Priya's bomb — she made 9 off it."

## Technical approach

PartyKit Durable Object per room, phone PWAs, host browser tab. `Deck: Card[]{id, kind, value, ownerId}` shuffled server-side and never sent ahead of the flip to any client, TV included beyond the current card. Flips are driven by a server loop on a fixed cadence with server timestamps; the TV animates, the phones show only the pot number and BANK.

The hard part is the race at the flip boundary. If a phone renders a bomb a beat before the server applies it, a fast thumb banks on information it shouldn't have. Two mitigations: phones never render card identity at all, only the pot integer; and the server hard-locks BANK input for 250ms around each flip resolution — a shutter. Simultaneous banks within a 150ms window resolve as a tie and share the same pot snapshot.

## v1 scope

- Exactly 3 players, one round, no series, no meta-progression
- 15-card deck, each player picks 5 from a private pool of 8
- One card flipped every 4 seconds, third bomb ends it
- Bank = snapshot pot, own-gain double, own-bomb +3 per survivor
- Ownership replay on the TV at the end

## Out of scope

Multiple rounds, card trashing, buying between rounds, card text or abilities beyond value/bomb, 4+ players, reconnect, spectators, animations beyond a flip.

## Risks & unknowns

Tuning is the whole game: if the pot grows too fast everyone banks at flip 5 and nothing happens; if bomb bounties are too rich, seeding three bombs dominates and the deck is unplayable. Seeding may read as homework rather than a decision — the pool of 8 must present real regret. Fifteen cards may end the round before tension builds. The 250ms input shutter may feel like a dropped tap; needs a visible shutter state, not silence.

## Done means

Three phones and a laptop. Each phone shows a distinct private 5-card seed. One round finishes in under 4 minutes. At least once, a player banks specifically because they know their own bomb is still in the deck — and the ownership replay at the end names the culprit out loud.
