## Overview

A four-player, one-clip, one-round game for the couch. Everyone watches the same 90-second video on the TV. It pauses three times; each pause is a binary proposition you privately bet real chips on. Exactly one player's phone was quietly told the answers in advance. Insider trading is not a bug here — it's the whole product.

## Problem

Watching something together is the most passive thing a group does, and the person who has already seen it is a liability: they either spoil it or sit there smug and silent. Second-screen "bet on the show" apps are just trivia with a points animation — no stakes, no reads, nothing to look at each other about. The itch: make the smug rewatcher the most interesting person in the room without letting them say a single word.

## How it works

Each phone privately receives a BRIEFING at deal time. Three read *"You have not seen this clip."* One lists the true outcome of all three propositions. Payloads are identical in shape and length. The insider knows they're the insider; nobody else knows who is.

The clip plays and hard-pauses at marker 1. Host screen shows the proposition ("Does he open the envelope?") and an 8-second window. Each phone privately picks YES/NO and stakes 1–5 of its 12 chips — simultaneous, hidden.

When the window closes, the host reveals **sides only**: avatars split into two columns. Sizes stay secret. The clip resumes to the resolution, and *then* the tape reveals every stake and settles pari-mutuel: losers' chips split pro-rata among winners. Repeat for markers 2 and 3.

Finale: one private simultaneous accusation — each phone names the insider (no self-naming). The insider doubles their chips if a majority missed them; otherwise their winnings are zeroed and split among correct namers, who also collect +4.

The insider's whole problem: max-betting the truth three times is a confession, and sandbagging costs real money.

## Technical approach

One PartyKit Durable Object per room. State: `{phase, markerIdx, players:{id,name,chips,briefing}, orders:{markerIdx:{playerId:{side,size,tsServer}}}}`. The clip is a bundled mp4 plus `markers.json` (`t`, `text`, `outcome`).

The host tab owns the only `<video>`; the server owns phases. Host posts "reached marker k" → server opens BETTING and closes it on its *own* timer, rejecting late orders by server timestamp. Because the video is paused during every window, network latency can never change what a player knew when they bet.

The hard part is information containment, not sync. Briefings are unicast and never appear in any broadcast snapshot; each socket gets a server-redacted diff. All four briefing frames are byte-padded to equal length and flushed in one tick, so a phone sniffing WebSocket timing can't fingerprint the insider. The host tab must not fetch outcomes until the clip passes each marker — a screen-share or devtools peek would otherwise leak everything.

## v1 scope

- Exactly 4 players + host; one hardcoded 90s public-domain clip; 3 markers
- One randomly dealt insider; 12 chips each; stakes 1–5
- Sides-then-sizes reveal; pari-mutuel settlement; one accusation phase
- QR-code join, no accounts, `localStorage` playerId reconnect

## Out of scope

Multiple clips, uploaded video, live-TV sync, more than one insider, odds/spreads, spectators, persistent scores, mobile-host mode.

## Risks & unknowns

With only 3 markers, the insider may be trivially obvious — may need a 4th marker or a decoy "partial briefing." Authoring genuinely 50/50 beats is the real labor; a clip where the crowd guesses right anyway kills the market. Clip rights force self-shot or public-domain footage in v1.

## Done means

Four phones join, one holds outcomes, three windows resolve with correct pari-mutuel math, the accusation resolves, and the final board shows chips plus whether the insider survived — while a phone throttled to 2s RTT gains and loses nothing, and a socket log proves no non-insider client ever received an `outcome` field before it was public.
