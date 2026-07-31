## Overview

A 90-second office-calendar knife fight for 3 players. Each player is both an organizer and a *resource*: every meeting card you hold requires another player as a mandatory attendee. You place meetings on a shared 8-slot workday in real time, seeing everyone else's schedule only the way Outlook shows it — coarse, anonymous, and late.

## Problem

Double-booking is the most universal coordination failure alive, and it never happens through malice. It happens because everyone is acting on a slightly stale, slightly blurred view of everyone else. No party game has made that specific latency the whole engine.

## How it works

**Host TV (public):** three columns (one per player), 9am-5pm in 8 slots, rendered as anonymous grey blocks — **at a 6-second lag**. When a player becomes double-booked, a klaxon fires and the TV shouts the *victim's* name in enormous letters. It never names the culprits. A live COST counter ticks.

**Each phone (private):** your own true, instant calendar; your 2 meeting cards ("Budget sync — 2 slots — needs ALEX"); and a drag-to-place grid. Other players' calendars appear only as **free/busy**: coarsened to 2-slot buckets, refreshed every 6 seconds, with no organizer, title, or duration. So you see "ALEX busy 1-3" but not why, not who did it, and not as of now.

Placing a meeting occupies the attendee's calendar too. If two meetings needing Alex overlap, both go red. Talking is fully allowed — and the joke is that talking is *faster than the UI*, so "fine, I'll take 2, you take 3" still detonates because a third booking was already sitting there invisibly. The signature moment: the klaxon fires, both organizers panic-drag into the same freshly-visible gap, and collide again.

At the buzzer: clean meeting +2 to organizer, conflicted meeting 0 to organizer and -1 to the victim, unplaced card -1.

## Technical approach

Cloudflare Durable Object per room. State: `Placement {playerId, cardId, startSlot}` as last-write-wins per key, plus `Card {id, owner, len, attendee}`. Each 500ms tick the server recomputes each player's attendee timeline and marks overlaps.

Critically, the coarsening is **server-side projection, not client-side rendering**: the DO keeps a 12-entry ring buffer of past snapshots, and each phone is sent `coarsen(snapshot[t-6s])` for other players and true state for itself. A curious player opening devtools must find nothing but blur — otherwise the whole game is defeated by one person with a laptop. The hard part is making that deliberate staleness read as *the world* rather than a bug: the phone shows an explicit "as of 6s ago" stamp with a visible refresh sweep, so players blame the system by design.

## v1 scope

- 3 players, 8 slots, 2 cards each, one 90s round
- Every card requires exactly one other player; durations 1-2 slots
- Drag-to-place on phone; no undo beyond re-dragging
- One host summary screen showing the true final timeline

## Out of scope

Recurring meetings, declines/counter-proposals, rooms and equipment as resources, more than 3 players, scoring across rounds, calendar import.

## Risks & unknowns

An 8x3 drag grid may be fiddly on a small phone — tap-slot-then-tap-card may beat dragging. 6s lag might feel merely broken rather than funny; test 3s/6s/10s. With only 6 cards the day may be too tight or too loose — tune slot count first, card count second.

## Done means

Three phones and a laptop: two organizers can both book Alex at 2pm, the TV klaxons ALEX within 6 seconds without naming either culprit, both meetings show red on their private grids only, and the buzzer summary replays the invisible overlap that caused it.
