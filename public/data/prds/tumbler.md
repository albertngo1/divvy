## Overview
Tumbler is a 3-4 player cooperative safecracking game for a phones-as-controllers party setup. The host screen is a giant combination safe with one spinning wheel per player. Nobody can see their own number — you feel for the correct position through your phone's haptics — so the only way to align all wheels at once is to narrate the feel of it aloud and converge together.

## Problem
Most "crack the safe" games are solitary and silent. The itch here: recreate the tense, tactile blindness of listening for a tumbler click, then multiply it across a room so the click becomes something you have to *talk* your way into synchronizing.

## How it works
Each player owns one wheel. You spin it by dragging your thumb up/down the phone screen; there are no numbers printed. As your wheel passes its secret target position, the phone fires a short haptic pulse — a soft double-buzz for "close," a sharp single buzz at dead-center. Let go and your wheel slowly drifts off-target, so you can't just park it. The safe unlatches only when ALL wheels are simultaneously held within their center tolerance for a shared 1-second window.

PRIVATELY, each phone shows: a blank dial, a drift indicator, and haptic feedback for that wheel only. The host screen shows PUBLICLY: all wheels spinning, a shared "latch tension" meter that climbs as more wheels sit on-target at once, and a countdown clock. Because nobody sees numbers, players must call it aloud — "I've got mine, holding!" "Two of us are on, who's drifting?" — and count down to the joint hold. Later rounds add a wheel that reverses direction and a decoy near-click.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ players[], targets[perWheel], phase }`, and per-tick `WheelState{ playerId, position(0-359), velocity, onTarget:bool, holdMs }`. Clients send drag deltas; the server is authoritative for position, drift decay, and the all-wheels-aligned check, broadcasting at ~20Hz. Haptics fire client-side via `navigator.vibrate()` driven by server `onTarget`/`near` flags. The genuinely hard part: the joint-hold detector must tolerate variable phone latency — a wheel that server-side left target 80ms ago shouldn't break a hold the player believes is valid. Solve with a short grace buffer on each wheel's `onTarget` and evaluate the alignment window against server-stamped hold intervals, not raw client pings. Vibration reliability differs across devices, so ship an on-screen buzz-flash fallback.

## v1 scope
- 3 players, 3 wheels, one safe, one round.
- Haptic single-buzz at center, no decoys or reversing wheels.
- Drift decay + 1-second joint-hold win check.
- Host shows wheels + tension meter + timer; phones show blank dial + drift.

## Out of scope
- Multiple safes, difficulty tiers, reversing/decoy wheels.
- Scoring, streaks, cosmetics, spectators.
- Reconnect/rejoin mid-crack.

## Risks & unknowns
- iOS Safari throttles/limits `navigator.vibrate()` — the visual fallback may become primary, weakening the "feel it" premise.
- Drift speed tuning: too fast is frantic noise, too slow removes the need to coordinate.
- Latency skew could make the joint hold feel unfair or unreachable.

## Done means
Three phones join, each feels a distinct haptic click on their own wheel, and the safe visibly unlatches on the host screen only when all three players verbally coordinate a simultaneous 1-second hold — and stays shut if anyone drifts.
