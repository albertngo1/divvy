## Overview

Room-scale synchronization game where phones become a distributed light show. On each round, every phone is assigned a color and a delay (e.g. "red at 3.2s"). Players must physically position themselves in the room so that, at the sync moment, the collective flash of colors forms a shape or reads a phrase as seen by whoever is observing from outside. The room's physical layout becomes the canvas; each phone is one pixel; nobody can see the whole picture from where they're standing.

## Problem

Everyone's phone has a bright OLED screen with millisecond-accurate timing over WebSocket. The idea of using a group's phones as a distributed display (crowd-sourced Jumbotron) exists in commercial demos but not as a party game. Playing "flash mob" this way requires each player to hold their own phone AND to physically stand somewhere — one phone passed around fails at both.

## How it works

Room code join. First round is calibration: each player positions themselves anywhere they want in the room (couch, chair, kitchen, doorway). One player is nominated as the Camera (they'll take the group photo). Server assigns each phone a color from a small palette. Countdown to sync moment — all phones flash color simultaneously. Camera takes the shot. Group looks at the photo: does the color pattern look like anything? A rainbow? A face? A logo? Round 2: server picks a target shape (e.g. "spell HELP with color codes"), players must physically MOVE to positions that would make the shape when flashed. Rounds 3+: increasingly ambitious targets. Score = subjective vote or LLM-judged similarity to target.

## Technical approach

PartyKit / Durable Objects (clock sync matters more here). Room state = `{round, target_shape, phone_colors: {player_id: [r,g,b]}, sync_at_ms}`. Clock sync via periodic ping-pong offset estimation (small NTP-lite: measure round-trip, adjust local clock). At sync moment, each phone renders full-viewport color via `requestAnimationFrame`. Optional: after Camera uploads photo, Haiku with vision analyzes similarity to target ("does this look like the letter A?"). Otherwise: group hits YES/NO on their phones.

## v1 scope

3 rounds, 4-8 players. Round 1: random colors, "does anything emerge?" (subjective). Round 2: target = 2-color split (half red, half blue). Round 3: target = one specified letter (H, I, or T — easy shapes). Camera is nominated by lobby, uses phone camera. Group votes YES/NO on outcome. No LLM vision judging, no target library beyond H/I/T.

## Out of scope

LLM vision similarity scoring, arbitrary target shapes, target library UI, multi-Camera aggregation, video sync mode, animation targets (moving flash patterns), external observer web UI (Camera is a player).

## Risks & unknowns

WebSocket clock sync via ping-pong is ±100ms in practice — a bright OLED flash at 250ms perceived duration should absorb that noise, but only just. Not all phones can max brightness on demand (iOS may fight, especially in low-power mode). The whole thing may just look like a bunch of Christmas lights — "does it form a shape" may fail 90% of the time because 6 pixels can't make a letter. Fallback fun: even if the shape fails, the synchronized flash across 6 phones from different corners of the room is visually novel; may be enough. Playtest question: is "physically move to your spot" the fun bit, or the flash reveal? Probably both, but weight matters.

## Done means

4 friends open the room, spread out around the room, and successfully flash a 2-color split pattern once in a photo. If the photo makes them laugh/screenshot it, v1 shipped.
