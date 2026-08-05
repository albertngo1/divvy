## Overview

Watch My Dot is a 3–6 player co-op bullet-hell survival game for a living room with a TV and a pile of phones. It steals danmaku — the genre where the entire skill is threading a 1-pixel hitbox through a wall of slow, beautiful projectiles — and breaks the one thing danmaku assumes: that you can see yourself. It is for groups who want a 90-second adrenaline spike with zero rules explanation.

## Problem

Action games don't survive the party-game translation. Handing everyone a phone-shaped D-pad produces four people staring silently down at their own screen — co-located solitaire. Meanwhile the room's actual asset, six people yelling over each other, goes unused. Bullet hell is the perfect donor genre because it's tense, legible from across a room, and its failure state is instant and funny.

## How it works

One shared boss pattern plays on the TV: spirals, aimed rings, a slow curtain sweep. **The TV renders bullets only — no player dots at all.** Each phone is a black rectangle with a thumb-drag pad. Your phone privately renders: the bullets near you, plus **every other player's dot, labeled with their name — and never your own.** You are steering a hitbox you cannot see, on a field only you can see the neighbours of.

So Priya can see that Marcus is about to eat a bullet and Marcus can see Dev, and nobody can see themselves. The only way to survive is to be narrated: "MARCUS LEFT — MORE LEFT — STOP." One life each; when your dot dies the TV flashes your name and you become a full-information spectator (your phone finally shows your corpse), which turns dead players into loud coaches rather than bored ones. Party survives if two dots are alive at 90 seconds.

## Technical approach

Host browser tab + phone PWAs + authoritative server (PartyKit Durable Object, or Socket.IO behind Tailscale Serve for LAN play).

Data model: `Room { code, phase, patternSeed, tick }`, `Player { id, name, x, y, alive, deathTick }`. Bullets are **never networked** — they are a pure function of `(patternSeed, tick)`, evaluated identically on host and every phone. Only 12 bytes per player per tick cross the wire.

Sync: phones send `{x, y}` at 30Hz as normalized floats; the server stamps a monotonic tick and broadcasts the full roster at 20Hz. Phones render *other* players interpolated 100ms in the past (standard entity-lag) so remote dots move smoothly. Collision is resolved **server-side only**, against the server's own tick clock, so nobody can lag-dodge.

The genuinely hard part is clock agreement. A phone whose deterministic bullet sim drifts two ticks from the server draws the bullet 40px off where the death was scored, and the player feels cheated. Fix: NTP-style offset handshake on join, resync every 5s, and always render bullets from `serverTick`, never from local `requestAnimationFrame` count.

## v1 scope

- One room code, 4 players, one 90-second hand-authored pattern.
- One life each, no shooting, no scoring — survive or don't.
- Thumb-drag movement only; no dash, no bomb, no grazing.
- TV = bullets + a name list that greys out on death. That's the whole host UI.
- Local network only; no matchmaking, no accounts, no persistence.

## Out of scope

Multiple patterns, procedural generation, shooting back, per-player abilities, PvP, leaderboards, remote play over the open internet, spectator streaming.

## Risks & unknowns

Mobile Safari drops to 30fps under thermal load — the sim must be tick-locked, not frame-locked. Six people shouting simultaneously may be pure noise instead of coordination; mitigation is a hard cap of 4 players in v1 and a pattern slow enough that one instruction per second suffices. Names must be shouted, so name entry needs to be short and pronounceable. Colour-only dot identity fails for colourblind players — use name labels, not hues.

## Done means

Four phones join by code in under 20 seconds. All four survive a full 90-second run at least once, and at least one run ends with a player audibly steered out of a bullet by someone else. No phone's rendered bullet position differs from the server's collision truth by more than one tick, verified by logging death coordinates on both sides across 20 deaths.
