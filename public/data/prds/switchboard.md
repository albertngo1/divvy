## Overview
Switchboard is a 4-player cooperative voice game in the Spaceteam/Devils & the Details lineage. One player is the Operator at a vintage telephone plugboard; the other three are Callers demanding to be connected. It's for groups who love the specific chaos of everyone needing the one person who can't keep up.

## Problem
Most voice co-op games are peer relays — you shout at a neighbor, they shout at theirs. Nobody has explored the hub-and-spoke crisis: a single overwhelmed hub who literally cannot tell the callers apart, because their board shows anonymous lights, not names. The itch is being the bottleneck everyone screams at simultaneously.

## How it works
- **Host screen (shared):** the switchboard exterior, a service-level meter, a round timer, and a dropped-call counter. No secret info.
- **Operator phone (private):** a plugboard — a left column of unlabeled incoming jacks that glow only while a caller holds TALK, and a right column of labeled destinations (BAKER, DOCK, MAYOR). The Operator patches by tapping a glowing jack, then a destination.
- **Caller phones (private):** "You're on the line. You need the DOCK." Holding TALK lights exactly one anonymous jack on the Operator's board and lets them speak aloud.
- **The correlation crunch:** when two or more Callers hold TALK together, multiple jacks glow at once and their voices overlap — the Operator must match a voice they hear to the jack that lit. A correct patch (jack → the destination that caller wanted) clears the call and hands that Caller a fresh request; a wrong patch is a misconnect penalty and the Caller must re-request.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit/Durable Object per room). Data model: `callers[] { id, wantedDest, talking, requestExpiresAt }`, `jacks[] { id → callerId, lit }`, `patches[] { jackId, destId }`, `meter`, `timer`. No speech recognition — the "voice" is real people in the room; the server only tracks jack/patch state and validates patches. The genuinely hard part is latency of TALK → jack-glow on the Operator's board: if it exceeds ~150ms the Operator can't correlate who's talking with which jack lit, and the whole mechanic collapses. Prioritize a tight press→light path and interpolate glow-on/glow-off client-side.

## v1 scope
- Exactly 4 players (1 Operator, 3 Callers), assigned at join.
- One 90-second round, 3 destinations, one active request per Caller.
- TALK lights a jack; patch clears or penalizes; meter + dropped-call count; win/lose end screen.

## Out of scope
- Speech recognition, multiple operators, trunk lines, scoring nuance, more than 3 destinations, multi-round matches.

## Risks & unknowns
- The Operator may be a pure bottleneck — fun or just stressful? Playtest whether correlation is a satisfying puzzle or noise.
- Callers could feel passive between requests; tune request cadence.
- Sub-150ms glow sync over consumer wifi is the real gamble.

## Done means
4 phones join into fixed roles; a Caller holding TALK lights a jack on the Operator's board within 150ms; the Operator's patch either clears that call (both phones update) or fires a misconnect penalty; the meter and timer run down live; an end screen declares saved-vs-dropped calls.
