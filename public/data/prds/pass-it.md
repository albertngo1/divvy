## Overview

Sushi Go / 7 Wonders-style card drafting reduced to its Platonic form. Each phone shows a private hand of cards; you pick one to keep, then tap "pass"; the remaining hand slides instantly to the next player's phone. In-person, this mechanic requires everyone holding hands up, waiting for the slowest picker, then physically rotating cards clockwise — the tedious part of every draft game. Per-phone eliminates the wait: hands transit in 100ms and the game's fun mechanic (agonizing card picks under uncertainty) is left intact.

## Problem

Every board gamer knows card drafting is elegant in theory and painful in practice — you spend more time waiting for the slowest picker + physically rotating stacks than actually deciding. Digital versions on tablets exist (Sushi Go Party app) but they're single-device pass-and-play, not truly per-phone. Nobody has built a per-phone concurrent-room drafting engine that could be reskinned to any drafting mechanic (Sushi Go, 7 Wonders, Blood Rage, Guilds of Ravnica).

## How it works

Room code join, 3-6 players. Session start: each phone gets a hand of 8 cards (e.g. simple Sushi Go-style: nigiri/sashimi/dumplings/tempura/wasabi/pudding). Countdown to pick phase: 15 seconds. Each player taps a card to keep; on tap, that card moves to your "kept" pile (private display on your phone), and the remaining hand animates a slide-off to the next player's phone. If someone doesn't pick in 15s, the game auto-picks the leftmost card for them (nudge). After 8 rounds (hand exhausted), scoring animation reveals kept piles; server computes combo scores. 3 hands per session (short + long game modes). Score at end.

## Technical approach

PartyKit or homelab Socket.IO. Room state = `{hands: {player_id: [card_ids]}, kept: {player_id: [card_ids]}, round, direction}`. Cards defined as JSON: `{id, type, base_score, combo_rule}`. On tap: server moves picked card to `kept`, rotates hands array, broadcasts new state. Scoring engine evaluates each player's kept pile against combo rules (e.g. "5 sashimi = 10 points, 3 nigiri sets score triples").

## v1 scope

4 players, one card set (Sushi Go-adjacent: 6 card types, ~40 total cards), 3 hands per session (8 cards each), 15-sec pick timeout with auto-pick, single scoring engine, final scoreboard. No custom card sets, no LLM-generated variants, no draft rules variation (always pick-one-pass-rest), no advanced combos.

## Out of scope

Multiple card sets, custom card design UI, LLM-generated combo rules, draft variations (pick-two, pick-and-ban), animations beyond the essential card-slide, spectator mode, session history, cross-session leaderboards.

## Risks & unknowns

The 15s timer needs playtest — too short is stressful, too long is boring. Auto-pick behavior on timeout is polarizing (some players want it, others feel robbed). Scoring engine complexity determines how re-playable the game is: Sushi Go's Nigiri/Sashimi combos are the *reason* it's replayable, not just "pick cards." Card art is a real cost — v1 could use emoji or plain text cards, but that risks feeling cheap. Play question: does the "pick under pressure" tension survive when the hand transit is instant vs. the deliberate pace of physical passing? Instant may make it feel less strategic; may need artificial slow-down.

## Done means

4 friends open the room, play through 3 hands (24 total picks each), and see a scoring reveal that produces at least one "oh that's how you get sushi rolls to score!" moment. If someone hoards puddings in a doomed strategy and everyone laughs at the reveal, v1 shipped.
