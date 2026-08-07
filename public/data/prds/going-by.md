## Overview

**Going By** is a 3–4 player cooperative shouting game for a TV/laptop host screen plus phone controllers. It is a Spaceteam where the *commands are trivial* and the *addressing layer* is the entire puzzle: every player's name changes every ~20 seconds, only they can see it, and a command addressed to a stale name reaches nobody.

For groups who liked Spaceteam but got bored of hunting a named dial on their own panel. Here you always know what to do — you just don't know who to say it to, or what you're currently called.

## Problem

Spaceteam-likes all put the difficulty in *parsing your own panel*. Once players get fast at scanning, the game flattens. Meanwhile the genuinely hard thing in real coordination — knowing who the message is for and making sure they know you mean them — is never modeled. Rooms fail at routing, not at reading.

## How it works

One round, 150 seconds, one shared task bar on the TV that fills as commands are completed.

**Private, on your phone:**
- A large banner at the top: **YOU ARE GOING BY: BRAMBLE**. It changes to a new alias every 20s (staggered per player so renames never coincide). A 3-second amber pulse warns you before it flips.
- A queue of 1–2 outgoing commands, each addressed to *someone else's* alias: `→ WICKET: hold the left pedal`, `→ HALYARD: say a number over four`. You cannot execute your own commands.
- Your own control panel: four large, dumb, unlabeled controls (pedal, dial, toggle, a big TALK pad). Anyone's command can only be satisfied by the person who is *currently* the addressed alias tapping the right control.

So: you read your command aloud. Nobody knows who WICKET is except WICKET. If WICKET was renamed 4 seconds ago and hasn't announced it yet, your command dies on the floor. The room's real job becomes a constant, overlapping babble of `I'M HALYARD NOW`, `WHO'S WICKET, WHO'S WICKET` — while also trying to hear commands aimed at them.

**Shared, on the TV:** a completed/expired tally, a live count of *unclaimed* commands, and four anonymous lanes showing only IDLE / ACTING. No names, ever. The TV can never resolve the routing question — only mouths can.

Expired commands (TTL 15s) subtract from the bar, so hoarding silence is punished.

## Technical approach

Host browser tab + phone PWAs + authoritative server (PartyKit Durable Object; one DO per room code).

Data model: `Room { code, phase, tBar, players: Map<pid, {slot, alias, aliasExpiresAt, controls}> }`, `Command { id, fromPid, toAlias, aliasEpoch, control, issuedAt, ttl }`.

The server owns the alias table and the clock. A command is minted against `(toAlias, aliasEpoch)`; when a player taps a control, the server checks whether *that player's current alias* matches an open command's `toAlias`. Renames are server-scheduled, pushed only to the owning socket.

The genuinely hard part is the **rename race**: a command spoken at t=19.5s and acted on at t=20.5s should still count. Solution — a 4-second alias *grace window* where the previous epoch stays valid for resolution, and the pre-rename amber pulse so players can verbally pre-warn. Tuning that window is the whole feel of the game. No ASR needed anywhere: voice is purely human-to-human, the server only sees taps.

## v1 scope

- One room code, 3–4 players, one 150-second round.
- 12 hand-written command templates × 4 controls.
- A fixed 24-word alias pool (two-syllable, phonetically distinct — no CLAY/GRAY pairs).
- TV shows: task bar, unclaimed count, four anonymous lanes, end-of-round score.
- No accounts, no reconnect, no sound.

## Out of scope

Multiple rounds, difficulty ramp, alias collisions, speech recognition, spectators, mobile-Safari wake-lock polish, any scoring beyond a single number.

## Risks & unknowns

- Rename cadence may be too punishing at 20s — needs playtesting at 20/30/40s.
- Four people announcing renames may drown out commands entirely; the fun could tip into pure noise. The staggered rename schedule is the mitigation, but it may need a hard "only one rename pending at a time" rule.
- Players may cheat by peeking at each other's banners. Accepted; it's a party game.

## Done means

Four phones join via a code, each shows a rotating private alias, commands issued from one phone are satisfiable only by the currently-addressed player tapping the named control within TTL, the TV bar fills and never displays an alias, and a room of four strangers finishes one round having audibly yelled their own names at least once each.
