## Overview
Break Break is a 3-4 player cooperative voice game about *yielding* the floor, not fighting for it. It inverts the usual Spaceteam mic-contention: the room is supposed to be noisy, and the skill is clearing that noise the instant priority traffic appears. Built for people who like the panic of a busy radio net.

## Problem
Every voice party game is about everyone talking at once. Almost none are about the harder social act: shutting up on cue. The itch is that beautiful moment on a real radio net when someone calls "BREAK BREAK" and the whole channel goes dead so one urgent message can pass — then chaos resumes. That's an untapped rhythm.

## How it works
Each phone privately shows a scrolling teleprompter of harmless "routine traffic" (weather, position reports, callsign checks). Your teleprompter only advances while you HOLD a push-to-talk button, and holding it is how you 'own the floor' — so everyone is incentivized to hold and read aloud, keeping the net busy. The host TV shows only a shared NET METER (how much routine traffic the room cleared) and a live count of clean priority deliveries.

At random intervals ONE phone privately receives a PRIORITY card: an urgent message addressed to a named player ("To DELTA: fuel critical, divert now"). That phone must claim the floor by physically shouting "BREAK BREAK," which pops a giant BREAK banner on every other phone. All other players must RELEASE their talk buttons within ~1s. Only when the server sees the floor is clear (no other talk-buttons held) does the priority sender get a green GO — they read the message aloud, and the addressed recipient taps ACK on their phone. If anyone was still holding a button when GO fired, the transmission is STEPPED ON and drops.

Private per-phone state is load-bearing: each phone's routine stream, its own priority triggers, and its addressed recipient are all different and simultaneous. One passed-around phone can't produce the overlapping-chatter-then-sudden-silence dynamic at all.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{netScore, cleanDeliveries}`, `Player{id, name, holding:bool, teleprompterCursor, priorityCard?}`, `PriorityCard{text, recipientId, state: pending|claimed|go|delivered|steppedOn}`. Sync: talk-button hold/release are the only high-frequency events; server tracks the set of currently-holding players. On a BREAK claim, server broadcasts a `break` event and starts a 1s grace timer; when the holding-set empties it emits `go`, else `steppedOn`. The genuinely hard part is the release-window fairness under variable phone latency — normalize client release timestamps against server-measured RTT so a laggy phone isn't unfairly blamed for stepping on. No ASR needed: 'talking' is proxied by the held button, so the whole thing is server-authoritative from taps alone.

## v1 scope
- 3-4 players, one 90-second round
- Hardcoded routine-traffic and priority-card pools
- One priority card in flight at a time
- Host meter + delivery counter; phones show teleprompter, talk button, BREAK banner, ACK

## Out of scope
- Real mic/silence detection (button proxy is enough for v1)
- Multiple simultaneous priority messages
- Rounds, scoring history, difficulty ramps

## Risks & unknowns
- Will players actually read routine traffic aloud, or silently hold the button? Mitigate with a visible per-phone 'net contribution' bar.
- The 1s release window may feel unfair on bad wifi — RTT normalization is unproven.
- Fun may hinge on the audible silence; without mic detection the 'stepped on' penalty is inferred, not heard.

## Done means
4 phones + a TV connect; routine teleprompters scroll while buttons are held; a random phone gets a priority card, shouts BREAK, others' banners fire, and when all release the sender gets GO, reads aloud, recipient ACKs, and the TV counter increments — with a STEPPED ON drop correctly triggered when someone keeps holding.
