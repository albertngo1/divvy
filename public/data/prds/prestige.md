## Overview

A three-minute incremental game — Cookie Clicker / Universal Paperclips — compressed into a party format for 3-4 people. The TV holds one shared bank with a target and a countdown. Each phone privately runs one generator, one upgrade shop, and one PRESTIGE button. The genre steal is the *prestige reset*: the thing idle games make you love, here weaponized because the reset wipes the whole room's bank and rewards only you.

## Problem

Idle games are compulsive and completely solitary — nobody has ever felt tension about a number going up. And party games about greed usually route it through auctions or voting, where every decision is public. Prestige makes greed *invisible*: the bank dropping is the only evidence anyone did anything, and it looks identical whether you helped or helped yourself.

## How it works

The host screen shows: BANK (a fat number climbing), total coins/sec, TARGET (1,000,000), and a 3:00 enrage clock. Nothing else.

Each phone privately shows: your generator's true rate, a tap-to-boost pad, a three-level upgrade shop, your personal multiplier, and a charge meter that fills only from coins *your* generator produced.

All upgrades are bought from the **shared** bank. The TV shows the bank dipping but never who spent it. Also on your phone, indistinguishable from a purchase in the public view: **SKIM** — convert bank coins into personal multiplier at a terrible rate.

When your charge meter fills, PRESTIGE unlocks: the bank resets to zero, your rate resets to base, your personal multiplier goes ×3 permanently. The target is tuned to be unreachable without roughly two prestiges, so the room must talk somebody into detonating its own progress — twice — while everyone quietly suspects everyone else of skimming. Prestiges are announced loudly on the TV ("SAM PRESTIGED — BANK WIPED"). Purchases and skims are not.

At 0:00: co-op result (target hit or not) plus an MVP reveal of every player's true multiplier, upgrade history, and skim count.

## Technical approach

PartyKit / Durable Object as the authoritative economy. Model: `Room {bank, targetBank, endsAt, tickSeq}`, `Player {id, baseRate, upgrades[], multiplier, charge, skimTotal}`. Server ticks accumulation at 10Hz and broadcasts `{bank, totalRate}` publicly; each socket additionally receives only its own private block. Clients extrapolate the bank locally from the last tick's rate for a smooth spinning odometer, snapping on each authoritative tick.

The genuinely hard part is that the bank is a single mutable resource with concurrent claimants: two phones buying the last 40,000 coins in the same 50ms must not both succeed. The Durable Object serializes all spend/skim/prestige messages against the tick loop, and a rejected spend must fail *legibly* on the phone ("too slow — bank empty") rather than silently. Prestige also has to atomically zero the bank while everyone's client is mid-extrapolation, so the reset carries a `tickSeq` clients hard-snap to.

## v1 scope

- 3 players, one 3-minute run, one restart button
- One generator type per player, 3 upgrade levels, one prestige tier, one skim button
- One hard-coded target tuned so ~2 prestiges are required
- TV: bank, total rate, target, clock, prestige announcements, end-of-run reveal
- No lobby, no accounts, no art beyond big type

## Out of scope

Multiple prestige layers, generator variety or synergies, offline/between-round progress, sabotage powers, more than 4 players, leaderboards, balance tuning UI, mobile install flow.

## Risks & unknowns

The biggest risk is that watching a number is boring at party volume — the tap pad and the prestige announcements have to carry it. Balance is delicate: if one prestige suffices the dilemma evaporates; if three are needed it feels hopeless. Skimming may be strictly dominant, or so obviously antisocial that nobody touches it.

## Done means

Three phones plus a TV: the bank climbs smoothly, two players prestige (bank visibly wiped, TV announces it), the room either clears 1,000,000 before 0:00 or doesn't, and the end screen reveals at least one player skimmed while nobody could prove it during the run.
