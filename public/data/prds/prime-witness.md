## Overview
Prime Witness is a hidden-role party game for 4-6 players on one shared host TV plus a phone each. Everyone is a witness to the same illustrated crime scene; one player secretly holds a doctored copy, and the group must find them by cross-examining memories.

## Problem
Social-deduction games almost always make the imposter LIE. The itch: what if the imposter isn't lying at all—they're honestly, confidently certain, and their certainty is exactly what betrays them? Existing spot-the-difference games let you compare two pictures side by side; nobody has to remember, testify under pressure, or suspect that the odd one out might be themselves.

## How it works
The host screen shows a blank "evidence board" and a 25s timer. Each phone PRIVATELY displays the same crime-scene illustration, zoomed so only ~40% fits on screen—you drag to pan around and study it, never seeing the whole thing at a glance. One random player (the Ringer) receives a version with exactly two subtle edits: a knife becomes a candlestick, a clock reads 3:00 instead of 9:00, a scarf turns green. Every phone shows the same warning—"Your file may have been doctored. Blend in."—so no one, including clean witnesses, is certain it isn't them. After study, the host asks three rapid detail questions ("What's in the victim's left hand?", "What time is the clock?"). All phones answer PRIVATELY and SIMULTANEOUSLY—you cannot see anyone else's answer before committing, so you can't copy the crowd; you must answer from your own memory of your own view. The host then reveals each question's answers as an anonymous grid. On edited details the Ringer diverges; a Ringer who senses heat can gamble and match the crowd, but a clean player's genuine answer may contradict them. Discussion, then one private vote. Town wins by catching the Ringer; the Ringer wins by surviving.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object). Data model: Room{sceneId, edits[], ringerId, phase, questions[], answers{playerId:{qId:val}}, votes}. The server assigns the scene, generates the doctored variant, and streams the correct image URL to each phone (Ringer gets the edited asset). Sync: a server-authoritative phase machine (STUDY→Q1→Q2→Q3→DISCUSS→VOTE); answers are held server-side and broadcast only after all commit or the timer fires. This atomic simultaneous reveal is the crux—leaking one early answer lets others herd and kills the deduction. The genuinely hard part is authoring edits subtle enough to fool yet decidable by a pointed question.

## v1 scope
- 4 players
- One hand-authored scene with exactly 2 edits
- 3 fixed detail questions, constrained multiple-choice answers
- One round, single vote, host declares winner

## Out of scope
Multiple scenes/rounds, cross-game scoring, free-form accusations, generated art, spectators, reconnection grace.

## Risks & unknowns
Edits too obvious (instant catch) or too subtle (unanswerable); a crowd-copying Ringer may reduce it to a coinflip—needs playtest tuning of how "hot" each question is; free-text answers collide ambiguously, so v1 uses multiple-choice.

## Done means
Four phones join, each pans its own image, the Ringer's differs, all answer three questions with nothing visible until reveal, the host grid shows divergence on edited details, the group votes, and the server names the Ringer and the winner.
