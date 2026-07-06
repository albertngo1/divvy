## Overview
Cash Out is a 3–6 player real-time betting game layered over a short video clip the group watches together. The host TV plays a curated 60-second clip (a cooking-competition tense moment, a nature-doc stalk, a reality-show argument); each phone is a private live-odds board. It's for friends who already shout predictions at the screen and want money on it.

## Problem
Watching a clip is pure passive consumption — everyone receives the same feed and reactions are shared out loud. The itch: make the feed a market, and make the tension not 'was I right' but 'when do I cash out'. Press-your-luck turns a shared video into asymmetric, private nerve.

## How it works
As the clip plays, the host emits a scripted sequence of timed **props**, each with a betting window that opens ~6 seconds before it resolves on screen: 'The soufflé collapses', 'She interrupts him', 'The lion misses'. Each phone privately shows the current prop, a YES/NO toggle, and a **streak meter**. Lock a side before the window closes; the earlier you lock, the higher the multiplier.

The press-your-luck core: correct picks compound your streak multiplier; a single wrong pick **busts** you to zero. At any moment your phone shows a glowing **CASH OUT** button that banks your current streak as safe points and sits you out of the next prop. So every window is a private dilemma — ride the hot hand for a bigger multiplier, or lock in the gains while the room is still exposed. Nobody sees anyone's streak or cash-out until the clip ends.

The host TV shows ONLY the clip, the live prop, a shrinking window timer, and anonymized 'X players still live' — never who bet what or who's leading. Phones hold all private state: your side, your multiplier, your cash-out timing.

## Technical approach
Host browser tab (owns clip playback + master clock) + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve). Data model: `Clip{propTimeline:[{tOpen,tResolve,outcome}]}`, `Player{streak, banked, live, currentPick}`. Host is timekeeper: it broadcasts `openProp{id, closesAt}` and `resolveProp{id, outcome}` stamped against its playback clock. Phones send `pick` / `cashOut`. The genuinely hard part is **window timing under latency**: a phone lagging 400ms could lock after the on-screen resolution and cheat, so the server timestamps against the host clock and hard-rejects late locks with a small grace buffer, and phones must show an honest countdown synced via periodic clock-offset pings.

## v1 scope
- 3 players, one hand-authored 60-second clip with exactly 3 props.
- YES/NO only, fixed early/late multiplier (1.5x/1.0x), one cash-out per player.
- End screen ranks banked points. One round.

## Out of scope
- Multiple clips/rounds, variable stakes, live reaction detection, user-uploaded clips, spread bets.

## Risks & unknowns
- Prop timing authoring is fiddly — windows must close before the on-screen tell.
- Clip licensing/content; v1 uses a self-made or public-domain clip.
- If everyone cashes out early, rounds fizzle — multiplier curve needs tuning.

## Done means
Three phones join, the host clip plays through, three props open and close on schedule, each phone can privately pick a side or cash out, late locks are server-rejected, busts zero the streak, and the end screen ranks players by banked points — with no phone ever revealing its streak or picks mid-clip.
