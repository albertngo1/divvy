## Overview
Backseat is a 3-player co-op falling-block game (Tetris/Puyo lineage) built entirely around a verbal-telephone twist: nobody controls the well they can see, and nobody can see the well they control. It's for the same crowd that loves the panic of Overcooked, played over a shared TV plus three phones.

## Problem
Solo falling-block games are hyper-legible: one brain, one board, full information. That's the opposite of a party. The itch: turn Tetris into a screaming-across-the-couch relay where the fun is the bandwidth loss between the eye that sees and the hand that acts.

## How it works
Three players sit in a ring. The TV shows all three wells side by side, pieces falling in real time. Each phone has TWO roles at once:
- **Owner (private, read-only):** your phone renders ONLY your own well, big, including the next-piece queue. You watch pieces you cannot move.
- **Driver (blind controls):** your phone's buttons — Left, Right, Rotate, Soft-drop, Hard-drop — control your RIGHT neighbor's well, which is NOT drawn on your phone at all. You're driving a board you can't see.
So to place a good piece, the Owner (who sees the well) must shout instructions — "left three, rotate, DROP" — to the Driver on their left, who is simultaneously being shouted at by their own right neighbor. Everyone talks over everyone. Goal: collectively clear the most lines in 3 minutes before any well tops out (co-op score, no PvP for v1). The TV is the only place you can watch the disaster unfold as a whole.

## Technical approach
Host browser tab renders the shared 3-well view; phones are PWA clients over an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve). **Data model:** one Room holds three `Well` objects (grid 10×16, active piece, next-piece bag, locked cells). Each `Player` has `ownsWell` and `drivesWell` (ring-mapped). Server owns all gravity, collision, line-clear, and lock-delay logic on a fixed 30Hz tick and broadcasts authoritative well states. Phones send only button intents (`{action, seq}`); server applies them to that player's `drivesWell`. **Sync:** server-authoritative, so input lag is the only concern — buttons feel snappy at LAN latency; gravity is server-driven so no client prediction needed. **Genuinely hard part:** lock-delay + input-buffer tuning so a Driver's late "rotate!" (relayed verbally, then thumbed) still lands before the piece locks — too tight and it's unfair frustration, too loose and there's no tension. Also mapping the ring so Owner↔Driver adjacency is stable if a phone drops.

## v1 scope
- Exactly 3 players, fixed ring.
- One 3-minute co-op round, shared line-clear score.
- Standard 7-bag Tetris pieces, 5 buttons.
- Top-out ends that well early; round continues for survivors.
- No accounts, no rematch flow beyond a reload.

## Out of scope
- Versus / garbage-sending.
- 4+ players, spectators, held pieces, T-spins scoring.
- Reconnect grace, mobile-landscape polish.

## Risks & unknowns
- Cognitive load may cross from "fun-hard" to "impossible" — needs a slow initial gravity ramp.
- Verbal-relay lag might make even simple placements feel unfair; tune lock-delay generously.
- Three people shouting simultaneously could just be noise, not coordination.

## Done means
Three phones join, each sees only its own well and drives an unseen neighbor's; a playtest group clears at least one line purely by verbal relay, and the room laughs at least once at a piece placed catastrophically wrong.
