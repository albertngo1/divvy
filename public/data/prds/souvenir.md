# Souvenir

## Overview
A cooperative party game whose *only* win condition is the artifact it creates. Every player contributes one element (a photo, a phrase, a color choice, a stylistic gesture) via their phone; at session end, all contributions are composited into a shared postcard-sized image (via HTML canvas or an LLM-driven layout) that every phone can save and share. No scores, no leaderboards, no ranking — the postcard IS the game. Load-bearing per-phone because each contribution is private until composition and the final artifact belongs equally to everyone in the room.

## Problem
Every party game ends with a leaderboard and a "who won?" moment. Even cooperative games (Hanabi, Just One) score against a target. Nothing in the concurrent-room space treats the *artifact* of the group's collaboration as the terminal state. This matters for friend-groups who don't want competitive vibes (dinner parties, casual hangouts) but still want structure. It's also uniquely giftable — the postcard becomes a keepsake, which no scoreboard can be.

## How it works
Room code join, 3-8 players. Prompt appears ("Make a postcard for this dinner"). Server assigns each phone a specific ELEMENT to contribute: one player picks a background color (color picker UI), another a phrase (text field), another a sticker/emoji, another a photo they take right now, another a signature scribble (draw on canvas). Contributions stay private until all submitted. Composition phase: server (or client-side canvas) assembles the postcard using a fixed template. Reveal shows the final artifact simultaneously on every phone; everyone can download/save/share. Optional group signature: everyone signs the back digitally.

## Technical approach
PartyKit or homelab Socket.IO. Room state = `{prompt, elements: {player_id: {type, value}}, composed_url}`. Assignment logic maps player_id to element_type deterministically (background/text/photo/sticker/scribble). Composition: HTML canvas API stitches together the elements using a fixed layout template. Alternative composition: Haiku with vision could arrange them ("here are 5 elements, generate a postcard layout") but v1 uses hand-authored templates. Storage: composed image uploaded to a public URL (S3, or homelab-hosted) with a short share-URL for each player.

## v1 scope
4 players, 5 fixed element types (bg color + 1 phrase + 1 emoji + 1 photo + 1 signature), 1 postcard template (portrait 3x5), single-round session, 3-minute contribution phase. Compose via canvas API. Download button per phone. No customization, no history, no themes.

## Out of scope
LLM composition, custom templates, multi-postcard sessions, cross-session postcard history, sharing to social, sticker library, physical printing integration (Postal Postcards API), animated postcards, video postcards, GIF postcards.

## Risks & unknowns
Composition quality is everything — a bad layout kills the "keepsake" feeling. Hand-authored template constrains the aesthetic but is finishable in a weekend. iOS camera permission on join tap must work reliably. Text overflow (someone types a 300-word phrase) needs truncation or wrapping logic. Test question: does the group actually save/share the postcard after the session, or does it disappear into the void? If nobody saves it, the whole game loses meaning.

## Done means
4 friends open the room, contribute their 5 elements, and at session end each of them has downloaded the same postcard to their phone. If anyone AirDrops it to someone else or texts it as "look what we made", v1 shipped.
