## Overview
Watch Time is a 3–6 player party game where the shared TV is a fake infinite-scroll feed and each phone is a private betting slip plus a hidden attention meter. It turns the most passive act there is — lean-back scrolling — into a live prediction market on the room's own inability to look away.

## Problem
"Passively consuming a feed" is the opposite of a game: nobody's competing, everyone's a spectator. But attention is the one thing a feed is actually optimized to extract, and it's invisible — you never know who else is still watching. That hidden, per-person attention is exactly what makes a betting market interesting: you're wagering on a crowd behavior nobody can see.

## How it works
**Shared host screen:** a "feed" that auto-plays 6 short cards one at a time, ~8s each, big and lean-back — a goofy emoji thumbnail, an absurd title ("guy explains why cereal is soup, ep. 4"), a fake handle and fake view count. Between/under the card, a deliberately vague aggregate "attention" bar you can't fully decode. No player identities, no bets, no per-person state ever shown here.
**Each phone, PRIVATELY:** Before the feed rolls, every phone sees the 6 upcoming titles and privately drags a small chip stake onto the card(s) they think will rack up the most *total room watch-time*. Bets lock, hidden from everyone. During playback, the phone shows one giant **HOLD TO WATCH** button for whatever card is currently on the TV. Holding accrues watch-seconds to that card server-side; releasing means you looked away. Crucially your hold state is private — nobody, not even the host screen, sees who's still watching. Your only lever on the outcome is your own honest (or strategic) attention: pad the cards you bet on, bail early on the ones you bet against. The market and the attention feed back on each other.
**Settlement:** after the last card, the host reveals total watch-time per card and pays out. Contrarian-correct bets (the sleeper hit nobody expected to hold) pay bigger odds.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{phase, feed:[Card], currentCardIdx, startTs}`, `Player{id, chips, bets:{cardId→amount}, watching:bool}`, server-owned `watchMs:{cardId→ms}`. The host owns the transport clock and broadcasts card-advance ticks; phones send `watchStart`/`watchStop` events and the server integrates hold duration against its own clock (never trust phone timers). The genuinely hard part is honest watch-time accounting: debounce flaky mobile touch, handle a phone that backgrounds mid-hold (treat as release), and clamp to the card's live window so nobody accrues time on a card that isn't playing. Bets are write-once and encrypted-until-reveal (just withheld server-side).

## v1 scope
- 3 players, one feed of 6 hardcoded cards, one round.
- Fixed chip stake, single bet per player, flat-ish payout.
- Hold-to-watch + one vague host attention bar.

## Out of scope
- Real video, user-uploaded clips, multiple rounds/seasons.
- Odds tuning, leaderboards, per-card reactions/emojis.

## Risks & unknowns
- If everyone just holds their own bet card and skips the rest, watch-time collapses to "votes." Cards must be genuinely funny so real attention fights the incentive.
- Mobile touch-hold reliability and background/lock edge cases.

## Done means
3 phones join a room code, the TV auto-plays 6 cards, each phone privately places one bet and holds-to-watch, and at the end the host shows correct per-card watch-time and pays out the winning bettors — with no phone ever revealing another player's bet or attention.
