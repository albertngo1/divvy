## Overview

Each phone shows the same stylized map — an island, a city grid, a fantasy region — with the player's private point marked. Group asks yes/no questions about each other's points ("is your point north of the river?", "is your point in the forest?"). One player (the Imposter) has a subtly different map: rivers slightly shifted, the forest a bit larger, a town added. They must answer plausibly about their point using their alt-map, which won't perfectly match the group's map. Discussion, then vote. Per-phone matters because each map is privately rendered — a shared screen destroys the mechanic immediately.

## Problem

Map-based deduction games (Scotland Yard, Letters from Whitechapel) always assume everyone shares the same board. There's no genre where the *map itself* is the asymmetric information. Per-phone makes it trivial to hand each player a slightly different world. The imposter's job is spatial improvisation — a genuinely novel challenge that doesn't exist elsewhere.

## How it works

Room code join, 4-6 players. Server picks a map from a hand-authored library and generates a subtly modified variant for the Imposter. Every player is assigned a private point on their own map. Group takes turns asking one yes/no question directed at another player about their point ("is your point near water?"); target must answer honestly per their map. 6-8 questions total. Then discussion (60s typed chat), then vote. Imposter wins uncaught; group wins on correct vote.

## Technical approach

PartyKit or Socket.IO. Maps are SVG assets with a `features` metadata layer (`water`, `forest`, `road`, `town`) as polygons. Imposter variant is authored as a paired SVG with the same feature keys but shifted polygon coordinates. Room state = `{map_id, imposter_id, points: {player_id: {x,y}}, questions, answers, votes}`. Answer honesty is on the honor system — no server-side truth check. Point rendering: SVG circle at (x,y) on the phone's client-rendered map.

## v1 scope

3 rounds, 4-6 players, 10 hand-authored map pairs (canonical + subtly-shifted imposter version), one round per map, points auto-assigned in visually spread positions. Round: 90s question phase (round-robin, one question per player), 60s discussion, 30s vote. Score: +1 correct accuser, +2 uncaught Imposter. No custom maps, no LLM map generation, no real-time collaborative marking.

## Out of scope

LLM-generated maps, custom map upload, real-map data (OpenStreetMap etc.), collaborative marking of guesses on shared map, spectator mode, variable point count per round, voice questions.

## Risks & unknowns

Authoring paired maps that are *subtly* different is time-consuming and requires taste. 10 map pairs is a real weekend of design work. Second risk: the imposter may find their map's differences too small to use OR too obvious — needs playtest calibration on shift magnitude. Third: pointing at features by name assumes the feature vocabulary is unambiguous ("is your point in the woods?" — which woods?) — may need to constrain question templates.

## Done means

4 friends play 3 rounds on 3 different map pairs. Imposter is caught at least once, escapes at least once. At least one player says "wait, was there always a river there?" during their round.
