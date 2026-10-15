## Overview
Knock-On is a 4-minute hidden-information game for 3–5 players. The TV shows a silly 12-event timeline, such as "1903: Grandpa buys a goat." Each player secretly picks one event to change. A change scores for every event downstream of it, but any two players whose downstream reach overlaps are both cancelled. It is for groups who enjoy arguing over a whiteboard.

## Problem
In most anti-coordination games, the conflict is visible: two people pick the same thing. Here the collisions happen through hidden chains of cause and effect. You can announce "I'm taking the goat" and still collide with someone three events away because of an arrow only they could see. Greed pushes everyone toward early events with big ripples, and the ripples from early events overlap the most.

## How it works
- **Host screen:** 12 event cards in date order with no arrows, a 3-minute discussion timer, and then the reveal. During the reveal, the full cause-and-effect graph animates in, each player's ripple floods outward in their color, and overlapping ripples flash and are wiped out.
- **Private (phone):** the same 12 events, plus 4–5 secret arrows dealt to you. Together, all phones hold every arrow, and each arrow is on exactly one phone. A one-tap "Rewrite" pick can be changed until the timer ends. A private estimate shows your ripple size counted using only your own arrows, and it always underestimates.
- **Talk:** players may say anything, including arrows, but nothing is verifiable. You have reasons to lie. Telling a rival "the goat leads to the war" scares them away from a big-ripple event you want.
- **Scoring:** each surviving player scores their ripple size, meaning the number of events downstream of their pick. Cancelled players score 0. The highest score wins.

## Technical approach
- Server state: `events[12]`, `edges[]` from a hand-built acyclic graph with about 16 edges, `deal[playerId] = edgeIds[]`, and `picks[playerId] = eventId | null`.
- Ripples are computed with a breadth-first search on the server at reveal. Two ripples collide if they share any event, including the picked event itself.
- Each phone gets only its dealt edges. The server never sends the full graph before the reveal, so a phone cannot leak it.
- **Hard part:** designing the graph, not syncing it. The graph has to make early events tempting but dangerous and leave 2–3 valid safe layouts for 4 players. v1 uses one hand-tuned graph and a small brute-force checker that confirms at least one collision-free set of picks exists for every player count.

## v1 scope (humiliatingly small)
- One hand-written 12-event timeline and one fixed graph
- 3–5 players, one round
- Pick, change, and lock in, followed by one animated reveal
- No AI-generated timelines and no rematch

## Out of scope (for now)
LLM-generated timelines, multiple rounds, partial-credit overlaps, spectator voting, and themed decks.

## Risks & unknowns
- Players may simply share all their arrows honestly. Test whether the incentive to lie is strong enough, and add a bonus for the largest surviving ripple if it isn't.
- 12 events may be too few to create tension, or too many to discuss in 3 minutes.
- Without arrows on the TV, discussion could stall. A shared scratchpad is a possible v2.

## Done means
Four phones each receive a disjoint set of arrows, and their union matches the full graph. Picks lock when the timer ends. The reveal draws the ripples correctly and cancels both players in every overlap. A scripted test of 4 fixed picks gives the expected scores. In a playtest, at least one player should be cancelled by an arrow they never saw.
