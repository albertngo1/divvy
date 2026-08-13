## Overview
A 75-second cooperative control-room game for four people, phones face-up on a table around a host screen. Something in the plant faults. An alarm sounds — from somebody's pocket, in a rhythm nobody at that seat can read. Fix it in six seconds or it spawns two more.

## Problem
Alarm-panic games either put every alert on the shared screen (so everyone reads it and nobody talks) or put it on your own phone (so you just do your job faster). Neither creates the actual texture of a real annunciator panel: *hearing* something, not knowing what it means, and needing two other humans in the loop before anything gets touched. The itch is a game where the sound is physically located in the room and the meaning is somewhere else entirely.

## How it works
The TV shows a plant schematic: six subsystems, all green, a cascade counter, and a clock. It never shows which phone is beeping or what any pattern means.

Every ~7 seconds the server faults a subsystem and plays an alarm **pattern** — two short low, one long, three rapid, long-short — through the speaker of **one randomly chosen phone**, deliberately never the phone that owns the faulted subsystem.

Each phone privately shows three things: your two physical controls (VENT / BYPASS / PURGE levers for the subsystems you own), a **codebook of three pattern-to-fix rows covering only other players' subsystems** — never your own — and, when you're the chosen emitter, the sound itself.

So the loop is forced through voice, three people deep: whoever hears it must describe the sound aloud ("two short, low, from over here"), whoever holds that codebook row shouts the fix ("purge the left tank"), and whoever owns that subsystem pulls the lever — inside 6 seconds. Miss the deadline and the fault cascades: two new alarms, from two new random phones, on top of the ones already sounding. Four overlapping rhythms in a small room is the fail state, and it is loud.

Win: survive 75 seconds with at most two subsystems red.

## Technical approach
Host tab + phone PWAs + an authoritative PartyKit Durable Object. No microphone, no speech recognition anywhere — the voice channel is human-to-human, the phones are ears and hands only.

Data model: `Fault {id, subsystem, patternId, emitterPhoneId, deadlineTs, state}`; `Player {controls[], codebookRows[]}`; `Room {faults[], cascadeCount, clock}`. Alarms are dispatched as `{patternId, startAtServerTs}` and rendered locally with a scheduled WebAudio oscillator envelope, so a dropped frame doesn't smear the rhythm. Codebook rows are dealt disjointly at room start with a solvability check: every subsystem's fix must exist in exactly one other player's book.

Two hard parts, neither of which is clock sync (only one phone plays each alarm). First: **patterns must stay distinguishable by ear across a room with four of them overlapping**, which means separating them on *rhythm and duration*, not pitch — small phone speakers roll off low frequencies and everything becomes the same thin chirp. Second: iOS silently mutes WebAudio under the hardware ringer switch, so every phone needs an audible-confirmation tap in the lobby before the round can start.

## v1 scope
- 4 players, one 75-second round, 6 subsystems, 4 rhythm-distinct patterns
- 3 codebook rows per phone, dealt disjointly, none covering your own subsystems
- Cascade capped at 6 concurrent alarms
- Lobby audio check: each phone plays a test beep and the owner taps "I heard it"
- Host screen shows schematic, cascade counter, clock; WIN/FAIL text at the end

## Out of scope
Any microphone use, scoring across rounds, difficulty ramps, 5+ players, remote play, custom plants, accessibility fallback for deaf players (a known gap, flagged not solved).

## Risks & unknowns
Ringer switches and volume levels vary wildly across phones; four overlapping rhythms may be genuinely undecodable rather than fun-hard; a player seated far from the emitting phone may simply not hear it; the 6-second deadline may be too tight for a three-person relay and will need tuning in playtest.

## Done means
Four phones on one table, unbriefed players: the lobby check confirms every phone is audible at 3 meters, and a group silences at least one full cascade chain end-to-end — heard on phone A, decoded aloud by B, actuated by C — without anyone touching a phone that isn't theirs.
