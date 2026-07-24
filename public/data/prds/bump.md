## Overview

Bump is a 3-5 player cooperative party game that steals the roguelike's signature loop — unidentified items, one-way decisions, a run that can die — and makes the *identification* problem social. One shared character crawls one shared dungeon on the TV. Every player privately holds one unidentified item, and nobody, including the holder, knows what it does until it fires.

For groups who love the "quaff the unknown potion" moment in Nethack but have never played Nethack.

## Problem

Roguelikes are single-player by architecture: the tension is you alone weighing incomplete information. Co-op roguelikes usually just add more characters, which dilutes rather than transforms it. The genuinely stealable idea is **item identification under pressure** — and that becomes a party mechanic the moment the information is split across people who have to argue about it.

## How it works

The TV shows a 5-room corridor and the party's shared HP (starts at 10). Each room presents one hazard: a locked door, a swarm, a pit, a merchant, a boss. Rooms resolve one at a time.

Each phone privately holds **one item card**, drawn face-down: the phone shows only a name and a flavor icon ("Verdigris Flask", "Chipped Sigil") — no effect text. Crucially, the *effect* is not just hidden, it's **contextual**: the server holds a secret effect that reads the current hazard. The Verdigris Flask might be +4 HP against a swarm and -3 HP against a pit. The holder can't know.

But each phone also privately shows **one hint about someone else's item** — e.g. "the Chipped Sigil is dangerous in water rooms." So the table's total knowledge is complete; no individual's is.

Per room: the TV names the hazard and starts a 25-second timer. Players talk. Anyone may *offer* their item by holding a big USE button. At timer end, the server takes exactly one offered item — if multiple are offered, the one held longest wins, and the TV announces the collision. The item resolves, its true effect is revealed publicly and permanently on the TV, HP changes, and that item is consumed. The holder draws a fresh unidentified item.

If nobody offers, the hazard hits for its base damage. HP hits zero, the run ends — roguelike-honest, no rewind.

Phone shows privately: your item's name, your one hint about another item, your USE button, your own hold progress.
TV shows publicly: the room, HP, the identified-items log that grows all run.

## Technical approach

Socket.IO server behind Tailscale Serve, or a PartyKit DO. State: `{hp, roomIndex, rooms[5], players: {id, itemId, hintText}, itemTruth: {itemId → {hazardType → delta}}, identified: []}`.

`itemTruth` never leaves the server. Phones only ever receive `{itemName, iconId, hintText}` — a deliberately impoverished view, so a dumped phone payload leaks nothing.

Sync: room timer is server-authoritative; a `room_tick` broadcast every 250ms drives both TV and phone countdowns. USE is a hold gesture — the phone streams `hold_start`/`hold_end`, the server computes duration, and at timer expiry picks max duration with server-received timestamps as tiebreak. No client-side timing trust.

Hard part is less latency than **information design**: generating hint sets where the union of hints is sufficient but no single hint is decisive, and where the hints stay true as items get consumed and redrawn. v1 solves this by hardcoding a small item pool with hand-authored hint pairings rather than generating them.

## v1 scope

- 3 players, one run, 5 rooms, hardcoded.
- Item pool of 8, each with effects defined against 5 hazard types. Hand-authored hints.
- One item held per player, one redraw after use.
- Death ends the run with a Nethack-style tombstone screen. No meta-progression, no unlocks.
- Text-and-icon rooms; no art beyond emoji-grade glyphs.

## Out of scope

Multiple runs, permadeath meta-unlocks, character classes, inventory of more than one item, trading items between phones, procedural item generation, combat depth, a map.

## Risks & unknowns

- The hint layer may feel like homework rather than tension; if hints are too explicit the game becomes read-aloud-and-obey.
- 25 seconds may be too long — a group that solves the hint puzzle in 8 seconds sits bored. Consider shortening once tested.
- With one item each and 5 rooms, some players may never get a meaningful decision. Redraw pacing needs tuning.
- Roguelike death is unforgiving; a run ending at room 2 could feel bad rather than brutal-in-a-good-way.

## Done means

Three phones join, each shows a distinct unidentified item and one hint about another. The group argues through 5 rooms, the TV's identified-items log fills in as items fire, shared HP moves both directions, and the run ends in either a boss kill or a tombstone — with zero item effects ever having been visible on a phone before use.
