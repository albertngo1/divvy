## Overview

A four-minute cooperative panic for 4 players: host TV is a machine that only unlocks when it hears certain words spoken aloud in the room, and every phone is privately censoring its own owner. Aimed at groups who play Spaceteam and Taboo and want the two welded together.

## Problem

Speech-restriction party games treat the restriction as a punishment — you lose a point for saying the forbidden thing. That's flat. Restriction gets interesting when it creates *routing*: the player holding the key word is structurally incapable of uttering it, so the word has to be manufactured in a third person's mouth, live, while that person is mid-crisis on something else. Nobody is guessing for fun; they're being interrupted.

## How it works

One round, four minutes, five ORDERS, cooperative score.

**On the TV:** a panel of six unlabeled toggles, the order queue with key nouns *blanked out* ("ROUTE the ______ to bay 2"), a live HEARD ticker of key words the room has said out loud, and the clock. The TV never shows anyone's mute list.

**On each phone, private and unshared, three separate layers:**
1. **Order text** — one player gets the full order, key noun included: GANNET.
2. **Mute list** — eight words your phone refuses to let you say. GANNET is on yours. You see only your own list, so nobody can tell whether you're stuck, confused, or lying.
3. **Console** — you own 2 of the 6 toggles, and a toggle is only operable for 4 seconds after your phone hears its key word spoken aloud in the room.

So Ana reads "route the GANNET" and cannot say GANNET. She has to make Ben say it unprompted — "the sea bird, the one that dives" — while Ben is mid-elicitation on his own order and *his* mute list happens to contain "bird." The word lands, Dee's toggle wakes for four seconds, and Dee has to notice and flip it. Say one of your own banned words and your phone flashes MUTED and locks you out for three seconds, which everyone hears in the silence.

## Technical approach

Socket.IO on a Mac mini behind Tailscale Serve (or a PartyKit Durable Object); server is authoritative. Model: `Room{orders[], toggles[6], heardLog[]}`, `Player{muteList[8], toggleIds[2], lockoutUntil}`, `Order{id, keyword, targetToggle, holderId, state}`.

Two independent recognizers per phone, both `webkitSpeechRecognition` in continuous mode. (a) Match transcripts against *your own eight-word mute list only* → emit `violation`. (b) Match against the room's six live key words → emit `heard{word, confidence}`; the server takes the first credible report and broadcasts a uniform 4-second `armed` window. Using four phones as a redundant microphone array is the trick that lets the round survive one bad mic or one mumbler.

**The hard part is recognition latency and false positives.** Mitigations: a tiny closed vocabulary hand-picked for phonetic distance (GANNET / LADDER / QUARTZ — no minimal pairs), acceptance at confidence ≥0.6 or on two independent phones agreeing, a debounce so one utterance can't arm a toggle twice, and server-owned timing so the 4s window is identical everywhere. If Web Speech is unavailable (iOS Safari), the host laptop tab does all recognition with its one good mic and violations degrade to a tattle button.

## v1 scope

- 4 players, one 4-minute round, 5 orders, 6 toggles, 8-word mute lists.
- 20 hardcoded key nouns, hand-tuned for phonetic distance.
- Chrome on Android phones + a desktop Chrome host. Nothing else.
- 4-letter room code, no reconnect, no cross-round scoring.

## Out of scope

iOS parity, custom word packs, mute lists that shift mid-round, a traitor variant, audio logging or replay, more than one open order per player.

## Risks & unknowns

Chrome's Web Speech is cloud-backed — network dependency and a real privacy disclosure. Accents and a loud room degrade it badly. The degenerate strategy is spelling the word aloud letter by letter; it may be worth accepting as a legitimate hack, or seeding letter names into mute lists. Biggest UX risk: a player concludes the app is broken rather than that a word is banned, so the MUTED state has to be unmistakable and instant.

## Done means

Four Android phones and a laptop, one wifi, one 20-second rules card: a fresh room completes at least 2 of 5 orders; the server log shows at least one order where the key word was spoken by a player who never saw it written; and across 10 scripted trials, a phone flashes MUTED within 1.2 seconds of its owner speaking a banned word at least 8 times.
