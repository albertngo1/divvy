## Overview
Four players, one virtual box of 12 diamonds, passed phone to phone. A riff on *Mafia de Cuba* in which the box is a private stream and the only public fact in the entire game is the remainder. One round, about seven minutes, for a group that enjoys arguing.

## Problem
Mafia de Cuba runs on a single beautiful asymmetry: each player briefly holds knowledge nobody else has — how many diamonds were in the box when it reached them. Around a table that is enforced by cupped hands and good faith, and it breaks constantly. People peek, miscount, or the physical box telegraphs its weight. Phones enforce it perfectly, and better, they timestamp it.

## How it works
Pass order is public and shown on the TV: A → B → C → D. The pool starts at 12.

On your turn your phone requires a press-and-hold — the screen blurs the instant a finger lifts — and privately shows one number: the count that arrived at you. You take 0–4 and pass. Your phone then shows what you took and what you passed on, and never shows anything again.

So A knows only 12. B knows 12 and 12−a. D knows the whole prefix. The last player is the best-informed and therefore the most suspicious, and that asymmetry is the whole game.

The TV shows exactly one number at the end: the remainder R.

Then 90 seconds of open talk, where anyone may claim any number they saw, truthfully or not. Everyone is lying inside a shared arithmetic constraint — claims have to sum-check against R or somebody notices.

Finally all four phones simultaneously and privately accuse: *who took the most?* The biggest taker banks their diamonds if fewer than two players accused them; each correct accuser scores 3. Ties break toward the earlier position.

## Technical approach
Cloudflare Durable Object per room, WebSocket to the host tab and phone PWAs. State: `{order: [ids], pool, takes: {id: n}, phase, accusations: {}}`. `takes` is write-once per player and is never broadcast.

Turns are strictly serialized: the server accepts a TAKE only from the id whose turn it is, and the projection sent to a phone contains exactly one integer — the incoming count — never the array.

The hard part is reconnect without leakage. If C drops mid-turn and rejoins, the server must re-serve C's *player-bound projection* (their one number), not a state snapshot, and must refuse to re-serve anything to a player whose turn has passed — otherwise players force a rejoin to re-read numbers they were supposed to memorize. The host tab must also sit on a strictly narrower projection than any player, so casting or screen-sharing the TV can never reveal a take.

## v1 scope
- Exactly 4 players, one round, pool of 12, take 0–4
- Public pass order, hold-to-view gate, 90s talk timer on the TV
- Simultaneous private accusation and one scoring formula
- Final reveal screen listing every take

## Out of scope
Multiple rounds, role cards (henchman, informant), secret pass order, variable pool sizes, mic or voice features, more than 4 players.

## Risks & unknowns
Whether four players and one public number generate enough talk. The arithmetic may be solvable deterministically at pool 12, which would need a decoy — a pool drawn from 11–13 and shown to nobody. Memory load on the last player may be unfair in the wrong direction.

## Done means
Four phones join; each phone's network log shows it received exactly one pool number and never the takes array; the TV displays only the remainder until reveal; a forced mid-round reconnect re-serves the same single number and nothing else; and one full round ends on a reveal screen with correct scores.
