## Overview

A 4-player word-matching game where speech is both the only way to score and a live minefield. Each phone holds a private hand of half-compounds; the matching halves are scattered in other people's hands. To pair them you have to say a word out loud. Meanwhile any player can quietly arm a snare that punishes whoever speaks next.

## Problem

Most "stay quiet" games make silence a passive state you endure. This makes silence *aggressive* — an action you take against other people — and makes the aggressor pay for it by going dark at exactly the moment information is flying.

## How it works

**Phone (private):** two word-cards, e.g. `MOON` and `TRAP`. Somewhere in the room, exactly one other player holds `LIGHT` and `DOOR`. Four valid compounds exist across the eight cards.

**Scoring a pair:** say one of your words aloud. Any player whose hand completes it taps **MATCH** within 4 seconds. Both score; both cards leave play. You never learn who holds what until they claim.

**The snare:** each player has exactly one, armed from their phone. Arming blacks out *your* screen for 8 seconds — you cannot see your hand and you cannot tap MATCH. If anyone voices anything in that window, the server attributes it, burns one of the speaker's cards (dead for them *and* for whoever held its other half), and pays the trapper. If the room stays silent, the snare is wasted.

**Host TV (shared):** the burn pile of dead compounds, the clock, and a single red dot that lights whenever ≥1 snare is armed — delayed 1.5 seconds on both onset and release. You learn a trap exists, never whose, never exactly when. The room drifts into speaking in short nervous bursts, watching the dot.

The knife-edge: your snare is blind, so you may burn the exact partner you needed.

## Technical approach

Host tab + phone PWAs + a Socket.IO server behind Tailscale Serve. State: `players[] { cards[2], snareUsed, blackoutUntil }`, `armedCount`, `burnPile[]`, `pairIndex` mapping card → holder.

Phones stream 20 Hz RMS plus a cheap voicing flag (autocorrelation pitch periodicity, 80–350 Hz) so chair scrapes and door slams don't trip snares. Attribution during a snare window = `argmax(rms_i − floor_i)` over devices *excluding* the speaker's own phone, requiring ≥2 consecutive voiced frames to fire.

The hard part: the TV's red dot must lag arming by exactly 1.5 s deterministically, server-timestamped, or clever players read their own network jitter as a tell. Also MATCH taps and snare fires can land in the same 40 ms window — the server resolves strictly by receive order and broadcasts the outcome, never letting a client decide.

## v1 scope

- 4 players, 8 cards, 4 valid compounds, one 4-minute round
- One snare per player, 8-second blackout, single-use
- TV: burn pile, clock, lagged red dot, final score

## Out of scope

More than 4 players, multi-round play, snare upgrades, custom word packs, any transcription of what was actually said, rejoin after disconnect.

## Risks & unknowns

Voicing detection may false-fire on laughter — likely acceptable, possibly hilarious. Players may converge on pure pointing and card-showing, defeating the loop; mitigation is that cards live only on-screen and screens are small. Four minutes may be too long once everyone goes turtle.

## Done means

Four phones each show two private cards. A spoken word gets a MATCH tap from the correct holder and both score. An armed snare blacks out its owner's screen, fires on the next voiced sound, correctly attributes it to a phone other than the speaker's own, burns a card, and the TV's red dot lights and clears 1.5 s late.
