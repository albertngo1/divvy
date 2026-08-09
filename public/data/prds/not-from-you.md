## Overview

A 3–4 player cooperative shouting game for a phone-in-hand living room. Every player holds a private control panel and a private stack of orders they cannot execute themselves. The twist: each panel obeys only ONE other player at a time, that mapping is never shown to anyone, and it reshuffles mid-round. The room's real task isn't the orders — it's discovering, live and by ear, who has to repeat what.

## Problem

Spaceteam-lineage games get solved once players learn the routing rule: shout the weird word, whoever has it taps it. After two rounds the room is just a fast lookup table. There's no live social discovery, and no reason to ever say the same thing twice. *Not From You* makes the routing itself the hidden state, so the room is constantly renegotiating who speaks for whom.

## How it works

One 100-second round. Each phone PRIVATELY shows: (1) a panel of 6 chunky labeled controls (VENT SCRUBBER, PURGE LINE 4, SEAT THE CLAMP…), and (2) one ORDER at a time — the name of a control that is *not* on their own panel. You must say your order aloud.

Every phone whose panel contains that control lights it up — but the button is only *tappable* if the person who just spoke is that phone's current PATRON. Otherwise the button flashes and greys with "not from you." That grey flash is the entire information channel. So Dana shouts "VENT SCRUBBER"; Sam's button greys; Sam yells "someone else say it"; Ravi repeats it; Sam's button goes live and taps. The room has learned Sam takes it from Ravi — for the next ~25 seconds, when patrons silently reshuffle.

Speaker attribution comes from per-phone mic RMS: the loudest phone in a 700 ms window is the speaker, published by the server. So you have to actually talk, and talking over each other blurs attribution.

The host TV shows only: the shared clock, orders completed / expired, and a bare graph of *arrows discovered so far* that wipes on every reshuffle — a scoreboard of knowledge decaying in real time.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs on WebSocket. Server state: `players[]`, `panels{playerId: controlId[]}`, `patron{playerId: playerId}`, `orders{playerId: {controlId, ttl}}`, `speaker{playerId, until}`. Phones run an AudioWorklet computing 50 ms RMS, publishing a smoothed scalar only (never audio). Server picks argmax over a 700 ms window with a 3 dB margin; ties publish `speaker: null`.

Authority is total: taps are validated server-side against `patron[tapper] === speaker`. Clients render optimistically off the last `speaker` broadcast, so the hard part is the grey-flash lie — a phone may show a button live for 150 ms of network lag after the speaker changed. Fix: gate tappability on server-stamped speaker epochs and reject taps whose epoch is stale, showing "too late" rather than "not from you" so false lessons aren't taught.

## v1 scope

- 3 players, one 100-second round, one reshuffle at t=50 s
- 6 controls per panel, hand-authored, no generator
- Patron mapping is a random derangement; no hints, ever
- Host screen: clock, tally, discovered-arrows strip
- Loud/quiet detection only — no ASR, no recording

## Out of scope

Multiple rounds, scoring beyond a completion count, 5+ players, difficulty tiers, saboteur roles, reconnect handling.

## Risks & unknowns

Speaker attribution in a loud room is the whole game; if RMS argmax is mushy the feedback becomes noise instead of evidence. Mitigation: require a 3 dB margin and publish an explicit "nobody / everybody" state so players learn to take turns. Reshuffling may feel arbitrary rather than tense — 25 s may be too fast to be learnable.

## Done means

Three phones on a table, one round: the room completes ≥4 orders, and in playback at least one order visibly required a relay (player A speaks, button greys, player B repeats, tap succeeds) without anyone being told the mapping.
