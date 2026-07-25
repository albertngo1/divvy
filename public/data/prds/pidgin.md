## Overview
A 3–4 player cooperative machine-repair shouting match for people who love Spaceteam but are tired of hunting gibberish on their own panel. The TV is the machine; each phone is a console built by a different manufacturer, in a different jargon. Nobody can read their own labels usefully — only a teammate can.

## Problem
Spaceteam's information flow is one-directional: a reader shouts a name, a finder searches their own panel silently. Loud players dominate; quiet players just scan. And the gibberish means nothing carries from round to round. The itch: a coordination game where you are structurally forced to *broadcast* your private state AND to be *consulted* about someone else's — where no player can ever solve their own problem alone.

## How it works
The host screen shows one machine with four subsystems. A fault appears: `SUBSYSTEM 3 — OVERPRESSURE · requires VENT` with a 40s fuse bar. The canonical verb set is small and shared (VENT, GROUND, PRIME, BLEED, ISOLATE).

No phone has a button labeled VENT. Each phone privately shows:
1. **Five big buttons** in that phone's own dialect — ordinary industrial words (SCRAM, PURGE, CROSS-TIE, DUMP, LATCH). No hint what they do.
2. **A three-line glossary**, each line of the form `GREEN's "PURGE" = VENT` — entries that translate *other* players' dialects only. Never your own.

So the fix requires a relay: button-owners read their labels aloud ("I've got SCRAM, PURGE, CROSS-TIE…") while glossary-holders listen for a word they own and shout the match. Crucially, the generator plants **false friends** — the same word in two dialects with different canonical meanings — so a bare shout of "PURGE!" is ambiguous and the room is forced to invent color prefixes ("BLUE's purge, not yours"). Wrong press: subsystem takes damage, that button locks for 10s. The TV never displays any dialect word or glossary line.

## Technical approach
PartyKit Durable Object per room. State: `{players: [{id, color, dialect[5], glossary[3]}], faults: [{id, subsystem, verb, expiresAt}], damage}`. Phones join by QR and receive a **filtered** snapshot — own dialect + own glossary only, never the full mapping. Press messages `{playerId, buttonId}` are resolved server-side against open faults; the server holds a per-fault claim so two simultaneous correct presses can't double-clear it. TV gets a 20Hz diff; phones get only their own lock/feedback events. Reconnect restores the private assignment by playerId.

The genuinely hard part is half sync, half generator: producing dialect/glossary assignments that guarantee (a) every fault is solvable by exactly one live button, (b) zero self-lookups, (c) at least one false friend per round. That constraint solver *is* the game's difficulty knob.

## v1 scope
- 3 players, fixed; one round
- 5 canonical verbs, 5 buttons per phone
- 4 **sequential** faults, 40s fuse each
- Binary outcome: machine survived or didn't
- Host tab + 3 phones on LAN, no accounts

## Out of scope
Scoring, concurrent faults, two-phone simultaneous actions, ASR/mic anything, spectators, 5+ players, real art.

## Risks & unknowns
May degrade into rote list-recitation once players memorize five words — false friends and panel size are the mitigations. Generator could emit unsolvable rounds. False friends may read as unfair rather than funny. Three players might be too few to make relaying feel triangular.

## Done means
Three phones plus a TV; each phone shows a distinct 5-word panel and 3 glossary lines containing zero self-references; a fault clears only on a press whose canonical verb matches; the server rejects a duplicate claim on the same fault; and in one observed playtest at least one fault is cleared via a relay (glossary-holder ≠ button-owner) and at least one false-friend misfire occurs.
