## Overview

A 4-player, 8-minute party game that steals the one mechanic every visual novel runs on: invisible affection flags. The room collectively plays a single protagonist through one short scene; each player secretly wants a different ending and can only reach it by getting specific flags set — flags that are mutually exclusive with everyone else's. For groups who like Werewolf's talking but hate its elimination.

## Problem

VN route systems are the best hidden-state machine in games and nobody has ever made them social. Played alone they're a wiki lookup; the drama only exists if the flags are hidden from *someone*. Meanwhile most "vote on the story" party games are toothless — there's no reason to care which option wins. A private route checklist gives every vote a stake.

## How it works

Six scenes. Each scene the TV shows narration and three dialogue options for one protagonist ("Kai"). Everyone votes simultaneously and privately, 20 seconds; majority executes, ties broken by the current flag leader.

**Phone shows privately:** your route card — one of four love interests, plus a checklist of three required flags (e.g. `SHARED_UMBRELLA`, `LIED_ABOUT_THE_CAT`, `DIDN'T_APOLOGIZE`) with ticks appearing as they're earned. Crucially, when the options appear your phone annotates *only your own* route's reaction: option B reads "+ sets LIED_ABOUT_THE_CAT", option A and C read nothing. You can see what helps you; you cannot see what helps anyone else.

**Host screen shows:** the prose, the three options, a live vote count with no attribution, and after each scene a one-line consequence in-fiction ("Kai says nothing. The rain gets worse.") — never a flag name.

The punchline is the failure state. At the end the server evaluates routes: exactly one complete checklist → that player wins and the TV plays their ending. Two or more players at 2/3 → nobody wins and the TV plays the Friend Ending, a deadpan 20-second slideshow of Kai being platonically fond of everyone. The whole game is therefore an argument: you must talk people into options you can't explain wanting.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object per room. Server authoritative.

Data model: `Room { code, scene: 0..5, phase, flags: Set<FlagId>, players: {id, name, routeId, revealed: FlagId[]} }`. Content is a static JSON script: scenes → options → `setsFlags: FlagId[]`; routes → `requires: FlagId[3]`. Routes are dealt at start such that the four checklists pairwise conflict on at least one flag.

Sync: phones send `{sceneId, optionId}`; server stores, never broadcasts individual votes, and emits only `{count: n}` for the progress dots. On scene resolution the server applies flags, then computes a *per-player* delta and sends each socket only its own tick updates — the annotation filter lives server-side so the private data never touches a client that shouldn't have it. Reconnect replays room state minus other players' routes.

The hard part isn't sync (turn-based, low rate) — it's authoring. Six scenes × three options must produce flag sets where hedging is genuinely tempting and the Friend Ending fires maybe 40% of the time. That's a tuning problem: run the 3^6 option space offline and check the win/friend/loss distribution.

## v1 scope

- 4 players exactly, one scene set, one 6-choice story, ~8 minutes
- 4 hand-written routes, 9 flags total
- Two endings rendered: one romance ending per route, plus the Friend Ending
- Voting only. No chat, no timer pressure beyond 20s
- Room code join, no accounts

## Out of scope

Multiple stories, 5+ players, save-scumming/rewind, art beyond typographic cards, voice, score across rounds, LLM-generated scenes.

## Risks & unknowns

The Friend Ending must land as funny, not as anticlimax — if the room feels cheated the game dies at the last screen. Flag annotations may be too legible: if you can infer someone's route from one vote, the bluffing collapses. Also, a majority vote with four players ties often; the tiebreak rule must not be exploitable.

## Done means

Four phones join a code, play six scenes in under nine minutes, and the TV plays exactly one ending consistent with the server's flag set. In three consecutive playtests, at least one session ends in the Friend Ending and at least one ends in a route win, and no phone ever receives another player's route data over the wire (verified in the WebSocket log).
