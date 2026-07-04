## Overview
Straight Face is a concurrent-room party game where staying silent is the entire scoring axis. Each player holds their phone as a private feed of provocations — jokes, cursed images, dares, oddly personal 'read this silently' confessions — that they must absorb without making a sound. For 3–6 friends who love the 'try not to laugh' genre but are tired of one shared prompt everyone sees at once.

## Problem
'Don't laugh' games collapse when everyone sees the same trigger: the room laughs together, nobody can tell who broke first, and there's no strategy. The itch is a *private* temptation — you cracking at something no one else can see, and the paranoia that your calm friend is one card away from losing it too.

## How it works
The host screen (TV) shows a row of avatars, each with a live **Composure Meter**, a round timer, and a big 'BROKE!' banner when someone fails. It shows *no* provocation content — the content lives only on phones.

Each phone PRIVATELY shows: your current provocation card (auto-advancing every ~8s), your own composure state, and a one-time **'Pass to…'** button that lets you fling your *next* card into a chosen opponent's queue. You never see anyone else's cards — so you can't predict why a friend is struggling, only that they are.

Every phone runs its mic locally, computing a rolling loudness (RMS) level and streaming just that number. When any phone crosses a threshold above room ambient, the server flags a **break event** and attributes it to the loudest correlated phone. That player is out; last one composed wins.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {code, phase, players[]}`, `Player {id, name, queue[], composure, broken}`, plus a static provocation deck. Phones stream a lightweight RMS float every ~200ms (never raw audio). Server holds authoritative composure state and resolves break events. **Genuinely hard part:** attributing a laugh to the *right* phone when the whole room is loud and every phone hears every laugh — needs per-phone calibration to each device's ambient baseline plus relative-loudness comparison in a short window, not a global threshold.

## v1 scope
- 1 round, 4 players
- Deck of ~20 hand-written provocations
- 60-second round, cards auto-advance
- Exactly ONE 'Pass' per player
- Loudest-phone-breaks detection + composure meters
- Win/lose screen

## Out of scope
- Actual laughter classification (loudness only)
- Multiple rounds / scoring across games
- User-submitted cards, images beyond a fixed set

## Risks & unknowns
- Cross-phone bleed making attribution unreliable in a small room
- Threshold tuning: coughs/talking vs. genuine breaks
- Content that's funny-not-mean is hard to author

## Done means
Four phones in one room, one 60s round: each player sees a different private card stream, the first person to audibly laugh is correctly singled out on the host screen at least 8/10 times in playtest, and a 'Pass' visibly loads a target's next card.
