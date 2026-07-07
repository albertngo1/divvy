## Overview
Compound is a loud, real-time cooperative word game for 4 players. Each phone privately holds one half of a compound word, and the room has to physically find its pairs by voice, against a meltdown clock.

## Problem
Word games are almost always turn-based and quiet. The itch: a simultaneous, physical, *noisy* word game where the room becomes a trading floor of half-words and you have to audio-hunt your complement while everyone else is doing the same.

## How it works
The host TV shows a **reactor** with a target number of bonds to form, a meltdown timer, and a running list of completed words for celebration. Each phone PRIVATELY shows ONE word-half — a **HEAD** (FIRE, MOON, SUN) or a **TAIL** (-FLY, -LIGHT, -BURN). To score a bond, a HEAD and a TAIL whose halves form a real compound word (FIRE + FLY = FIREFLY) must find each other by shouting their halves across the room, then BOTH tap BOND within a short window; the server checks the two halves compose a valid word from its dictionary. Ambiguity is the engine: FIRE pairs with FLY, WORK, *and* PLACE, but each tail can bond only once — so players negotiate live ("I need WORK, not FLY!"). Every successful bond re-deals a fresh half to both phones, racing to complete K bonds before meltdown.

Private vs shared: the host shows bonds completed, timer, meltdown gauge, and the celebratory word list; each phone shows only its single private half, its HEAD/TAIL role, and a BOND button. The voice does the finding; the taps confirm.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Player{ half, role }`, `Round{ target, done, dealsRemaining }`, plus a server-side dictionary of valid compounds. Because players never select each other on screen, pairing uses a handshake: each phone taps BOND, and the server pairs any two pending taps (one HEAD + one TAIL) landing within a 1.5s window, validates the composition, and on success increments the bond count and re-deals both phones; on failure it buzzes both with a small penalty. The genuinely hard part is this pairing handshake without on-screen player selection — voice does the matching, taps confirm — plus tuning the window so honest pairs reliably succeed while random taps fail, and disambiguating when two valid pairs tap near-simultaneously (queue by tap timestamp, one head resolves against the nearest pending tail).

## v1 scope
- 4 players (2 HEADs, 2 TAILs), one 90s round
- 12-word compound dictionary, target 4 bonds
- Re-deal on success; meltdown timer; win/lose screen
- Pairing by simultaneous BOND taps within 1.5s

## Out of scope
- Dictionary beyond ~12 words, 3+-piece words
- Proximity/NFC/QR bump detection
- ASR of the shouted halves, spectators, scoring meta

## Risks & unknowns
- The two-pending-taps pairing can mis-pair if two valid pairs tap at once — needs a disambiguation queue.
- Whether 4 players creates enough ambiguity to force negotiation.
- Compound-word validation edge cases (real compound vs. coincidental adjacency).

## Done means
Four phones each show a half; two players shout, both tap BOND within the window, and the host displays "FIREFLY ✓" while both phones re-deal; four valid bonds before 90s triggers a win screen, and an invalid tap-pair buzzes without counting.
