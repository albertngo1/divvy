## Overview
Squelch is a 3–4 player cooperative panic game about a single half-duplex radio channel. Everyone has urgent things to say; only one person can occupy the airwave at a time; and the moment two phones key up together, both transmissions garble into static and are lost. It's for groups who liked Spaceteam's yelling but want the *channel itself* to be the enemy — a real-time scheduling problem disguised as a shouting match.

## Problem
Most voice party games treat talking as free and simultaneous. Real radio nets don't work that way: step on someone and you both vanish. That constraint — serialize a shared channel under conflicting private deadlines, with no shared turn indicator — is a genuinely tense coordination puzzle almost no party game exploits.

## How it works
Each phone privately holds a QUEUE of 3–4 messages, each with: text to read aloud, a named RECIPIENT phone, a priority (routine / PRIORITY / EMERGENCY), and sometimes a trigger ("send only AFTER you hear someone say WINDWARD"). A big HOLD-TO-TALK bar keys the channel. While you hold it and no one else is keyed, your transmission is 'clean'; the recipient must physically tap COPY to clear the message from your queue. If a second phone keys up within the collision window, BOTH get a red DOUBLED flash, the message stays undelivered, and both phones lock out for 1.5s. EMERGENCY traffic may 'break' an in-progress routine call, cutting the holder off.

The host TV (shared) shows only: the channel state (OPEN / one callsign LIVE / DOUBLED static), a countdown, and an anonymous delivered/total counter. It never shows anyone's queue. So players must announce intent ("break, break, emergency for STATION 3") and listen for gaps. Win: all messages delivered inside 90s.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Player{id, callsign, queue:[Msg]}`, `Msg{id, text, toId, priority, trigger?, delivered}`, `Channel{holderId|null, lockedUntil}`. Keydown sends a client timestamp; the server RTT-normalizes it and grants the channel only if OPEN. The hard part is fair collision arbitration under variable phone latency: two keydowns arriving within an RTT-adjusted ~180ms window are ruled a simultaneous DOUBLE (both fail) rather than first-come; outside it, strict first-grant. Triggers are matched by the recipient tapping COPY (not ASR), keeping it deterministic and offline-friendly.

## v1 scope
- 3–4 players, exactly one round, 90s.
- Fixed hand-authored message set with 1 dependency chain and 1 emergency-break.
- Hold-to-talk + COPY + a single BREAK button.
- Host shows channel state, timer, delivered counter only.

## Out of scope
- ASR / actual audio transmission (voice stays in the physical room).
- Multiple rounds, scoring ladder, difficulty scaling.
- Reconnection recovery, spectators.

## Risks & unknowns
- Collision window tuning: too tight feels unfair, too loose feels laggy.
- Is scheduling fun or just frustrating? Needs the emergency-break to create drama.
- Overlap with prior single-mic games — differentiator is many-to-many traffic + priority preemption, not linear assembly.

## Done means
Four phones on a LAN complete a round where at least one doubled collision and one emergency-break occur, all messages show delivered, and the TV flips to CHANNEL CLEAR — with no desync between any phone's queue and the server.
