## Overview

Party game where phones become signal lights. Coders transmit a secret word through their phone's screen color/flash pattern; Decoders across the room read those flashes and type back what they think was sent. Per-phone architecture is entirely load-bearing: your phone is *literally* the signaling device, and you cannot cheat by holding it near the decoder's phone because the shared cipher differs each round.

## Problem

Everyone knows Charades, Pictionary, and Codenames. There's no serious concurrent-room party game that treats the phone as a *physical light source in the room* rather than a text-input device. The rise of high-brightness OLED phones means every screen in the room can be a bright, discernible color source from 15+ feet away. That's an untapped affordance.

## How it works

Room splits into Coder and Decoder pairs (or teams). Each Coder gets a target word + a shared cipher (e.g. red flash = A, blue flash = E, purple slow-pulse = space) that rotates per round. Coder holds their phone up so their partner across the room can see the screen, and taps to trigger the color sequence. Decoder watches the screen from a few feet away and types their decoded message on their own phone. Time-limited rounds; scoring based on decode accuracy and speed.

## Technical approach

PartyKit / Durable Objects. Room state = `{round_cipher, pair_assignments, target_words, decode_submissions}`. Coder screen renders as full-viewport color via `document.body.style.background` + `requestAnimationFrame` for flash timing (200-400ms per flash, plus a "gap" color for whitespace). Screen brightness maxed via CSS `filter: brightness(1.5)` and requested wake lock. Cipher is a rotating substitution generated per round by the server (seedable). Optional v2: use the phone's camera on the decoder side to auto-detect color and confirm decoding.

## v1 scope

2 fixed color-cipher rounds (10 colors + 2 pulse patterns = 12 signals, enough for ~26 letters via digraphs). Fixed 3-letter target words (small dictionary). One Coder, one Decoder, 60s per transmission. Score = correct letters. No teams, no rotation, no camera-assist.

## Out of scope

Camera-based auto-decoding, live translation of arbitrary strings, team-vs-team mode, tournament brackets, custom cipher creation, difficulty escalation, animated cipher (rotating meaning by turn), spectator screens.

## Risks & unknowns

Ambient light in the room may wash out screen colors — needs testing across bright/dim rooms. Some phones have aggressive auto-brightness that fights the sender's intent (may need to request user manually set max brightness). The cipher may be TOO hard for casual party players; simpler mode (Morse-like dot/dash for a limited word list) as fallback. iOS Web Audio wake lock reliability across browsers. Also — is it fun, or does it feel like homework? Playtest early.

## Done means

Two friends stand ~10 feet apart, open the room, get paired, and one successfully transmits a 3-letter word to the other via screen flashes with the other typing it back correctly. If they both grin at the reveal moment, v1 shipped.
