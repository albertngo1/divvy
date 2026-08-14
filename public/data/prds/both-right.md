## Overview
A 4-player, six-minute hidden-role game for a living room with a TV and four phones. Every other imposter game asks "whose copy was doctored?" This one asks the harder question: nobody's copy was doctored. The imposter's private view is *perfectly accurate* — it just belongs to somebody else.

## Problem
The doctored-dossier genre has a built-in escape hatch: eventually somebody says a thing that is checkably false, and the deduction collapses into fact-checking. The interesting social moment — two people with identical, sincere, unfalsifiable claims, and a room that must still choose — never arrives, because the game hands the room a way to be right.

## How it works
The TV shows a five-step job briefing with every step blank: `1 _____ 2 _____ 3 _____ 4 _____ 5 _____`.

Each phone privately holds a **dossier**: one step number, one line of text for it ("Step 3 — the van leaves the loading dock at 11:40"), and two flavour details. The server secretly picks a **victim** and an **imposter**; the imposter's dossier is a byte-identical duplicate of the victim's. The imposter is told they are a copy. The victim is told nothing. Independently, each player has a 1-in-5 chance of being dealt a genuinely **blank** dossier — this is the noise that makes "I had nothing" a defensible sentence.

**Publish phase, 90 seconds.** Any phone may tap PUBLISH at any moment; the line lands on the TV under its step, stamped with who published it. Talking is unrestricted and constant. The imposter has three real lines of play: *blurt* (publish instantly so the victim is the one who looks like the echo), *mirror* (wait, publish second, and argue), or *vanish* (never publish, hide behind the blank-dossier alibi, and cost the room plan points).

When a step receives a second line identical to its first, the TV freezes into a **DUEL**: the two colliders' faces, the contested line, a 45-second clock. Only those two are allowed to speak. Every non-duelist's phone privately shows two buttons — the duelists' names — and they vote for who they think is the copy. The tally is hidden until the clock ends.

Room wins if the majority fingers the imposter. Imposter wins on a wrong finger, or on vanishing to the end with the plan incomplete and the room's blind end-vote missing them.

## Technical approach
Host browser tab + phone PWAs against one PartyKit Durable Object per room code. Server state: `{players[], dossiers (server-only), published[{step, text, byPlayer, tServer}], phase, duel{a,b,votes}, blanks[]}`. Phones receive only their own dossier — the imposter's copy is materialised at deal time, so there is no cross-client read path to leak through.

The genuinely hard part is the publish race. Whoever lands first owns the line socially, so the ordering must be authoritative and *felt as fair*: order by server receive time, never client clock, and when the gap is under 120ms the TV shows both stamps explicitly ("0.08s") rather than silently picking. Duel votes are write-once and only revealed on the host after the timer, so nobody bandwagons.

## v1 scope
- 4 players, one round, one hand-authored 5-step briefing deck (3 decks total).
- Deal, 90s publish, one duel, one vote, one result screen.
- Room code + name entry. No accounts, no reconnect, no lobby chat.

## Out of scope
Multiple rounds, scoring across games, more than one imposter, audio, spectators, the "vanish" endgame having its own dedicated vote UI (v1 reuses the duel vote screen).

## Risks & unknowns
The duel may be decided by charisma rather than tells — that is arguably the point, but if it's *only* charisma the game is Werewolf. The blank-dossier rate needs tuning; too low and vanishing is instantly damning, too high and the plan is never complete. Four players may leave too few duel voters (only two) — 5 may prove the real floor.

## Done means
Four phones and a TV, one deal, a real collision fires a duel, the room votes, and the host correctly names whether they caught the copy. In playtest, all three imposter strategies (blurt, mirror, vanish) are each observed at least once and each wins at least once.
