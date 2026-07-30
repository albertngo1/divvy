## Overview

A fast, loud party game for 3-4 players that steals the fighting-game juggle combo and, more importantly, *damage scaling*. One dummy hangs in the air on the TV; the room chains hits into it in real time. Each hit is worth less than the last, so the incentive is to slam your move early — but only your own phone knows if your move links from the dummy's current height. Rounds last 30 seconds.

## Problem

Combos are the most viscerally satisfying thing in games and are usually locked behind hundreds of hours of solo lab time. Party games that borrow "combos" reduce them to fast tapping. The real texture is *linking* — knowing your move's properties and reading state under time pressure — which becomes social the instant the properties are split across people who have to shout about them.

## How it works

The TV shows the dummy at one of three HEIGHT bands (GROUND / MID / HIGH), a hitstun countdown bar (~2.2s, refreshed by each hit), the combo count, and a SCALING percentage that starts at 100% and drops 20 points per hit.

**Private on each phone:** three move cards. Each card shows its name, base damage, the height band it *requires*, the band it *launches* to, and how much hitstun it grants. One card per player is a wall bounce: it resets scaling to 100%, once per game. Nobody sees anyone else's cards.

While hitstun runs, any player may slam any unused card. The server checks the required band against live state. Link → you bank `damage × scaling`, the dummy moves to the new band, hitstun refreshes, scaling drops. Wrong band, or hitstun expiring untouched → DROP: the combo ends and *every* hit's damage in it is voided.

So the room negotiates blind: "someone get it back to MID, my last card is MID-only" — while knowing anyone can jump the queue for better scaling. Passing one phone around kills it: the whole game is simultaneous claims on a single link slot plus hidden card properties.

## Technical approach

Host tab + phone PWAs + a Cloudflare Durable Object per room, authoritative for all state. Model: `{dummy: {band, hitstunEndsAt, combo, scaling}, players: [{id, cards: [{id, dmg, needs, sends, stun, used}], banked}], epoch}`. TV receives a redacted broadcast (no card contents, ever); phones receive their own hand privately on join.

The hard part is the race for the single link slot. The DO is single-threaded, so ordering is deterministic — but not *fair*: a phone on cellular loses to one on wifi. Each client runs a ping/pong RTT probe; the DO computes effective input time as `arrival − rtt/2` and resolves a 120ms photo-finish window by that corrected time, in the spirit of rollback netcode's input delay. Losers get an explicit `whiff` ack (card unspent, no penalty) so a lost race never reads as a dead button. Hitstun expiry is server-timed, with the phone rendering the bar off a synced clock offset rather than its own.

## v1 scope

- 3 players, 3 cards each, three height bands
- One combo, then a final damage screen
- TV: dummy band, hitstun bar, combo count, scaling %, hit log
- Phone: three cards, tap to slam, whiff ack

## Out of scope

Best-of-3, character select, deck construction, opponent AI, blocking or defense, animation beyond a sprite jolt.

## Risks & unknowns

The void-everything drop may feel unfair rather than tense; halving instead is the fallback. Three bands may be too shallow to require talking. Card hands must be generated so a valid 4-hit chain always exists, or rounds die instantly.

## Done means

Three real phones complete one combo of ≥4 linked hits with correct scaling arithmetic, one intentionally dropped combo, and one simultaneous double-slam where exactly one hit lands and the other phone shows a whiff — no host reload between them.
