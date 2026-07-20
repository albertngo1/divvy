## Overview
Downstream steals the lane tower-defense genre (Kingdom Rush / Bloons) and splits the lanes across phones so no one can see the whole map. 3 players sit in a ring, each privately defending one lane; leaked creeps spill into the next player's lane. Co-op, real-time, loud. For friends who like TD but want it to become a communication scramble.

## Problem
Tower defense is a solo optimization puzzle you play in silence. The fun social fantasy — 'I'm getting overrun, cover me!' — never happens because one player sees everything. Hide each lane on a separate phone and the genre becomes a frantic co-op of blind hand-offs.

## How it works
One 75-second wave, escalating. Each phone PRIVATELY shows ONLY its own lane: a horizontal track, your gold, a two-button build menu (Cannon = damage, Frost = slow), and creeps marching left→right toward your lane's exit. The shared TV shows ONLY the team's single pooled **Base HP bar** and an anonymized 'pressure' pulse per lane — never the actual creeps.

The load-bearing mechanic is **the leak flows to a real person**. A creep that survives to the end of YOUR lane does not damage the base directly — it re-spawns at the ENTRANCE of your right-hand neighbor's lane (whose phone is a different physical human), stacking on top of whatever they're already fighting. Only a creep that leaks out of a lane already at max congestion finally hits the shared Base HP. So under-building isn't a personal failure — it's an attack on your friend, and they can't see it coming until it appears mid-lane. The only defense is verbal: 'I'm dumping three fast ones into you in five seconds, build Frost!' Gold is per-lane and private, so you also negotiate who can afford to hold the heavy side.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or a Durable Object). **Data model:** a ring of `Lane {ownerId, towers[], creeps[], gold, congestion}`; a shared `baseHP`. The server runs a fixed 20Hz simulation tick: advance creeps, apply tower damage, and on a lane-exit event enqueue the creep into `lane[(i+1)%n].creeps`. **Sync:** each phone subscribes only to its own lane's creep/tower state (private channel); the TV subscribes only to `baseHP` + per-lane congestion scalar. Builds are RPCs validated against private gold. The genuinely hard part is **cross-lane hand-off timing** — a leaked creep must appear in the neighbor's lane deterministically and fairly under 20Hz with variable phone latency; the server owns all positions and phones render by interpolating server snapshots, so a laggy phone never desyncs the leak.

## v1 scope
- 3 players in a fixed ring, one 75s wave.
- 2 tower types, 1 creep type (plus a 'fast' variant), per-lane private gold.
- Leak → neighbor entrance; base HP only hit on double-leak.
- Win/lose on whether base HP > 0 at wave end.

## Out of scope
- Multiple waves, tower upgrades/selling, boss creeps.
- Sending gold to teammates, more than 3 lanes.
- Any map view of other players' lanes.

## Risks & unknowns
- Does hiding neighbors' lanes create fun panic or just confusion? The verbal-warning loop must feel doable, not hopeless — tune leak telegraph time.
- Ring topology with 3 may snowball onto one victim; may need a congestion cap that bleeds to base sooner.
- Phone TD controls must be one-thumb simple to keep eyes on your lane while shouting.

## Done means
3 phones each defend a private lane invisible to the TV and to each other; a creep leaking out of one lane provably re-enters the correct neighbor's lane in real time; the shared TV shows only base HP + congestion pulses; and a wave can be won only when players verbally coordinate hand-offs, with a logged run where one player's under-build measurably floods the next lane.
