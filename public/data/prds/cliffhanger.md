## Overview
Cliffhanger is a 3–6 player nerve game that turns the most passive thing a group does — watching a clip together — into a private, simultaneous crash-betting duel. The TV plays a short suspense clip (a diver on the high board, a slow-tipping Jenga tower, a trick-shot windup). A payout multiplier ticks upward as it plays. Each phone is a private cash-out button.

## Problem
Watching a tense video with friends is pure passive consumption — you yell 'oh no' and that's it. There's no stakes, no individual skin in the moment, and no way to be *right* while your friends are *wrong* about the exact same footage you're all staring at.

## How it works
Everyone antes a fixed stake. The host presses play. The clip has a hidden **resolve moment** baked into its metadata (the splash, the collapse, the make/miss). From play, a multiplier rises on a shared server clock: 1.0× → climbing. On the TV, everyone sees the SAME footage and the SAME climbing multiplier. But cashing out is PRIVATE and per-phone: you tap 'CASH OUT' whenever your nerve breaks, banking stake × current multiplier. If the resolve moment fires before you've tapped, you bust and lose your stake.

The load-bearing secret: **you cannot see when others cashed.** The TV shows only anonymous 'someone just folded' blips — never who or at what multiplier. So you're reading the footage, reading the room's flinches, and second-guessing whether the tower tips at 2.1× or 4.8×, alone, with your thumb hovering. One phone passed around is impossible — the entire tension is N people each holding a private, simultaneous fold decision over identical shared footage.

What's PRIVATE: your live cash-out button, your banked multiplier, whether you're still in. What's SHARED: the clip, the climbing number, anonymous fold blips, and the post-reveal scoreboard showing who nerved it closest.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. The server owns the clock and the truth: it starts a monotonic timer at play, computes `multiplier = f(elapsed)`, and holds the clip's `resolveAtMs`. Phones send only `CASHOUT` events; the server timestamps them against ITS clock (not the phone's) and locks the banked value — so phone-side lag can't be gamed. The TV is the pacing reference; the multiplier readout on phones is cosmetic and interpolated, authoritative only server-side. The genuinely hard part is **latency fairness**: the video on the TV, the multiplier on 6 phones, and the resolve moment must agree to within ~150ms, or someone busts on a splash they hadn't seen yet. Mitigation: server pre-buffers the clip, sends a synchronized 'play at T' countdown, and settles all cash-outs by server-receipt time with a small fixed grace window.

## v1 scope
- 3 players, one round, one hardcoded clip with a known resolve timestamp.
- Linear multiplier, fixed equal ante, single cash-out per phone.
- Anonymous fold blips + final scoreboard.

## Out of scope
- Multiple clips / rounds / persistent bankroll.
- Variable antes, partial cash-outs, doubling down.
- User-uploaded clips or live streams.

## Risks & unknowns
- Clip curation is the whole product — needs footage with a genuinely unpredictable, cleanly-timestamped resolve moment; too obvious and everyone folds at 1.3×.
- The crash-game core resembles casino 'Aviator'; the novelty rests entirely on it being tied to shared suspense footage, so a flat clip kills it.
- Sub-150ms A/V-to-phone sync over consumer Wi-Fi is the real engineering bet.

## Done means
Three phones join, the TV plays one synchronized clip with a rising multiplier, each phone can privately cash out and bank stake × server-authoritative multiplier, anyone who hasn't tapped by the resolve moment busts, and the final scoreboard ranks players correctly — with no phone ever seeing another's live position.
