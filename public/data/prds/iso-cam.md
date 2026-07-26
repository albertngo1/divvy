## Overview

A four-player couch game layered on top of a 90-second video clip (a cooking show heat, a bowling frame, a game-show buzzer round). The shared TV plays the clip *degraded*; each player's phone is a private, sharp "iso camera" onto one quadrant of the same frame, in sync. Everyone bets on the same three props, sealed and simultaneous, and the payouts are parimutuel. For groups who already watch things together and want the watching to have teeth.

## Problem

Group viewing is the most passive thing a room does, and every "bet on the show" app fails the same way: all players see the identical screen, so all information is symmetric and the market collapses into a trivia quiz with a countdown. Real betting is fun because *somebody knows something*. There is no way to manufacture that around a TV — unless the phones stop being buttons and start being cameras.

## How it works

**Host screen (shared):** the clip at full frame with audio, but downscaled to ~24px blocks and blurred. You can read motion, color, and gross shape; you cannot read a scoreboard, a face, or a hand. Above it: the current prop, a closing timer, and a chip ledger.

**Phone (private):** the *same clip at the same timestamp*, unblurred, cropped to one 25% region — top-left, top-right, bottom-left, bottom-right — assigned at join and never disclosed. One player is watching the chef's hands. One is watching the judge's face. One is watching a corner where nothing happens for 60 seconds and then everything does.

Three props are pre-authored against the clip, each with a window that closes ~4 seconds before the answer becomes legible on the blurred host feed. Your phone shows YES / NO and a stake slider (1–5 of your 10 chips). Bets are sealed. At close, the TV reveals the *pool split* ("7 chips YES · 3 NO") but never who bet what. Winners split the losing pool pro rata — so a correct read that everyone shared is worth almost nothing, and the quadrant that lets you fade the room is worth a lot. Reading the room out loud, lying about what your quadrant shows, and watching who leans in are all free and all encouraged.

## Technical approach

PartyKit Durable Object per room over WebSocket. The host tab is the playback clock authority and broadcasts `{clipMs, wallClock}` at 4Hz. Phones preload the same MP4 (muted, unlocked by the join tap to satisfy mobile autoplay) into a `<video>` with `transform: scale(2) translate(±25%, ±25%)`.

Room state: `{phase, clipMs, players:[{id, quadrant, chips, sealedBet}], props:[{id, text, openMs, closeMs, resolveMs, answer}]}`. `sealedBet` is emitted only on the owning socket until the window closes.

Sync: each phone estimates host position as `clipMs + (now - wallClock)`. Drift >120ms → hard `currentTime` seek; 40–120ms → nudge `playbackRate` to 0.95/1.05 and glide back. The genuinely hard part is doing that correction *without a visible stutter inside a betting window*, because a hitch at the wrong second destroys someone's edge. Window close is server-authoritative on receipt timestamp; late bets bounce with a loud "TOO LATE" rather than vanishing.

## v1 scope

- One hardcoded 90-second clip shipped as a local MP4
- Exactly 4 players, 4 fixed quadrants, one game
- 3 hand-authored props with hand-authored answers
- 10 chips each, parimutuel settlement, one leaderboard screen
- Blur via CSS `filter: blur()` + downscale on the host video element

## Out of scope

Clip library or upload. Auto-generated props. Trading or selling your quadrant. Live TV / streaming-service integration. Rebuys, multi-round, persistent accounts. More than 4 players.

## Risks & unknowns

Mobile video decode + drift correction is the whole technical bet; if phones can't hold ±120ms the edge evaporates. Prop authoring is craft — a prop only sings if exactly one or two quadrants can see it coming. Quadrant fairness: a dead corner is a dead player, so the clip must be chosen so action migrates. Small screens may make even the sharp crop hard to read.

## Done means

Four phones join by QR, all four hold sync within 120ms of the host for the full clip, each shows a different sharp quadrant, three sealed betting windows open and close on server time, and after settlement at least one player can point at the screen and say "I only knew that because of my corner."
