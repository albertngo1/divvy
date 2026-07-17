## Overview
Loose Lips is a 3–4 player cooperative voice game for a TV + phones. The room's job is to read a single sentence out loud, left to right, one word at a time, smoothly and in time — like a table read where the script keeps yanking the mic between people. It's for groups who like Spaceteam's shouty panic but want a purely verbal, no-jargon version.

## Problem
Most 'read it aloud' party bits collapse into one loud person doing all the work. The itch: make *who speaks the next word* a live, contested decision that the whole room has to solve in real time, out loud, with no single player able to carry it.

## How it works
The **host screen** shows one 12–16 word sentence with a glowing cursor on the current word and a shared timer. Everyone can read the whole sentence.

Each **phone privately** shows the same sentence with a subset of words struck through in red — that player's TABOO set. Nobody sees anyone else's taboos. The sets are tuned so every word is sayable by *someone*, but usually only one or two people, and adjacent words rarely share a legal speaker — forcing constant hand-offs.

To advance the cursor, exactly one player taps a big SAY IT button and speaks the current word aloud. The server advances only if (a) that word is NOT in the tapper's taboo set and (b) no one else tapped within the collision window. A taboo-tap = buzzer + 2s lockout. Two taps at once = DEAD AIR, cursor holds, everyone groans. So players must call ahead — 'I can't do BRIDGE, someone grab BRIDGE!' — while keeping the read flowing. Win = the full sentence spoken cleanly before the timer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `sentence: string[]`, `cursor: int`, per-phone `tabooSet: Set<int>` (word indices), `timer`. Clients send `CLAIM{cursor, clientTs}`; server timestamps arrival, buffers a ~200ms window RTT-normalized against per-client ping, and resolves: single legal claim → advance + broadcast; multiple → dead air; illegal → buzz. The genuinely hard part is fair collision arbitration under uneven phone latency — the server must judge simultaneity by normalized send-time, not receive-order, or the player on hotel wifi always loses the tap. Optional stretch: on-device Web Speech to confirm the word was actually spoken, not just tapped.

## v1 scope
- 3–4 players, one sentence, one timer.
- Precomputed sentence + hand-authored taboo sets (no generator).
- Tap-to-claim; honor-system on the spoken word.
- Host shows cursor, timer, win/lose.

## Out of scope
- Speech recognition, scoring/leagues, multiple rounds, saboteur roles, taboo generator.

## Risks & unknowns
- Does tap-to-claim feel voice-y enough, or does voice become mere flavor? Tune by making taboos dense so verbal call-aheads are mandatory.
- Collision window feel across latencies.

## Done means
Four phones on one server read a hard-cased sentence to the end; a taboo-tap buzzes the right player, two simultaneous taps produce dead air, and a clean run flips the host to WIN.
