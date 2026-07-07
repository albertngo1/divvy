## Overview
On Three is a concurrent-room party game for 3–6 players: a shared host screen plus one private phone controller each. The whole room is trying to reach unspoken consensus — every player privately commits to a symbol, all reveal simultaneously, and the goal is to get the ENTIRE room playing the same symbol in one reveal, with no talking.

## Problem
Schelling-point games ("say the same thing") usually run one guess and stop. There's no *arc* — no sense of the room narrowing in real time. On Three adds a funnel: the option space physically shrinks as you converge, so the pressure to read the room ratchets every round instead of resetting.

## How it works
All phones share the same hand of 9 symbols (☂ ⚓ 🔑 …). Each round the host screen pulses a 3-count. During the count, each phone PRIVATELY lets you tap-select exactly one symbol (highlighted only on your own screen) and locks it face-down. On "three," the host reveals the multiset of picks as anonymous face-up tiles — e.g. "3× anchor, 2× key, 1× umbrella" — never who played what.

The twist: whichever symbol got the MOST votes is burned off the board (grayed, unplayable) after the reveal — matched majorities are "used up." Ties burn both. So the pool of shared symbols shrinks each round, forcing the room toward a corner. You win the instant a single reveal is unanimous. You lose if the board burns down to fewer symbols than players (impossible to be unanimous).

Privately your phone shows: your hand (with burned symbols crossed out), your current locked pick, and a tiny "you were in the majority / minority last round" badge — a signal only you see. The host shows only the anonymous aggregate histogram and the burn animation.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room). Data model: `room {code, phase, symbols[], burned[], players[]}`; `player {id, name, lockedPick, majorityHistory[]}`. Sync: host and phones subscribe to room state; the count-in is server-driven (server emits `reveal_at` timestamp, clients render the 3-count locally against clock offset). Picks are collected during a lock window; the server withholds the aggregate until `reveal_at`, guaranteeing simultaneity so nobody can peek-and-copy. Hard part: fair simultaneity + anti-snoop — the server must accept a pick as immutable once locked and never leak counts until reveal, plus dedupe late/duplicate lock messages under flaky phone Wi-Fi.

## v1 scope
- One room, 3–4 players, 9-symbol shared hand.
- One full game = repeated reveals until unanimous or board exhausted.
- Server-driven 3-count, anonymous host histogram, burn-off animation.
- Private per-phone hand + majority/minority badge.

## Out of scope
- Scoring/streaks across games, avatars, custom symbol packs.
- Reconnect-mid-round recovery beyond a simple rejoin.
- Spectators, chat, sound design.

## Risks & unknowns
- Might resolve too fast with 3 players; needs a hand-size vs player-count tuning pass.
- Burning the *majority* could feel punishing rather than convergent — may need playtesting vs. burning the minority.
- Anonymity + no talking may leave players rudderless; the private badge may not be enough signal.

## Done means
Four phones join a host code, a server-timed 3-count fires, all four lock privately, the host reveals an anonymous histogram, the top symbol burns, and the game correctly declares victory on a unanimous reveal — with no phone ever seeing another's pick before reveal.
