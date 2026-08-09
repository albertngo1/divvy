## Overview

A 3-player game for the twenty minutes a group wastes arguing over a delivery menu. The menu stays real, the argument stays out loud, but underneath it every player is quietly holding a position they can't admit to.

## Problem

Group ordering is a status negotiation pretending to be a decision. The loud person wins, the quiet person eats something they didn't want, and nobody gets credit for the maneuvering. The itch: make the persuasion *scored*, without turning dinner into a board game night.

## How it works

The host TV shows a 12-dish menu, a shared CART (max 4 dishes), a 3:00 timer, and per-dish odds.

Each **phone privately** shows: an Appetite card (2 specific dishes, worth 15 points each if they're in the final cart), 20 chips, a sealed betting panel, and your private ledger of where those chips went.

The **host TV publicly** shows: the cart contents with the name of whoever last touched each dish, the timer, and — crucially — the *aggregate* chip volume on each dish with no attribution, converted into a live "pays 3.2× if it survives."

Public actions are ADD and PULL: tap a dish, your name lands on the TV next to the change. Everything else is talking. Real talking, out loud, for three minutes.

The load-bearing rule: **you cannot bet on a dish you added to the cart yourself**, and the ban is sticky even if you pull it later. So your money and your mouth are structurally separated. To cash in on the birria you're certain will win, you have to make someone else add it — while your Appetite card is dragging you toward dishes you can never profit from.

Betting closes at 2:30, cart locks at 3:00. The last 30 seconds are pure persuasion with the money already down, which is where it gets loud. Pari-mutuel payout: the pot splits across bets on the four surviving dishes, so piling onto the obvious favourite pays almost nothing.

## Technical approach

Host tab + phone PWAs + one Durable Object per room.

State: `menu[12]`, `cart` (ordered, capped at 4, each entry carrying `lastToucher`), `bannedDishes: Set` per player, and `bets: Map<playerId, Map<dishId, chips>>` held **server-side only** — the server broadcasts per-dish totals and never per-player attribution.

Cart mutations are server-authoritative ops, not client state. The hard part is contention: two players tapping ADD on the 5th dish within 50ms of each other. Last-write-wins reads as a bug to the room, so the server enforces a 400ms per-player action cooldown, applies ops in arrival order, and rejects overflow adds with a visible "cart full" flash on the TV — the rejection is part of the drama. Bets are irrevocable on commit; the betting-window close is enforced server-side against the room clock, not the phone's.

## v1 scope

- 3 players, one hardcoded 12-dish taqueria menu
- 3:00 timer, betting closes at 2:30
- 20 chips, one 2-dish Appetite card each (dealt disjoint)
- Cart cap 4, single round, one reveal screen

## Out of scope

- Importing a real delivery-app menu, actually placing the order, prices or a budget constraint, dietary filters, multiple rounds, 4+ players.

## Risks & unknowns

The loudest player may still dominate — the self-add betting ban is the main counterweight and may not be enough. Pari-mutuel is opaque to non-gamblers, so the TV must show plain-language payouts, never fractions. If Appetite cards overlap, the conflict evaporates; deal them disjoint. Three minutes is a guess and may want to be two.

## Done means

Three phones and a TV: a cart of exactly 4 dishes at timeout, a reveal screen showing each player's Appetite card, bets and payout, a server that rejects a bet on a self-added dish, WebSocket frames inspected to confirm no per-player bet attribution ever leaves the server — and at least one playtester arguing hard for a dish they hold zero chips on.
