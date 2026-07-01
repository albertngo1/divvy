## Overview
Signal Séance is a phone-based co-op game for 2–4 players standing in the same real-world space. It reskins the invisible radio-frequency world around you — every BLE beacon, Wi-Fi AP, and Bluetooth gadget — as restless spirits. Your team roams the room with your phones as spectral instruments, triangulating and "banishing" each ghost by physically closing in on its true location. It plays like a séance; it functions like an RF site survey.

## Problem
Phasmophobia is a hit because coordinating fake instruments in a shared space is delightful. But its ghosts are scripted fiction. Meanwhile you are, right now, bathed in dozens of real invisible signals you never think about — a mmWave-radar-post kind of "the world is richer than your eyes" itch. Turning that passively-ignored RF soup into something a group actively hunts is both spookier and genuinely educational: you end a session actually *knowing* what's transmitting in your home. The itch: make the invisible competable.

## How it works
One player starts a hunt; others join over the local network. The app scans nearby BLE/Wi-Fi and assigns each stable device a "spirit" with a name, class, and creepy flavor derived from real metadata (a Tile tracker becomes a "lost wanderer"; a neighbor's AP a "distant echo"). The team's job: for each spirit, pinpoint where it physically is. Your screen is an EMF meter driven by real RSSI — it spikes as you approach. Players spread out and call readings; the app fuses multiple phones' RSSI to draw a heat blob. Banish a ghost by getting within threshold range and holding a "séance" for 5 seconds. Score by ghosts banished and time. Rounds get harder as weaker/rarer signals appear.

## Technical approach
Stack: React Native (Expo dev build) for real BLE/Wi-Fi scan access, or a thin native iOS/Android wrapper — **CoreBluetooth / Android BluetoothLeScanner** for BLE RSSI, Android `WifiManager.getScanResults()` for AP RSSI (iOS Wi-Fi scanning is locked down, so iOS is BLE-only in v1). Devices are identified by MAC/UUID + advertised service data; a classifier maps company IDs and service UUIDs to "spirit types." Multiplayer over local Wi-Fi/Bonjour with a lightweight WebSocket host on one phone. The genuinely hard part is **multi-phone RSSI triangulation**: RSSI is noisy and non-linear, so use a Kalman-smoothed log-distance path-loss model per device, fuse readings from all connected phones with a simple weighted-centroid / gradient-descent localization, and gate banishment on convergence confidence, not raw distance. Data model: `{deviceId, type, rssiHistory[], estimatedPos, banished}`.

## v1 scope
- Single-phone BLE scan → list of "spirits" with flavor names
- Live EMF meter driven by real smoothed RSSI (hot/cold as you walk)
- Banish-by-proximity with a 5-second hold
- One local session, ghosts = strongest N stable devices in range

## Out of scope
- Multi-phone triangulation fusion (v2 — v1 is single-hunter "hot/cold")
- iOS Wi-Fi scanning (platform-restricted)
- Persistent maps of a location across sessions
- Any deanonymization of device owners (explicitly avoided)

## Risks & unknowns
- OS privacy restrictions on background scanning and MAC randomization may hide or scramble devices.
- RSSI is genuinely noisy indoors (multipath); the "hot/cold" feel must survive that or the game feels broken.
- Ethical edge: must frame as ambient-RF play, never as tracking people; ship a clear no-logging stance.

## Done means
One player walks into a room, the app surfaces three named "spirits" from real nearby devices, the EMF meter visibly spikes as they approach the strongest one, and they banish it with a 5-second hold — using genuine RSSI, no fabricated data.
