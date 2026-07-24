## Overview
Nightcap is a blind collaborative recipe-building game for 3-6 players. Each phone is privately assigned one structural slot of a cocktail and fills it without seeing any other slot; the shared TV assembles the pieces into a real (if unhinged) drink and prints it as a keepsake recipe card. No points — you win a cocktail you're now obligated to mix.

## Problem
Group creativity games end in a score and get forgotten; you leave empty-handed. And blind collaborative building — where you can't see the running result — has been done to death for STORIES but never for a RECIPE, where a fixed structure (spirit / sour / sweet / bitter / garnish) guarantees something drinkable even when the contents are pure chaos. Structure plus blindness is the untapped comedy.

## How it works
The host TV shows an empty cocktail spec: five numbered slots — Base spirit, Sour, Sweetener, Wildcard, Garnish — plus a Name. The server privately assigns each phone one or two slots. Each phone shows ONLY its own slot with a prompt ('You are the BASE — pick a spirit and an amount') and a free-text + quantity input. Everyone fills simultaneously, blind to every other slot. When all slots lock, the TV assembles the full recipe and animates a 'shake' — the first time the whole room sees the drink, since nobody saw the other ingredients. Then a fast group step: the TV offers three auto-generated names, or players privately submit a name and the group picks. Optional light anonymity beat: 'who added the pickle brine?' Keepsake: a styled recipe-card PNG — ingredients, steps, the group's chosen name, the date, and the party's first names — downloadable and printable.

Private per phone: your assigned slot + your entry, hidden from all. Shared TV: the empty spec, then the assembled reveal. Simultaneity and hidden slots are load-bearing — a single passed phone would spoil the surprise and let people quietly coordinate a 'sensible' drink, which kills the whole joke.

## Technical approach
Host tab + phone PWAs + WS server (PartyKit or Socket.IO over Tailscale Serve). Data model: Room {slots[], assignments{playerId:slotId}, entries{slotId:{text,qty}}, name, phase}. Server assigns slots on start, collects entries, gates the reveal behind an all-locked barrier, then broadcasts the assembled recipe. Sync is trivial; the genuinely hard part is the KEEPSAKE render — a good-looking recipe card generated client-side (HTML→canvas) with consistent typography, the group's names, and sane quantity formatting. The reveal timing needs a clean all-locked barrier so nobody sees a partial drink.

## v1 scope
- 3 players
- 5 fixed slots (each player takes 1-2)
- simultaneous blind free-text entry
- one reveal
- TV-suggested name pick
- PNG recipe-card export

## Out of scope
Ingredient autocomplete, unit validation, multiple drinks, the anonymity guess, real printing integration, multiple rounds.

## Risks & unknowns
Free text may produce something genuinely undrinkable (a feature, but prompts need tuning). The card's aesthetics carry the entire keepsake payoff — if it looks cheap, the game has no reward. Three players leaving slots doubled-up can feel lopsided.

## Done means
Three phones each privately fill assigned slots; the TV reveals an assembled recipe nobody fully saw; the group names it; and a printable recipe-card PNG downloads with every player's name and the drink's name.
