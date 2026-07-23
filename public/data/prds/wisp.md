## Overview
Wisp is a 4-player hidden-role game: one host screen, four phones. One player is the **Wisp**, secretly Loyal or False, and holds the *only* map on their phone. The other three are blind **Travelers** — a single party token they collectively steer, guided by the Wisp but armed with private senses. For groups who love Werewolf's paranoia but want the liar to hold real, concrete informational power.

## Problem
Social deduction usually hands everyone the same public board and asks 'who's lying about intent?' Here the traitor's power IS an information monopoly — they alone see the map — and the ONLY check on that power is fragmentary private sensor data spread across separate phones. Put the map on the shared TV and the game evaporates; the private phone is the whole point.

## How it works
The Wisp's phone shows an 8-cell path with a hidden **Haven** (win) and hidden **Bog** (lose). Each step, the Wisp privately sends the party a suggested direction — the guiding light. The three Travelers see NO map. Each Traveler's phone shows only the party's current cell and ONE private, noisy sense reading that gets stronger near a landmark: Traveler A feels a **stench meter** (rises toward the Bog), Traveler B sees a **glow meter** (rises toward the Haven), Traveler C feels **temperature** (spikes near either). No single reading is conclusive; pooling them by talking is the game.

Each step the Travelers debate their private readings, then **vote** to follow the Wisp's suggestion or override it. A Loyal Wisp genuinely steers to the Haven; a False Wisp nudges toward the Bog while pleading innocence. At any point the Travelers may spend their one **accusation** — correct catch of a False Wisp = Travelers win instantly; wrong = the Wisp gets a free step of their choosing.

The host TV shows only the redacted trail (cells visited, steps remaining) — never the Haven, Bog, or any sense. Win: reach the Haven, or correctly accuse. Lose: land in the Bog or run out of steps.

## Technical approach
Authoritative WS server. Model: `map = {haven, bog}`, `party.pos`, `roles = {wispId, alignment}`, per-Traveler `sense = {type, value}` recomputed each step from distance-to-landmark plus fixed noise. Flow per step: Wisp emits `suggest(dir)` (private relay is unnecessary — it's the public suggestion on TV) → Travelers submit private votes → server tallies, moves party, recomputes and pushes each Traveler ONLY their own sense value. All turn-based, so latency is trivial. Hard part is *tuning*: sense noise must let a coordinated table catch a careful liar ~50-60% of the time — too clean and the Wisp can't bluff, too noisy and senses are useless.

## v1 scope
- Exactly 1 Wisp + 3 Travelers
- One linear 8-cell path, hidden Haven + Bog
- Two live sense types (stench, glow) + temperature as tiebreaker
- ~6 steps, one accusation token, one round
- TV = trail + steps-remaining only

## Out of scope
- Branching maps, multiple Wisps, more players
- Role rotation, scoring across rounds
- Reconnect, spectators

## Risks & unknowns
- Sense-noise tuning is the whole balance; needs playtest iteration.
- Three Travelers might just always follow the Wisp → weak deduction. Mitigate by making one early sense reading clearly contradict a False Wisp.
- Grief risk if a Traveler stonewalls votes; keep the party token majority-ruled.

## Done means
On four real phones, a full 6-step round resolves where each Traveler sees only their own private sense, a False Wisp can plausibly steer toward the Bog, and the Travelers can — using pooled private readings — either reach the Haven or land a correct accusation, with the map never visible to anyone but the Wisp.
