## Overview
A private-betting party game for 3-6 people watching a short video clip together on the TV. It turns passive group watching into an insider-trading floor: the clip is the market, and each phone is a bettor holding a secret edge.

## Problem
Group video nights are pure passive consumption — everyone just watches. There's always a latent 'ooh that's gonna fall' hunch in the room, but no stakes, no payoff, and no way to profit from reading the clip better than the person next to you.

## How it works
The host TV plays a curated 60-90s clip (a cooking-fail reel, a nature clip, a sports blooper montage). The server holds a hidden timeline of three 'prop' moments, each a yes/no outcome scheduled at a timestamp ('~0:20: the stacked glasses topple — YES'). At start, each phone is privately dealt ONE true insider tip about one future prop. The host screen shows a live betting board: each open prop with a countdown, its current parimutuel odds, and every player's chip stack. Phones PRIVATELY show your secret tip, your balance, and bet controls (pick prop, YES/NO, amount) — hidden from everyone until that prop resolves. You have a guaranteed edge on your tip prop, but hammering it for max chips broadcasts confidence to sharp opponents, who tail your side and split your edge. When a prop's timestamp passes, the host reveals the outcome and settles chips with an animation. Most chips after three props wins.

PRIVATE per phone: your insider tip, your bet side+size before resolution, your running balance. SHARED on host: the clip, the prop board with aggregate pools/odds, each resolution, final standings. A single passed-around phone collapses the entire asymmetric-information engine — the fun IS that only you can see your tip and your bet.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{clipId, phase, props:[{id, tResolve, label, status, poolYes, poolNo}], players:{id, balance, tip, bets:[{propId, side, amount}]}}. Sync: the host tab is the clock authority — it plays the video and relays `timeupdate` to the server, which emits prop-open / prop-lock / prop-resolve events keyed to video currentTime (never wall-clock, so pauses/buffering stay fair). Phones only send bet intents; the server validates balance and freezes bets on prop-lock (e.g. 3s before the visible outcome). Genuinely hard part: closing bets fairly before players can see the outcome — solved by driving all timing off the host's relayed video clock and broadcasting a hard lock, plus pre-authored deterministic outcomes so no live judging is needed.

## v1 scope
- One hardcoded 60s clip
- 3 players, one round
- 3 pre-timed binary props
- Each player dealt exactly one tip
- Flat starting chips, simple pool-split payout
- Host shows board + settle animation + winner

## Out of scope
Playlists, user-uploaded/live video, dynamic bookmaker odds, more than one tip per player, spectators, persistent bankroll.

## Risks & unknowns
Video-clock vs bet-lock fairness under buffering; whether one tip is enough edge with only 3 players; clips must have unambiguous binary outcomes; submission latency right at the lock.

## Done means
3 phones join, watch the clip, each privately sees its own tip, places at least one hidden bet, all 3 props resolve on the host at the correct timestamps, chips settle correctly by parimutuel, a winner is shown — and no bet is ever visible to anyone else before its prop resolves.
