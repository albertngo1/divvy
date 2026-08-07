## Overview

A 4–5 player negotiation draft for one room, where speech is metered and cross-billed. Each phone continuously measures its own player's voice and spends a decibel budget. Turn order in the draft goes to whoever spent least. The twist: your phone is not the only one that hears you. Whispering to the person beside you charges their meter as well as yours, and announcing something to the whole room charges *everybody* a little — including your rivals, which is occasionally exactly what you want.

## Problem

Negotiation games have free speech, so the loudest and fastest talker wins by volume of words. Games that punish talking usually just fine you and move on. This one makes speech a resource with a *routing cost* — who hears you determines who pays — so choosing your audience becomes the central decision instead of an afterthought.

## How it works

1. Six items sit face-up on the shared screen. Each phone privately shows that player's own valuation table — the same item is worth 5 to you and 1 to someone else — plus one "pairs with" bonus that only scores if a *different* named player ends up holding the partner item. So you must make deals, and deals need words.
2. Talk phase, 90 seconds. Every phone runs its mic and integrates RMS above a floor into a spend total. Your phone shows your own spend as a bar and shows only your *rank* among the others, never their numbers.
3. Draft phase. Pick order = ascending spend. Quietest picks first. Picks are made on the phone and revealed one at a time on the TV.
4. Score = your valuations of what you hold, plus any pair bonus that landed. The TV finally reveals the full spend leaderboard — the person who talked least usually got first pick and the worst deals.

The shared screen shows the items, a live anonymized noise-weather stripe ("the room is loud right now"), the countdown, and nothing else. Valuations, pair targets, exact spend, and picks stay on the phone.

## Technical approach

Socket.IO over Tailscale Serve, or a PartyKit room; server is authoritative for spend totals so a phone cannot under-report. Each phone posts a spend delta every 250 ms; the server accumulates. Room state: `{items[], players:{id, valuations, pairTarget, spendMicroJoules, pick}, phase, deadline}`.

The hard part is honest metering across heterogeneous phones. Mic gain, AGC, and mic placement differ per device, so raw dBFS is not comparable. Mitigation: disable AGC via `echoCancellation:false, autoGainControl:false, noiseSuppression:false`, then run a 5-second calibration where everyone is silent and everyone says one scripted sentence, and normalize each phone to that pair of anchors. Cross-billing needs no explicit routing logic — it falls out of physics, since a nearby phone genuinely picks up your whisper at lower amplitude. Whether that gradient is steep enough to be legible is the open question.

## v1 scope

- One round, six items, four players.
- Fixed hand-authored valuation tables, one pair bonus each.
- 90-second talk phase, snake-free single-pass draft.
- Calibration is two taps and one scripted sentence.

## Out of scope

Multiple rounds, trading after the draft, bots, spectators, saved profiles, any anti-cheat beyond server-side accumulation.

## Risks & unknowns

If phones sit on a table rather than being held, isolation collapses and every meter reads the same — killing the whole mechanic. Players may discover a degenerate strategy of total silence plus pointing. Background music or a loud room floods every budget at once.

## Done means

Four calibrated phones in one room show visibly different spend bars after a 90-second talk phase; a whisper between two seated neighbors measurably raises both of their meters and not the far player's; the quietest player picks first and the final TV leaderboard reconciles spend against score.
