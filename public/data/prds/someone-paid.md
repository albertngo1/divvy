## Overview
Someone Paid is a 4-player in-room game for a birthday, a send-off, or any night that deserves a card. The room writes one short message together on a shared tape. Every letter is sent through a real DC-net (Chaum's dining cryptographers protocol), so the authorship is mathematically untraceable. There are no points. You win if the finished card is readable and nobody knows who wrote which part of it.

## Problem
Anonymous party writing usually depends on trust. Somebody runs the server, so somebody can see who wrote what, and everyone knows it. Hidden handwriting games also fall apart once people recognize each other's phrasing. Here the anonymity is real. What makes it interesting is that writing together requires coordination, and coordination means talking, which gives you away.

## How it works
- **Host screen:** a ticker tape of 120 slots that advances one slot every 1.2 seconds. Each finished slot shows a letter, a space, or an ink blot. It also shows the guest-of-honor's name and a progress bar. It never shows who is writing.
- **Each phone (private):** a keyboard, a preview of your next keystroke, and a small indicator that tells only you whether your letter landed or collided.
- **Each tick:** every phone sends a masked pair (letter, flag). A writer sends (letter, 1) and everyone else sends (0, 0). Each phone adds its pairwise pads, with signs that cancel across the ring. When the server sums everything, the pads drop out and it gets (sum of letters, sum of flags). A flag sum of 1 means a clean letter. A sum of 2 or more means a collision, which prints as a blot. The server can see that a collision happened but not who caused it.
- **The tension:** you want to finish a sentence without someone else typing over you. Saying 'I've got the next word' prevents collisions and reveals you as the author. Staying quiet keeps you anonymous and risks blots. Blots stay on the card permanently.
- **End:** the tape renders as a printable card. The guest of honor gets the PNG.

## Technical approach
- PartyKit room. Clients exchange ECDH P-256 public keys through the server. Each pair derives a seed with HKDF, and a per-slot AES-CTR keystream gives pads mod 2^16. The server only relays keys and sums values, so it never learns a pad.
- Data model: `Room{players[4], pubkeys, slot, tape[]}` and `Submission{slot, maskedLetter, maskedFlag, playerId}`.
- Sync: the server waits until all 4 submissions for slot k have arrived before revealing it. A late phone sends a blank on timeout, using its pads, so the tape keeps moving.
- **Hard part:** strict lockstep at 1.2-second ticks over Wi-Fi. A phone that misses a slot breaks pad cancellation for that slot. Fix: phones precompute pads and send early, and the server reveals on the deadline.

## v1 scope (humiliatingly small)
- Exactly 4 players in a ring with full pairwise pads
- A single 120-slot tape, A–Z plus space only
- Collision prints a blot; no retries, no reservation phase
- PNG card export

## Out of scope (for now)
- Reservation rounds and collision recovery
- Detecting jammers (a player who sends noise on purpose)
- More than 4 players, emoji, or drawing

## Risks & unknowns
- 1.2 seconds per letter may feel slow. A tick rate from 0.6 to 2 seconds needs playtesting.
- Groups may just agree on a turn order out loud, which ends the tension. The guest of honor may need to be a player too, so a public schedule spoils the surprise.
- Anyone can jam the card anonymously. That may be a feature.

## Done means
Four phones write a 120-slot card. A test proves the server log alone cannot attribute any letter: the sums are the only plaintext it sees. A deliberate two-phone collision prints a blot. The card exports as a PNG.
