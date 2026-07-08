## Overview
Overround is a live betting-pool game layered over any video the group is already half-watching — a reality-TV clip, a cooking competition, a livestream, a bad movie. The shared TV plays the content and runs the odds board; each phone is a private betting terminal with its own secret chip balance. It's for a couch of 3–6 people who want ambient TV to become a competition without a quiz-master.

## Problem
Watching something together is passive: everyone yells predictions at the screen, nobody keeps score, and the loudest opinion wins nothing. The fun of "I KNEW she'd get eliminated" evaporates instantly. Overround makes those reads cost something and pay something, privately, so bluffing your confidence and fading the crowd become the game.

## How it works
The host taps to open a **prop** on a live moment ("Does the chef plate in time? Y/N", "Next cut is a commercial?"). A 15-second betting window opens. On each **phone (private):** your chip balance, the current pool-implied odds, and a stake slider — you secretly choose a side and an amount, then lock. Nobody sees your pick or your balance. On the **TV (shared):** the prop text, a live-updating parimutuel odds board (pool totals per side, never per-player), and a countdown. When the window closes and the outcome happens, the host taps the winning side; the losing pool is split among winners proportional to stake (minus a small house "overround" that keeps the game from being zero-sum forever). The read that pays best is betting the unpopular side when you think the crowd is wrong — because odds are set by where everyone else's money went. Over ~8 props, chip counts diverge and the TV crowns the sharp.

## Technical approach
Host browser tab embeds the video (YouTube IFrame API or a screen it) and hosts the odds board; phones are PWA clients; an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve) owns all money. **Data model:** `Room{propState, pools:{A:total,B:total}, players:{id,balance,currentBet:{side,amount,locked}}}`. **Sync:** phones send `placeBet`; server validates against balance, updates pool totals, broadcasts *aggregate* odds only (individual bets never leave the server) — this privacy is the anti-cheat and the fun. On `resolve`, server computes payouts atomically and broadcasts new balances to each phone privately. **Genuinely hard part:** the betting-window race — bets must lock exactly at close with no last-millisecond peeking at final odds. Server timestamps the close; any bet arriving after is rejected; odds are frozen and hidden for the final 3 seconds so you commit blind to the settle.

## v1 scope
- 3 players, one pre-chosen 2-minute clip with 3 hand-picked prop moments.
- Host manually opens/closes each prop and taps the outcome — no auto-detection.
- Binary props only, fixed starting balance, simple proportional payout.
- One device = one player; no accounts, join by room code.

## Out of scope
- Auto-detecting moments from the video; multi-outcome props; parlays.
- Insider-tip / asymmetric-info variant (some players pre-briefed on the clip).
- Persistent bankrolls across sessions; real menus of shows.

## Risks & unknowns
- Host-as-referee friction: tapping outcomes may lag the moment. Mitigate with generous windows.
- Parimutuel with 3 players makes thin pools swingy; may need a house seed.
- Ambiguous outcomes ("was that a commercial?") cause disputes.

## Done means
Three phones join a room, the clip plays on the TV, all three place hidden bets on a prop within the window, one wrong outcome pays the two who faded the crowd, and every phone shows a correctly updated private balance — with no phone ever having seen another's pick.
