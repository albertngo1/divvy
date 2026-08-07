## Overview

A crash game strapped to a video clip. Everyone antes in. A multiplier climbs while the clip plays. Cash out whenever you like — but each player has a different secret trigger hidden somewhere in the footage, and if your trigger fires before you tap, you lose everything. Because the triggers are private and different, the room's nerve is actively misleading. Three to six people, one clip, four minutes.

## Problem

Crash games (Aviator and friends) are pure solitaire dressed as multiplayer: a random number generator busts you, and everyone else's cash-out is noise. Meanwhile a group watching something together generates a perfectly good stream of real events nobody is betting on. Swap the RNG for the show and the loneliest genre becomes the most social one.

## How it works

The host screen shows: the clip, full-bleed, plus a small strip reading `4 of 5 still in`. When someone cashes out, a bell rings and the count drops. No name, no multiplier, no trigger. That's the entire public channel.

Each phone shows privately: your live multiplier (climbing at *your* secret rate — the curves differ, so nobody's number matches anyone's), your secret trigger in plain language ("the next cut to black", "the next time anyone laughs", "the next time a character says a number out loud"), and one enormous CASH OUT button.

So the passive act of watching becomes surveillance. You are scanning for one specific thing while three other people scan for three other things, and when the bell rings you have to decide whether they saw something near *your* trigger or just lost their nerve at 2.4×. Cash-outs cluster; clusters lie.

When a trigger fires, that player's phone goes red instantly. The TV says nothing — the count just drops, indistinguishable from a voluntary exit. Everything reveals at the end: who busted, who bailed at 1.3×, who rode a cut-to-black to 4× with one second to spare.

## Technical approach

Socket.IO (or a PartyKit room) over Tailscale Serve; server is authoritative for clip time and for the annotated event list `[{tMs, kind}]` hand-tagged for one clip. Data model: `Player {id, curveRate, triggerKind, stake, cashedAtMs|null, bustedAtMs|null}`. The server ticks clip time at 10 Hz, evaluates each player's trigger against the annotation list, and resolves cash-outs by server-received timestamp.

Hard part is fairness at the boundary. A tap 80 ms before a bust must win, and a tap 80 ms after must lose — over hotel wifi. Fix: phones stamp taps locally, send `(localTapMs, clockOffset)` measured by a rolling NTP-style ping, and the server accepts the corrected timestamp only within a ±150 ms trust window; outside it, server-receive time governs. The host tab never adjudicates anything; it only renders.

## v1 scope

- One 90-second clip, hand-annotated with ~6 events
- Three trigger kinds, three curve rates, one round, flat ante
- `N still in` counter and a cash-out bell on TV — nothing else
- Full reveal table at the end

## Out of scope

Paying to peek at another player's trigger. Live TV or user-supplied video. Automatic event detection. Multi-round bankroll, side bets, re-entry.

## Risks & unknowns

A badly annotated clip makes one trigger fire at 8 s and another never — trigger placement has to be balanced by hand and that may not generalize past a few curated clips. Vague trigger wording ("laughs") invites arguments; wording must be brutally literal.

## Done means

Three phones, one TV, one clip: every trigger fires within 100 ms of its annotated timestamp on the server log, a cash-out tapped visibly before a bust is paid, one tapped visibly after is not, and the reveal table matches what the room saw happen.
