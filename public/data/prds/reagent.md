## Overview
Reagent squeezes the roguelike's signature unidentified-potion gamble into a 3-4 player co-op party game. The group fights a single monster shown on the TV; each player privately manages a shelf of colored vials whose color→effect mapping is scrambled *differently for every player* — and, like a real roguelike, you don't even know your own key until you drink. For friends who love the identify-by-use tension of NetHack but could never share it on a couch.

## Problem
The best micro-drama in roguelikes — should I quaff the unknown vial *now*? — dies instantly in multiplayer, because shared screens leak everyone's information. Nobody has kept the gamble private while making it a group problem. Distinct hidden inventories with per-player-scrambled keys turn 'identify the potion' into a talking, remembering, trusting party mechanic.

## How it works
**Shared TV:** a monster with a turn timer, a shared HP bar, a running 'turns survived' count, and each turn a demanded effect — e.g. 'The ice wall resists everything but FIRE — 20s.'
**Each phone (private):** a shelf of ~5 colored vials and a private, per-player-randomized color→effect key that you do NOT know at start. Tap a vial to QUAFF (reveals its effect to you only, consumes it) or POUR (applies it to the monster). Because blue=fire for me but blue=poison for you, 'everyone drink blue' is useless — you must quaff to learn, remember your own key, and call it out. Vials are scarce, so brute-forcing fails.
**Flow:** each turn the group must produce the demanded effect by having whoever holds a matching vial pour it before the timer. Wrong effect → the monster hits, lose HP. Survive N turns → win.
Private scrambled key + private inventory is why the phones must be separate: a passed phone can't hold four simultaneous secret shelves.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Data model: room {monster, turn, demand, hp, timerEndsAt}; per-player {vials:[{id,color,effectId,identified}], keyScramble}. Server owns truth; phones send QUAFF/POUR events; server validates, sends the private 'you learned X' only to that socket and a public 'someone poured FIRE' to the TV. Turn-paced, so latency is forgiving — no sub-frame sync. Hard part is information routing (never leak one player's key to the TV) and tuning the effect economy so it's solvable but genuinely tense.

## v1 scope
- 3 players, one monster, 4 timed turns
- 4 effects (fire/ice/acid/heal), 5 vials each, one demand per turn
- Colored-dot vials, no art
- One room, no lobby polish

## Out of scope
- Multiple floors, permadeath meta-progression, potion mixing, item art, competitive mode.

## Risks & unknowns
- Could collapse into 'everyone quaff everything on turn 1' — needs vial scarcity and a cost to quaffing (some vials harm the drinker).
- Deduction load might feel like homework; keep the key small.

## Done means
3 phones join, each sees a differently scrambled shelf, the group survives or dies across 4 timed turns, and no phone ever sees another player's key or inventory.
