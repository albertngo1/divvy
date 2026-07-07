## Overview
Laugh Track takes the most passive thing a group does — watching short clips together — and turns each viewer's own reaction into a tradeable asset. Before each clip everyone privately bets on how the room will respond, then their phone mic measures how hard *they* personally laugh. It's for the friend group that watches memes on the couch and narrates their reactions anyway.

## Problem
Watching clips together is one-directional: the screen performs, you receive. The itch is that everyone is already silently judging whether *this one lands* — Laugh Track makes that private judgment a bet, and then forces your own body to either back it up or betray it.

## How it works
Host screen shows a queue of short clips, a giant live APPLAUSE-O-METER, and the pot. Each phone runs its own private terminal.

1. **Place your bet (private):** before the clip, each phone secretly picks **HOUSE DOWN** (the room laughs) or **CRICKETS** (dead room), plus a wager. Nobody sees anyone else's pick.
2. **The clip plays** on the host screen — pure passive consumption.
3. **Reaction window (5s):** each phone's mic measures *its own owner's* laughter loudness, shown privately as a rising bar only you can see. The host meter fills with the aggregate. Here's the vise: if you bet CRICKETS you must physically stifle your laugh at a genuinely funny clip; if you bet HOUSE DOWN you're tempted to ham it up and swing the room.
4. **Resolve:** total room laughter vs. a threshold decides HOUSE DOWN or CRICKETS; correct bettors split the pot. Reveal shows who bet what — and who choked back a laugh to win.

**Why per-phone is load-bearing:** every phone simultaneously monitors its own owner's mic. One passed-around phone physically cannot capture four people laughing at once, and the private-bet-vs-public-body tension only exists because your wager is hidden while your voice isn't.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). On "reaction window start," each phone runs WebAudio RMS on its mic for 5s and streams its peak/level; server sums levels, drives the shared meter, and resolves. Data model: `room{clip, phase, pot}`; `player{bet, wager, micPeak}`. The hard part is cross-device mic normalization — phone gains vary wildly — solved with a 2s ambient calibration before the round, and light anti-gaming (blowing on the mic reads as broadband low-freq, distinct from laughter's bursty midrange; v1 can just tolerate it as party chaos).

## v1 scope
- 3–4 players, one clip, one round
- Binary bet (HOUSE DOWN / CRICKETS), fixed wager
- Simple summed-RMS threshold; 2s ambient calibration
- Bundled clip, no library

## Out of scope
- Laughter ML classification, groan/cringe categories
- Multi-clip "seasons," leaderboards, clip uploads
- Streaming-service integration

## Risks & unknowns
- Mic gaming (tapping, fake-laughing) may be too easy
- Device mic-gain variance could make the meter unfair
- Is a binary bet too thin to sustain more than a couple rounds?

## Done means
Three phones each place a hidden bet, one clip plays, each phone's mic fills its own private bar while the host meter aggregates, the round resolves against a threshold and pays out, and a reveal screen shows every player's bet — one full clip, end to end.
