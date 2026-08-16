## Overview

A 4–6 player, one-clip betting game for a group that already watches things together. The TV plays 90 seconds of video. Your phone is a private betting slip on *time itself*: you stake chips on specific seconds as they go by, without knowing which of four questions will be asked at the end.

## Problem

Watch-along betting games all work the same way: someone authors a prop, the prop goes on the screen, everyone bets on the same public question. Once the prop is public, everyone holds identical information and the bet collapses to a coin flip with extra steps. Meanwhile the actual skill in watching something — noticing which beat *mattered* — is never scored at all. The itch: wager on attention, live, privately, before you know the criterion.

## How it works

1. **Deck up (10s).** The TV shows four candidate questions, e.g. *Which second was the biggest lie? Which second did the director want you to miss? Which second was funniest? Which second changed the scene?* Everyone reads all four. Only one will be drawn.
2. **Play (90s).** The clip runs once, no pausing. Each phone privately holds a 10-chip purse and up to three markers. Tapping FLAG stamps the current clip-second and opens a 2/3/5 stake picker. Your phone shows your own markers on a thin private timeline; nobody else's.
3. **The heartbeat.** The TV shows no positions, no names, no timeline — only a dim pulse whenever *someone* flags, delayed two seconds. You feel the room react without learning where.
4. **Draw.** The clip ends. The TV flips one of the four questions face up.
5. **Nominate (15s).** Each phone privately picks ONE of its own markers as its answer. You cannot invent a new second. If you burned all three markers on jokes and the question is about the lie, you are nominating your least-bad joke.
6. **Settle.** The clip ships with an answer key per question. Payout = stake × multiplier decaying with distance (0s: ×4, ±1s: ×3, ±2s: ×2, else 0), doubled if you were the only nominator inside the window. The TV then reveals every marker every player dropped, all at once — including the two they never nominated.

## Technical approach

Host tab, phone PWAs, one Cloudflare Durable Object per room. The host `<video>` is the clock authority and broadcasts `{playhead, wallClock}` at 10 Hz; each phone runs an NTP-style ping-pong to hold a server-time offset and maps taps to corrected clip-time locally, so no marker eats a full round trip.

Model: `Room {clipId, phase, deck[4], drawn, revealAll}`, `Player {id, purse, markers:[{t, stake}], nomination}`. Markers are written to the DO and never fanned out; only a per-500ms bucketed *count*, delayed 2s, becomes the heartbeat.

The hard part is clip-time accuracy on bad wifi: 400ms of skew makes a ±2s window meaningless and makes the reveal look rigged. Mitigation: reject any marker whose round trip exceeded 250ms, refund the stake, and show the player an honest "didn't count" toast rather than silently mis-stamping.

## v1 scope

- One hand-authored 90-second clip with four questions and a hard-coded answer key.
- 4 players, one round, three markers each, one drawn question.
- Heartbeat = a single pulsing dot. No chat, no accounts, no lobby beyond a 4-letter room code.
- Final reveal screen with all markers and chip settlement.

## Out of scope

Multiple rounds, clip library, user-uploaded video, crowd-sourced answer keys, spectators, rematch, persistent scores.

## Risks & unknowns

Answer keys are subjective — "funniest second" may need a per-question tolerance rather than one window. The heartbeat may leak too much on a small clip; a delay knob is needed. Three markers may be too many for 90 seconds.

## Done means

Four phones join by code, a 90-second clip plays once, every flag lands within 150ms of true host clip-time, one question is drawn at random, nominations are locked in 15 seconds, and the TV reveals all twelve markers and settled chip counts in a single animation.
