## Overview
A 90-second cooperative panic game for 3-5 people in one room, Spaceteam-shaped: shared TV, private phone panels. The twist is that the unreliable channel isn't the machine — it's the room's own mouths. Every control name collides phonetically with a control on somebody else's phone.

## Problem
Spaceteam's chaos comes from *hunting* for a named control. Every descendant has kept that. Nobody has made the spoken word itself lossy. Real cockpit and dispatch protocols exist entirely because humans mishear each other under load — that friction is funny, universal, and completely unmined in party games. Voice games also almost always mean "a microphone processes you"; here voice is pure human-to-human protocol, and the software never listens at all.

## How it works
The TV shows a machine with six gauges, a fault log, a 90-second clock, and three damage pips. Each phone privately holds 3 controls drawn from homophone families: {VALVE, HALVE, SALVE}, {SEAL, CEIL}, {BRAKE, BREAK}, {BOW, BOW}. Crucially, some families are spelled identically with different meanings, so spelling out letters is not an escape hatch.

Each phone shows its controls as **word + a meaning glyph** (an ointment jar, a knife halving a loaf, a pipe fitting). Command cards arrive privately on random phones — "SALVE to 4", 12 seconds — and show **the word only, never the glyph**. So the caller genuinely cannot disambiguate; only holders can. The room has to build a spoken index live: "I've got the ointment one!" "Mine's the boat one, not the ribbon one."

Wrong-homophone presses cost a damage pip, and the TV names the miss publicly — "HALVE set while SALVE was called" — which is how families get discovered mid-round. Public screen: gauges, damage, clock, fault log. Private phone: your controls, your glyphs, your commands.

## Technical approach
Host browser tab + phone PWAs + one authoritative PartyKit Durable Object per room. No audio pipeline whatsoever in v1.

Model: `Room {phase, clockMs, damage, openCommands[], panels{playerId: Control[]}}`; `Control {id, label, family, glyph, kind, value}`; `Command {id, controlId, targetValue, issuedTo, deadlineMs}`. Phones send `set_control` intents; the server validates against open commands and broadcasts deltas at 10Hz. Host renders from one snapshot stream so it can never disagree with a phone.

The genuinely hard part is not sync — it's deadline fairness across 150-300ms mobile round trips (server-stamped intents with a 250ms grace window) and authoring a homophone corpus whose collisions land on *different phones* often enough to bite without making the round unwinnable.

## v1 scope
- 4 players, one 90-second round, survive-or-fail, no score
- 8 homophone families, 24 words total
- 3 controls per phone; dial 0-5 only, no switches or sliders
- 12 commands, 3 damage pips, public fault log
- Room-code join, no reconnection, no lobby art

## Out of scope
Microphones, ASR, difficulty ramp, multiple rounds, spectators, mid-game rejoin, cosmetics.

## Risks & unknowns
Groups may collapse to "describe everything by meaning always," which is slower but safe — the 12s→8s deadline ramp must make that too expensive. Homographs may read as unfair rather than funny. Corpus size may exhaust after two plays.

## Done means
Four phones on one round; the fault log records at least one wrong-homophone press; and by minute two the room has spontaneously invented a disambiguation phrase without ever being told the families exist.
