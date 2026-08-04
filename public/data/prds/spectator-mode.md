## Overview

A 4-player co-op crawler for a living room with a TV and four phones, stealing the hardcore-roguelike/extraction-shooter idea that death is permanent and spectators become omniscient — then weaponizing it. Living players are blind and loud. Dead players are all-seeing and mute. One run, roughly four minutes.

## Problem

In every party game, the first person out sits on the couch scrolling. In every roguelike, death ends your information and your agency at the same moment. Both are wasted. The itch: make dying the most interesting seat at the table without letting the dead just narrate the solution out loud.

## How it works

The TV shows a 12×5 dungeon corridor rendered almost entirely black — only the four player tokens and the exit tile are visible, no walls, no traps, no pings. It is a scoreboard, not a map.

Each living phone privately shows a 3×3 fog window centered on its own token, a d-pad, and nothing else. Players cannot see each other's windows. Movement is one tile per 250ms hold. Three of the corridor's tiles are instant-kill traps, placed procedurally per run; stepping on one is fatal with no save.

When you die, your phone changes job. It now renders the **entire** map: every trap, every teammate, the exit. You may no longer speak (the TV displays a large SILENCED banner with your name; enforcement is social). Your only channel is four ping icons — SAFE, TRAP, TURN, STOP — dropped onto a specific tile, one every 8 seconds, decaying after 5. Pings are stripped of sender identity by the server and appear only on a living player's phone if that tile is inside their 3×3 window.

So the group gets smarter and quieter with each death. Living players argue out loud with incomplete fog while a silent chorus of ghosts tries to steer them through a four-symbol vocabulary. A STOP that arrives one tile late is a corpse.

One survivor reaching the exit wins the run for everybody.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room (Socket.IO over Tailscale Serve is a fine swap). Server is fully authoritative and holds `{grid, traps[], players{id,tile,alive}, pings[{tile,icon,expiresAt}]}`.

Critical rule: living clients are **never** sent the full grid. Each 15Hz tick the server computes a per-recipient payload — the 3×3 slice plus any ping inside it. Dead clients get the whole state. This is anti-cheat, not optimization; one devtools-curious player otherwise ends the game.

Movement is server-resolved on a 250ms step gate, so no client prediction or rollback is needed. Pings are rate-limited per dead player server-side and have their `senderId` dropped before broadcast.

The genuinely hard part is the ping channel's semantics under latency: a ping anchored to a tile the player has already left is worse than no ping. v1 mitigates by anchoring pings to world tiles (not screen positions) and showing the living player a 5-second shrinking ring, so staleness is legible.

## v1 scope

- 4 players, exactly one run, no lobby customization
- 12×5 corridor, 3 traps, 1 exit, 90-second timer
- 4 ping icons, 8-second cooldown, 5-second decay
- Death = phone flips to full map; SILENCED banner on TV
- Win/lose card, then hard reset

## Out of scope

Multiple floors, enemies, items, meta-progression, reconnection, spectator voice masking, more than 4 players, scoring across runs.

## Risks & unknowns

The mute rule is social, not technical — one chatty ghost breaks the game; a per-phone "you are silenced" full-screen state helps but won't stop everyone. Four icons may be too poor a vocabulary to ever succeed, or so rich that the run is trivial after the first death; tune trap count first. If nobody dies in the first 30 seconds the ghost mechanic never fires, so v1 places traps densely near the start.

## Done means

Four phones join a room by QR code. All four fog windows are provably different (server logs show no living client ever received a tile outside its window). A player who steps on a trap sees their phone flip to the full map within 300ms and can place a ping that appears on exactly the teammates whose window contains that tile. A run ends in win or loss and the TV shows who died in what order.
