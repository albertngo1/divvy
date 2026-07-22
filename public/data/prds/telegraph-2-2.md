## Overview
Telegraph steals the soulslike boss fight — the ritual of learning a tell and punishing the opening — and splits the *perception* of that tell across three phones. It's a tense, shouty co-op for 3 players against one TV boss.

## Problem
Boss tells are the best part of soulslikes, but reading them is a solo skill. Split the tell into pieces that no single person can see and you turn pattern-reading into frantic table talk. Crucially this can't be a passed phone: the pieces must be perceived *at the same instant* in real time.

## How it works
3 players vs one boss on the TV. The boss winds up an attack over ~4 seconds. Every attack is defined by three independent facets: **HEIGHT** (high/mid/low), **SIDE** (left/right/center), and **BEAT** (which of 4 metronome ticks it lands). The TV shows only an obscured silhouette + a running 4-beat bar — you cannot read the facets from it.

Each phone PRIVATELY reveals exactly ONE facet: A sees a clean HEIGHT icon, B sees SIDE, C sees the BEAT. Every phone has a dodge control that must be set to the FULL combined answer — you dial height + side, then tap on the correct beat. Since each player knows only a third, they must shout their facet, agree fast, and all commit within a ~±150ms window on the right beat. All 3 correct in-window = boss whiffs and eats a counter; any wrong or late = the party loses a shared heart. 3 hearts; land 3 reads to kill it.

One facet per phone, perceived live, is the whole game.

## Technical approach
PartyKit WS server as authoritative clock. Data model: `room {bossHP, partyHP, currentAttack:{height,side,beat,windowStartTs}, phase}`; per-player `{facetType, dodge:{height,side}, committedTs}`. The server rolls an attack, assigns each player a distinct facet, and pushes only that facet privately. The metronome is server-broadcast beat ticks with timestamps; clients render locally against an estimated server-time offset (NTP-style ping/pong) so the 4-beat bar lands on the same instant on every phone. Hard part: cross-phone clock sync — with no shared clock, the "commit on beat 3" window has to be the same real instant everywhere; offset estimation plus a forgiving-but-not-sloppy window (~±150ms). Commit validation is server-side against `windowStartTs`.

## v1 scope
- Exactly 3 players, one distinct facet each
- One boss, 3 attacks, 3 shared hearts
- Facet space: height(3) × side(3) × beat(4)
- Fixed 4-beat bar; land 3 reads to win
- Silhouette boss art

## Out of scope
- More than 3 players / duplicate facets, boss phases, combos
- Movement, haptics, reconnection

## Risks & unknowns
- Time-sync jitter making the window feel unfair
- TV must hide facets convincingly yet stay watchable
- 3-way verbal chaos could be too hard or trivially easy — window tuning is everything
- Audio-beat facet accessibility

## Done means
3 phones each get a distinct private facet; the room verbally combines them; when all three set the correct height+side and tap within the server's beat window, the TV plays a whiff+counter and drops boss HP; a wrong facet or a late tap costs a shared heart; the boss dies after 3 successful reads.
