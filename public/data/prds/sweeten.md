## Overview
Sweeten turns passively watching a funny clip into a private betting market on your friends' sense of humor — measured live by the room's own laughter. 3–6 players, one short clip, one round. Named for the TV term for adding canned laughter: here you sweeten the pot instead.

## Problem
A group watching a comedy clip is pure passive consumption; the only 'stakes' are whether *you* find it funny. Sweeten makes the collective reaction the wagerable event — and adds a delicious conflict: the honest belly-laugh you can't suppress is the exact signal you're betting on, so trying to win fights trying to enjoy it.

## How it works
The TV plays a ~40s comedy clip with **3 pre-marked beats** (a setup, a callback, a sight gag), shown as three betting windows. Before the clip, each **phone privately** shows a bet card: distribute a secret chip stack across "Beat 1 / 2 / 3 will get the loudest room laugh." Bets lock simultaneously and hidden.

The clip plays. **Every phone's mic** runs a local loudness/laughter estimate (RMS envelope + a crude laughter band filter) and streams a normalized level to the server, which fuses all N mics into one **room laugh-meter** on the TV — a live jittering bar, no per-person attribution. At each marked beat the server snapshots peak aggregate laughter. The loudest beat wins; the pool pays **pari-mutuel** to whoever bet it, hidden split as in a real book.

The reflexive gem: your genuine laugh *is* a mic input, so laughing hard at Beat 2 literally pushes Beat 2 toward winning — great if you bet it, self-sabotage if you bet Beat 3 and now must stifle a laugh. The phone shows only your secret card + bankroll; the TV shows the shared clip, the fused meter, and the reveal.

## Technical approach
Host tab (plays clip + renders fused meter) + phone PWAs (mic capture, bet card) + WS server. Data model: `Player{bankroll, bets:{b1,b2,b3}}`, `Room{clipId, beatMarks[], phase}`, per-frame `MicSample{playerId, level, t}`. Sync: phones POST mic levels at ~15Hz; server timestamps against clip playback position (host sends clip clock, server reconciles drift) and aggregates by summing normalized levels. Hard part: **audio timing + fairness** — clock-syncing distributed mics to clip beats, normalizing for phone/distance differences so a loud phone can't dominate, and rejecting non-laugh noise (talking, claps) enough that the meter feels honest.

## v1 scope
- One hardcoded clip, 3 fixed beat marks
- 3 players, one round, fixed bankroll, simultaneous hidden bets
- Simple RMS mic level (no ML laughter classifier)
- Fused meter on TV + pari-mutuel reveal

## Out of scope
- Real laughter classification / speaker separation
- Multiple clips, clip upload, dynamic beat detection
- Anti-cheat for someone laughing into their mic

## Risks & unknowns
- Mic normalization across phones is the make-or-break; a close/loud phone skews the meter
- Ambient talking may swamp the signal — may need a push-to-measure or quiet-room assumption
- Is the reflexive tension obvious to players, or does it need one demo round to click?

## Done means
Three phones join, each secretly allocates chips across three beats, a clip plays while all three mics feed one fused laugh-meter on the TV, the server picks the peak beat and settles pari-mutuel payouts, and at least one playtest shows a player visibly biting back a laugh to protect a bet.
