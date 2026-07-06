## Overview
A physical hidden-role party game for 4-6 players on a shared host TV plus a private phone each. Everyone is a chorus-line dancer following a private routine card that scrolls on their phone in time to the host's beat. One dancer — the Imposter — has a routine with a single move swapped, and doesn't know which one. The room performs in sync; the tell is a physical desync no one can talk their way out of. Then everyone votes.

## Problem
Physical party games rarely carry a hidden role, and hidden-role games rarely get you off the couch. The itch: make the *tell* a bodily desync instead of a verbal one. Per-phone is load-bearing — each phone must stream a private, simultaneous choreography. A single passed phone can't prompt five dancers at once, and the asymmetry (one differing move) only exists across five private cards flipping together.

## How it works
- The host TV shows only a giant shared metronome: '5,6,7,8' then beats 1-8, looping, with a countdown. It shows the BEAT, never the moves.
- Each phone privately shows a scrolling 8-move routine from a tiny vocabulary (CLAP, LEFT, RIGHT, SPIN, STOMP, POINT-AT-TV, DUCK, JUMP), highlighting the current move as the beat advances. All phones identical EXCEPT the Imposter's, where exactly one beat shows a different move (beat 5 = SPIN instead of STOMP).
- The room performs together, twice through, heads down reading phones — which means you *can't* easily watch neighbors, which also means the imposter can't easily copy. On the swapped beat, the Imposter honestly does the odd move.
- Tension: honest players want crisp phone-following (glancing around looks guilty); the Imposter can abandon their card to mirror a neighbor, but the fast heads-down tempo makes copying hard and looking up is itself a tell.
- After two passes, everyone votes on their phone. The TV replays the routine move-by-move and reveals the swapped beat.

Private per phone: your 8-move routine + role. Shared TV: beat/count, timer, votes, reveal. The TV never shows the moves.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { code, players[], phase, bar, beat, routine: Move[8], imposterId, swapBeat, swapMove, votes{} }. The server owns the transport clock and broadcasts beat ticks; each phone gets a *personalized* routine (honest → canonical; imposter → canonical with routine[swapBeat] replaced). The genuinely hard part is a shared beat clock across phones: broadcast 'beat N at serverTime T', and have each phone render the highlight against its own clock offset, aligned by an NTP-style ping handshake so every phone flips within ~80ms. Movement is human-judged — no accelerometer capture in v1 — so phones are just synchronized prompters.

## v1 scope
- One room, 4-5 players, one 8-beat routine, two passes.
- ~6-move vocabulary, one hand-authored routine, one swapped beat.
- Server beat clock + per-phone highlight sync; human-judged performance.
- Phone vote + TV reveal of the swapped beat.

## Out of scope
- Accelerometer/motion detection or auto-scoring; music/audio; multiple routines or rounds; procedural choreography; more than one imposter.

## Risks & unknowns
- Copy failure mode: too slow/short a routine lets the imposter mirror a neighbor — mitigate with a tempo fast enough to force heads-down reading.
- Clock sync: phones flipping the highlight at visibly different times create false desyncs; the offset handshake must hold under ~80ms.
- Judging is subjective — a clumsy honest player looks guilty (feature or bug?).

## Done means
Five phones join; each streams an 8-move routine highlighting in sync to the host beat within ~80ms; exactly one phone's beat-5 move differs; the room performs twice; all vote; the TV replays and reveals the swapped beat plus the most-voted player — one round, end to end.
