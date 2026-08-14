## Overview

A cooperative 2-minute shouting game for 4-6 people where the shared vocabulary is a consumable resource. Everyone holds a private slice of a control panel; instructions on your phone always name controls on somebody *else's* phone; and every noun the room successfully uses is destroyed on use.

## Problem

Spaceteam's difficulty curve is bandwidth — more commands, less time. It's the same game, faster. The itch here is a curve made of *language loss*: the first minute is easy and fluent, the last thirty seconds are pure circumlocution, and the reason it got hard is that you were good at it. Taboo makes the forbidden list up front; here the room writes its own forbidden list by succeeding.

## How it works

The panel is built from a closed pool of 20 nouns (BELLOWS, MITER, GROMMET, SPINE, TILE, …). Each phone privately shows 4-5 controls, each with one pool noun and a visible affordance (a toggle, a dial with a target arc, a two-stage latch), plus your private instruction queue — always two deep, always naming a control that is NOT on your phone: "SET THE GROMMET TO THREE."

The host laptop's mic runs closed-vocabulary keyword spotting over exactly those 20 words. The instant a word is detected:

- it is **burned**, globally and permanently, for the round
- the host screen adds it to a growing graveyard column, struck through
- on every phone, that control's label collapses to a blank chip — the control still exists, still works, still gets asked for by future instructions, but nobody may name it again

The burn is unconditional. It fires whether or not the instruction succeeded, so a wasted shout is a permanent loss, and the room quickly learns not to say a word until it's sure who's listening.

What this does to the room: language degrades from nouns to spatial deixis to shared history. "Second from the top on Priya's." "The one we burned first." "The dial — not that dial — the OTHER dial." The host screen shows only the graveyard, a completion bar, and the countdown; it never shows anyone's panel, so the deixis has to be built live between two people who cannot see each other's screens.

A round is 15 instructions in 120 seconds. Miss the target and the completion bar drains.

## Technical approach

Host tab + phone PWAs + Socket.IO server over Tailscale Serve (or PartyKit). State: `{pool:[{word,burned}], panels:{playerId:[{ctrlId,word,type,state}]}, queue:{playerId:[instr]}, progress, endsAt}`.

All control state and burn state live server-side; phones are thin renderers. Burns broadcast as a single `WORD_BURNED` event and every client re-renders its labels — this must be atomic and ordered, because a player mid-sentence reading a word that just died is the core comedy only if everyone's screen agrees on *when* it died.

The genuinely hard part is the ear. Open ASR is too slow and too wrong; this needs keyword spotting over a fixed 20-word grammar on the host laptop with sub-500ms latency. v1 uses the Web Speech API with the pool words as a bias list, tuned aggressively toward false positives (a word that burns early is chaotic-fun; a word that refuses to burn breaks the whole premise). Fallback if the ear proves unusable: the **listener** taps the word chip on their own phone when they hear it, which makes the burn a social act and is arguably better. Build both; ship the tap.

## v1 scope

- One 120-second round, 4 players
- 20-word pool, 4 controls per phone, 3 control types
- 15 instructions, server-generated, always cross-phone
- Tap-to-burn as primary; mic keyword spotting behind a flag
- Host screen: graveyard, progress bar, clock

## Out of scope

Scoring, multiple rounds, difficulty tiers, un-burning words, per-player vocabularies, audio, remote play.

## Risks & unknowns

- The endgame may be unplayable rather than funny: once 12 of 20 words are dead, the room may simply stall out. Mitigation is a shorter round, or instructions that preferentially reuse *live* words late.
- Mic burns may fire on ambient chatter and destroy the pool in 30 seconds. Tap-to-burn dodges this entirely.
- Position-based reference ("second from the top") only works if panel layout is stable — so panels must never reflow when a label blanks.

## Done means

Four phones, one laptop. A word spoken aloud is struck through on the host screen and blanked on all four phones within 500ms, with no phone showing a stale label. A full round can be completed by a group that has never played, and at least one instruction in the final 20 seconds is successfully communicated using zero pool nouns.
