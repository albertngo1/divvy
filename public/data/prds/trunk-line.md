## Overview
Trunk Line is a 3–5 player co-op voice-chaos game in the Spaceteam lineage. The room is a jammed 1950s telephone exchange; every player is an operator racing to patch calls before the switchboard overloads. The shared TV is the exchange status board; each phone is one operator's private jack panel.

## Problem
Spaceteam's magic is that you're shouting information only *you* can see and desperately needing information only someone *else* can see. Most voice party clones lose the asymmetry — everyone can eventually see everything. Trunk Line makes the asymmetry structural: no operator can ever complete a call alone, because completing it requires a person you have to *find by voice*.

## How it works
Each phone privately shows two things: (1) your CALLSIGN identity ("YOU ARE RED FOX") and (2) a TARGET you must patch to ("CONNECT TO BLUE MOON"). Crucially, you do NOT see who holds Blue Moon, and you don't see who is currently trying to reach *you*. So you broadcast aloud — "Who's got BLUE MOON? Red Fox calling!" — while three other people shout their own requests over you. When the holder hears their callsign, they answer verbally, and both players tap CONNECT within a 1.2s window to form the line. Each phone can hold only ONE active connection, so if two operators both want the same target, one gets a busy-signal collision and both targets reshuffle. The shared TV shows only anonymous lit/unlit trunk lamps and a rising OVERLOAD meter — it never reveals identities, forcing all identity exchange through voice. Complete N patches before the meter tops out.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `players[]` each `{id, callsign, target, connectedTo|null}`; server holds the truth. Sync: phones send `TAP_CONNECT{targetCallsign}`; server pairs two taps that name each other within a 1.2s rolling window, using server-received timestamps normalized by measured per-client RTT. The genuinely hard part is fair simultaneity under variable phone latency plus the reshuffle: when a collision or a completed patch occurs, the server must atomically reassign fresh targets and push them so no two phones briefly believe they hold the same live line (optimistic UI + server reconciliation with a short lock).

## v1 scope
- 3 players, one round
- 4 total patches to win
- Single overload meter, fixed drain rate
- Text callsigns only (no audio callsign playback)
- No scoring beyond win/lose

## Out of scope
- Speech recognition (voice is human-to-human only)
- More than one simultaneous connection per phone
- Difficulty ramps, cosmetics, reconnection recovery

## Risks & unknowns
- Does 3-player crosstalk produce fun chaos or just confusion? Needs playtest tuning of callsign distinctiveness.
- The 1.2s pairing window may feel unfair on slow phones — RTT normalization must be validated.
- Reshuffle churn could feel arbitrary; may need a brief "line dropped" beat.

## Done means
Three phones each show a private callsign+target; players verbally locate targets and complete 4 mutual CONNECT taps; a wrong-partner tap yields a busy signal and reshuffle; the TV meter rises and the round ends in a clear win or overload — with no identity ever shown on the shared screen.
