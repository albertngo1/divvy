## Overview
Quaff steals the oldest roguelike ritual — the terror of drinking an unidentified potion — and turns it into a competitive per-phone party game for 3-5 players. Every run the game secretly maps a handful of potion colors to effects; the mapping is the same for the whole party but hidden from all of them. The fun is that you each learn DIFFERENT pieces of that key by risking different potions, and then you get to lie about it.

## Problem
Roguelike item identification is pure private-knowledge drama, but it's a solo experience — the tension of "is the murky potion healing or acid?" is never shared. Quaff makes each player hold a different fragment of the truth, so the room becomes a market of honest tips and poisoned lies.

## How it works
The host TV shows a small dungeon floor: everyone's tokens, HP bars, a few wandering monsters, and a **boss blocking the only exit**. First adventurer to land the correct "caustic" potion on the boss slips past and wins the run.

Each PHONE shows PRIVATELY: your HP, your potion inventory (just colors — "2 amber, 1 violet"), and your personal **identification log** of what you've observed each color do. You act in real time: move, and either **quaff** a potion (effect applied to you) or **throw** it at a monster (effect applied to it). The result — heal, poison, blink, caustic — is revealed ONLY on your phone, adding a line to your private log. The TV shows only that "a violet potion shattered" with no effect named, so watchers can't free-ride your experiments.

Because colors are scrambled identically for everyone but each player has spent their scarce potions testing DIFFERENT colors, knowledge is asymmetric. Players shout tips across the couch — "amber is caustic, throw it at the boss!" — which may be true or a trap to make you waste your only amber.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve). **Data model:** server holds the secret `colorToEffect` map, `players: {hp, pos, inventory: Color[], log: {color,effect}[]}`, `monsters`, `boss`. Quaff/throw actions are resolved server-side; the effect result is emitted on a PRIVATE per-socket channel so only the actor learns it, while a redacted event ("violet shattered") broadcasts to the TV. Movement is real-time on a coarse grid with server tick reconciliation. The hard part is the **dual-channel reveal**: same action produces a private truthful message and a public censored one, and the boss-kill race must be arbitrated fairly under latency (first valid caustic-throw wins, others bounce).

## v1 scope
- 3 players, ONE dungeon floor, ONE round.
- 4 potion colors → 4 effects (heal, poison, blink, caustic).
- 2 wandering monsters to test-throw on; one boss.
- Win = first to throw caustic at the boss and step through.

## Out of scope
- Multiple floors, XP, leveling, equipment.
- Cooperative win conditions.
- Reconnect, spectator identify-sharing UI.

## Risks & unknowns
- Does 4 colors give enough deduction without spreadsheet tedium?
- Balancing lying vs. the boss-race so bluffs actually cost something.
- Real-time movement legibility for 3 tokens on a small TV floor.

## Done means
3 phones join, each privately tests scrambled potions on monsters and builds a private ID log the TV never reveals, players trade truthful and false tips aloud, and the first to correctly throw caustic at the boss wins — with each phone having seen a genuinely different slice of the key.
