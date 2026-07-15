## Overview
Cicada is a 3–4 player concurrent-room game where phones form an acoustic data network. Each phone privately holds a fragment of a code and must *route* it to a specific other player using audible-but-non-verbal chirps — a real over-the-air modem running in the browser. The room's job is to relay every fragment to its destination before the timer ends. It's for people who liked the idea of passing notes but want the physics of radio silence enforced literally.

## Problem
Most 'stay quiet' party games use the mic only as a rule-cop. Cicada makes silence *mechanically necessary*: the game's actual communication medium is sound, and human voice occupies the same acoustic space as the data carrier. Talking doesn't just break a rule — it destroys the payload in flight.

## How it works
The host TV shows a ring of players and a live **Channel Meter** (clean → garbled). Each phone PRIVATELY shows: your held fragment (e.g. `K7`), the address of the neighbor it belongs to, an inbox of packets addressed to *you only*, and a big TRANSMIT button. Pressing TRANSMIT plays a ~2s pattern of tones (a birdlike chirp) encoding address + payload + checksum. Every phone's mic is always listening; a phone decodes only packets carrying its own address and drops them into its private inbox. To win, each fragment must physically hop across the room to the right phone.

The catch: the carrier lives in a 5–9 kHz band that loud speech, laughter, and the phone's own auto-gain pumping all smear. Any voiced sound spikes the shared Channel Meter red and corrupts every chirp mid-flight (checksum fails → the sender sees NAK, must re-send). Two phones chirping simultaneously also collide — so the room must nonverbally take turns *and* stay silent, negotiating entirely by glances and screen-taps.

## Technical approach
Host tab + phone PWAs + a PartyKit/Durable-Object WS server that handles ONLY lobby, fragment/address assignment, and scoring — crucially it does **not** relay payloads; data must travel acoustically. TX: WebAudio `OscillatorNode` doing MFSK (preamble + 4-bit address + payload nibble + CRC4). RX: `getUserMedia` → `AnalyserNode` FFT with Goertzel filters at each symbol frequency, plus symbol-clock recovery. Voice raises the broadband noise floor → per-symbol SNR collapses → CRC rejects. The genuinely hard part is robust symbol synchronization and listen-before-talk (CSMA) collision handling across cheap phone speakers/mics at 1–3 m — this is a real acoustic modem, and getting a reliable >90% packet rate in a quiet room is the whole engineering risk.

## v1 scope
- 3 players in a ring, one round, ~90 seconds
- Exactly one fragment per player to route to one neighbor
- Fixed carrier band, fixed 8-symbol packet, no error correction beyond CRC (just re-send)
- Channel Meter + per-phone inbox/transmit only

## Out of scope
- Multi-hop routing, forward error correction, ultrasonic (inaudible) carriers
- Adversarial jamming roles, scoring leaderboards, >4 players

## Risks & unknowns
- Cheap-phone speaker/mic frequency response may be too weak at 5–9 kHz
- AGC on iOS Safari may fight the decoder; may need a calibration chirp
- Ambient HVAC/TV audio as unintended noise floor

## Done means
Three phones in a normal quiet room complete all three fragment hops within 90s at >80% first-try packet success, and a single deliberately spoken sentence measurably reddens the Channel Meter and forces at least one re-send.
