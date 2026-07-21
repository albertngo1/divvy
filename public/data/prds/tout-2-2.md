## Overview
Tout turns the most passive group activity — watching a short video together — into an asymmetric-information betting market. For 3–6 friends on a couch: everyone stares at the same TV, but each phone privately holds a different rumor about how the clip ends, and you wager chips before the paused clip resumes.

## Problem
"Watch parties" are one-directional. Everyone consumes the same frames and the only interaction is shouting predictions that instantly leak. There's no stake, no private read, no payoff for being the one who guessed right — and the moment you say your guess aloud, everyone copies it.

## How it works
The host TV plays a ~30s clip and pauses at a cliffhanger beat (a game-show wheel mid-spin, a cooking-show taste test, a nature-doc chase). The host screen then shows ONLY the market: 3–4 mutually-exclusive outcomes ("lands on RED", "chef spits it out") and the live pari-mutuel pool size on each — no names, no who-bet-what.

Privately, each phone shows: (1) your chip balance, (2) a betting slip to split chips across outcomes, and (3) your TIP — a one-line rumor dealt uniquely to you, e.g. "A friend on set says it's RED." Crucially, tips are asymmetric: the server has flagged some tips reliable and some as planted red herrings, and you don't know which yours is. You're betting on your private information while trying to read whether the shifting public odds mean others got better intel than you. Betting window locks on a synchronized server timer; the host resumes the clip; the outcome resolves and the pool pays out pari-mutuel to correct bettors. One reveal screen shows every tip and who trusted theirs.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{clipId, phase, timerDeadline, pools[outcome]->total}`, `Player{id, chips, tip:{text,reliability}, slip[outcome]->stake}`. Clip playhead and the betting-lock deadline are server-authoritative — the host is a dumb renderer that seeks on server command, so a laggy phone can't bet after lock. Tips are dealt per-socket at round start and never broadcast. Sync strategy: only aggregate pool totals stream to all clients at ~4Hz; individual slips stay on the owning socket until the reveal event. Hard part: fair pari-mutuel resolution under simultaneous last-second bets — the server timestamps each bet against its own clock and hard-rejects any arriving after `timerDeadline`, then settles the pool atomically before emitting reveal.

## v1 scope
- 3 players, ONE clip with ONE pause point and 3 outcomes
- Pre-authored tip deck (one reliable, one herring, one vague) dealt at random
- Flat 10-chip bankroll, single betting window, pari-mutuel payout
- Reveal screen: outcome + all tips + payouts

## Out of scope
- Multiple rounds / running bankroll across clips
- User-supplied clips or auto-generated tips
- Front-camera reactions, live odds charting, sound betting

## Risks & unknowns
- Authoring tips that are genuinely tempting-but-wrong is content-heavy
- Pari-mutuel can feel swingy with only 3 bettors — may need a house seed
- Clip/market pacing: too long a pause kills tension

## Done means
Three phones join via QR, each sees a distinct private tip, all place hidden bets before a server-enforced lock, the host resumes the clip, and the pool pays out correctly to winners with a reveal screen naming every tip-holder.
