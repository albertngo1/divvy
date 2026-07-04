## Overview
An anonymous "who is most likely to X" party game where the room votes secretly on each other and only sees aggregate counts. No one ever learns who voted for whom, which is the entire point — the anonymity is what lets people vote honestly about their friends without torching the friendship.

## Problem
"Most likely to" games are hilarious in theory and toxic in practice: whoever writes down "Marcus" for *most likely to ghost their therapist* has to look Marcus in the eye. Passing paper or shouting votes destroys the honesty. A per-phone secret ballot with aggregated reveal is the only way this game works — and it's exactly the kind of thing that's impossible without networked phones.

## How it works
Everyone joins the room via code. A prompt appears on all phones ("Who's most likely to fake their own death for the insurance?"). Each player taps a name from the roster on their own phone — the vote is private, no one else sees the tap. Once all votes are in, the reveal screen shows counts only: "Marcus: 4 votes. Priya: 2 votes. You: 1 vote." Individual votes are never surfaced. Next prompt. Play until the prompt deck runs out or people are laughing too hard to continue.

## Technical approach
WebSocket-backed room state (PartyKit Durable Object or Socket.IO on the homelab). Each phone opens a persistent socket keyed by a per-player token. Votes are POSTed to the server and stored keyed only by voter-token → target-token; the server never emits the raw map, only the tally per prompt. Prompt deck is a static JSON file for v1 (curated ~80 prompts). Per-phone privacy is load-bearing: the ballot UI only exists on the voter's device, and the aggregation happens server-side so no client ever holds the raw votes. Optional Haiku-generated prompts later, but v1 uses a hand-authored deck for quality control.

## v1 scope
- Room code join, 4-10 players
- Static prompt deck (~80 curated prompts)
- Per-phone secret ballot (tap-a-name)
- Aggregate-only reveal (counts, no attribution)
- Advance-to-next-prompt when all votes in
- One round = full deck or host ends

## Out of scope
- LLM-generated prompts
- Prompt voting / skip mechanic
- Persistent leaderboards across rooms
- Custom prompts submitted by players
- Any post-game "who voted for you" reveal

## Risks & unknowns
- Prompt quality is everything — a bland deck kills it
- Small groups (4 players) make counts too revealing (a "4" means everyone)
- Need a graceful handling of ties and abstentions
- Someone WILL screenshot and try to reverse-engineer votes

## Done means
Four to ten people can join a room on their phones, get served a prompt, secretly vote for another player, and see an aggregated tally with no individual attribution. Ten prompts play cleanly end-to-end without anyone learning who cast which vote.
