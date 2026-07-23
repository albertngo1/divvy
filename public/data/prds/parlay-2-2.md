## Overview
Parlay turns background video — the muted reality/cooking clip nobody's really watching — into a private sportsbook. 3-6 players each build a secret 3-leg parlay from prop cards ('someone smiles,' 'a knife appears,' 'on-screen text'), then watch a short clip resolve those props live. All three legs hit, you cash. For friends who narrate whatever's on the TV.

## Problem
Groups half-watch clips constantly — it's ambient, passive, disposable. Meanwhile everyone privately predicts what'll happen ('watch, he's gonna cry'). Parlay makes those idle predictions a committed, high-variance bet with real payout tension, and gives passive viewing a stakes-driven reason to actually look.

## How it works
The host TV shows a 15-second silent clip's poster frame and a countdown. **Privately**, each phone is dealt ~8 prop cards, each with odds (common props pay little, rare props pay big). Each player secretly picks exactly 3 to form a parlay slip — a private bet that ALL three occur during the clip. Higher combined odds = bigger payout, but every leg must hit. The TV shows only 'locked' counts, never anyone's slip. Then the clip plays once. As it plays, the host confirms each prop (taps yes/no on the host screen, or a pre-annotated timeline auto-resolves) and the TV pops a live checkmark/X per prop as the room watches. On your OWN phone, your three legs light green or red in real time — a private sweat. Cash only if all three hit; payout = combined odds. Biggest cash-out wins.

Per-phone is load-bearing: every player commits a DIFFERENT secret slip simultaneously, and the drama is each person privately sweating their own legs against the shared clip. One passed phone kills the simultaneous hidden commitment and the individual sweat.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Data model: `Clip {id, props: {id, label, odds, resolved: bool|null}}`, `Player {slip: propId[3], settled}`. Sync: phones lock slips (server validates exactly 3); during play the host emits `propResolved` events; server pushes each to phones which locally re-color the player's own legs and settle when all resolve. Hard part: clip playback ↔ prop-resolution sync so a phone's leg lights the instant the moment plays. v1 uses host-tap manual resolution (no pre-annotation needed), with a shared clock so all phones update together.

## v1 scope
- 3 players, one shipped 15s clip, one round
- 8 prop cards with fixed odds; pick exactly 3
- Host taps to resolve each prop live; phones sweat legs in real time
- TV payout screen naming the biggest cash-out

## Out of scope
- Pre-annotated auto-resolving clips / CV prop detection
- Player-uploaded clips, clip library, multi-round books
- Odds that drift with the market

## Risks & unknowns
- Host-tap resolution can feel arbitrary — need crisp, objective props
- 15s may be too short for 3 legs to feel earned; tune length/prop count
- Balancing odds so parlays feel achievable but rarely trivial

## Done means
Three phones each lock a hidden 3-leg slip; the clip plays once; the host resolves props live; each phone privately lights its own legs green/red in sync with the TV; the server settles payouts and names a winner — with no slip ever visible to another player.
