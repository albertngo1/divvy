## Overview
Zero-Width is a 4–8 player party word-game played in an ordinary-looking group chat. Each round one secret "smuggler" is dealt a word and must transmit it to a hidden partner (or simply land it before the round ends) by lacing their normal chat messages with invisible zero-width steganographic characters. Everyone reads the exact same visible text; the difference is buried in bytes no font renders. "Detectives" get a scarce decoder lens to unmask one message at a time. It's Werewolf where the tell is literally invisible — a playable dramatization of the "Claude hides marks you can't see" headline.

## Problem
Hidden-in-plain-sight signaling is a perfect, untapped social-deduction mechanic: identical words, one secret channel. Existing hidden-role games rely on behavioral tells and voting. Nobody has built a game where the *medium itself* is the deception surface and where "looking closer" is a limited, dramatic action.

## How it works
Players join a room. Each round the app secretly picks a smuggler and a target word. The smuggler types normal chat; the client appends an encoded payload of the word as zero-width characters. All players see clean text. Detectives spend a limited number of "lens" charges per game to reveal the raw codepoints of one chosen message. Smuggler scores if the word lands uncaught; the crowd scores by correctly flagging the smuggler's marked messages before time runs out.

## Technical approach — specific & technical
Stack: React + Vite front end, a thin room server on Node with `ws` (WebSocket) or Cloudflare Durable Objects for room state; no DB needed for v1 (in-memory rooms). Encoding: map the secret word to bits via a fixed 5-bit-per-letter alphabet or full UTF-8, then serialize each bit as U+200B (ZERO WIDTH SPACE = 0) and U+200C (ZERO WIDTH NON-JOINER = 1), with U+FEFF as a frame delimiter. Payload is inserted between visible words so it survives casual copy-paste. Decode = strip visible glyphs, regex-match `[​‌﻿]+`, reassemble bits. Detection heuristic for the lens: highlight any message whose invisible-char count exceeds a noise threshold. The hard part: keeping payloads robust across chat clients that normalize or strip control chars, and pacing the reveal economy so smugglers stay bluffable — plus obfuscating *which* client injected marks so detectives must reason socially, not just diff bytes.

## v1 scope (humiliatingly small) — bullets
- One shared page, no accounts, two browser tabs.
- Text box that encodes a chosen word into U+200B/U+200C appended to typed text.
- "Reveal" button that decodes any pasted message back to the word.
- Prove the invisible channel survives copy-paste between two devices.

## Out of scope (for now)
- Rooms, matchmaking, real-time multiplayer sync.
- Scoring, timers, lens economy, win conditions.
- Homoglyph encoding, screenshot/OCR decode, mobile app.

## Risks & unknowns
- Chat platforms (iMessage, Discord) may strip or normalize zero-width chars.
- Codepoints can leak when text is retyped, not copied.
- Balancing so the game is fun and not a pure byte-diffing exercise.

## Done means — concrete, testable
Two people on two devices pass a secret word through visually identical messages, and the detective decodes it exactly once — the bluff-vs-reveal tension is real end to end.
