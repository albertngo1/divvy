## Overview

Party-scale asymmetric dungeon crawl. One player's phone is the master map — showing rooms, monsters, treasure, secret doors — while every other player's phone shows only their character sheet, current-room description, and available actions. The DM narrates verbally, taps to reveal what happens, and the players type actions blind to the geography. Think Zork run as a party game, with the DM's screen doing what a physical map used to do.

## Problem

Tabletop dungeon crawls (Zork, D&D one-shots, Dungeon World) are joyful but require prep, a full map printed out, and a DM comfortable managing state. Everyone loves the *feel* of "someone is running us through a dungeon" but nobody wants to be the person managing paper minis at a party. Concurrent room games have never taken the DM-as-god-of-shared-geometry shape — it's always symmetric or head-to-head. Per-phone is load-bearing because the map must live on ONE screen (the DM's) while the players' screens must show only what their characters know.

## How it works

Room code join. First joiner is offered the DM role; others become adventurers with randomly-rolled level-1 characters (fighter/rogue/wizard/cleric flavor). DM's phone loads a procedural or LLM-generated 8-10 room dungeon on a grid view; adventurers see only "You are in a dank chamber. Exits: N, E." + a text field. DM narrates verbally, players type actions ("Fenrir opens the door quietly", "Iona casts light"), DM taps on the map to resolve — tapping a monster triggers a combat prompt on each adventurer's phone; tapping a treasure adds an item to that room's known state. Combat = 3-round tap-timing minigame per adventurer's phone. Session ends when they escape the dungeon or all die. 15-25 min.

## Technical approach

PartyKit / Durable Objects for cheap per-room state. Room state = `{dungeon_grid: [[room_id, ...]], adventurers: {id: {hp, class, inv, current_room}}, dm_id, current_state}`. Map render on DM's phone via a small grid canvas — each room a node with visible/discovered flag. Adventurer phones subscribe only to their `current_room`'s public state (description, exits, known creatures). Dungeon generation: Haiku with `{rooms: 8, theme: <random>, difficulty: 1}` returns JSON with room descriptions + creature stats + treasure. Combat resolution deterministic client-side (tap-timing) with server arbitration. Rooms cached to disk (SQLite on the homelab) for post-mortem replay.

## v1 scope

4 players (1 DM + 3 adventurers), 1 fixed 8-room dungeon (hand-authored, no LLM in v1), 4 character classes with 2 abilities each, 3 combat types (goblin/rat/skeleton), 1 boss room. No inventory management beyond a 3-slot bag. Session ends at boss defeat or full-party death. No leveling, no character customization, no save. Web only, homelab Socket.IO.

## Out of scope

LLM-generated dungeons (v2), multi-session campaigns, character progression, inventory beyond 3 slots, non-combat encounters (traps, puzzles), voice-to-action transcription for DM narration, multiplayer DMs, PvP, spectator mode, replay UI.

## Risks & unknowns

The v1 hand-authored dungeon may feel too railroady; but LLM generation adds latency/quality risk that hurts prototype fun. The DM role is a lot of cognitive load — needs playtesting to see if it's fun or frustrating (Albert's group has patient people). Combat minigame must be tight — a bad tap-timing feel will kill the session. Verbal narration + typed player actions may create weird pacing (players wait for DM to look up from typing). May need push-to-talk voice hint on DM screen ("your turn to describe").

## Done means

4 friends open the room. One takes the DM role and describes the first room; three type "search the desk" or "attack the rat"; combat plays out; group either escapes or dies; nobody asks "wait, how does this work?" past the first room. If the DM says "let's run another one" after — v1 shipped.
