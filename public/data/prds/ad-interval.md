## Overview
A local-only desktop tool that listens to ambient Bluetooth Low Energy advertising and answers one question: *what is recording in this room right now?* It fingerprints devices not by MAC address (which modern devices randomize every ~15 minutes) but by timing and payload structure — advertising interval, packet-length pattern, service UUID set, TX power, and rotation cadence. It also audits your own gear, ranking each of your devices by how trackable it is across venues. For anyone who read the wearable-surveillance coverage and wanted a detector instead of an opinion.

## Problem
AI recording wearables — camera glasses, always-on pendants, meeting recorders — are now everywhere and are deliberately unobtrusive. There is no consent signal. Meanwhile the countermeasure discourse is entirely vibes: no one can actually tell you whether something in the room is streaming. Separately, MAC randomization is widely believed to make devices untrackable, and for a large fraction of real hardware it simply doesn't, because the advertising payload and timing are stable across rotations.

## How it works
Run it on a laptop. It opens a passive BLE scan and buffers every advertisement with a microsecond-ish receive timestamp. For each observed MAC it builds a signature: median inter-advertisement interval and its jitter, the multiset of AD structure types and lengths, service UUIDs, manufacturer-data company ID and the stable-vs-changing byte mask across packets, and TX power. Signatures are clustered so that a device's pre- and post-rotation identities merge into one track — the UI shows *tracks*, not MACs, and each track carries a lifetime longer than the rotation period as proof the rotation failed. Tracks are matched against a small local signature library of known recorder models and product categories, with an explicit confidence and "unknown" as a first-class answer. A second tab is Your Stuff: put your own devices in a labeled set, walk to another room, and it reports which of them it re-identified and after how many rotations. Everything stays on disk; nothing uploads.

## Technical approach
Stack: Rust with `btleplug` (CoreBluetooth on macOS, BlueZ on Linux) for scanning, SQLite for the packet and track store, a small Tauri or plain-HTML localhost UI. On macOS CoreBluetooth hides the raw MAC and hands you a rotating peripheral UUID — which is actually fine, since the whole point is not to rely on the identifier. For raw-PDU fidelity, an optional path uses an nRF52840 dongle in sniffer mode piping HCI to `btmon`-style parsing.

Data model: `packets(ts, addr_hash, rssi, adv_type, payload_blob)` → `signatures(track_id, interval_ms, jitter, len_histogram, uuid_set, mfr_id, stable_byte_mask)`. Clustering is greedy nearest-neighbor over a weighted distance: interval within ±5%, identical AD-type length histogram, identical company ID, Jaccard on UUID sets, plus an RSSI-continuity prior. Known-model matching is a rule table, not ML — a hand-written YAML of signatures is more honest and more debuggable at this scale.

The genuinely hard part: distinguishing a rotation (same device, new address, tracks must merge) from a genuinely new device that happens to be the same model, in a room with fifteen identical AirPods. RSSI continuity and the exact rotation timestamp help, but this will have real false-merge rates and the UI must show that rather than hide it.

## v1 scope
- Scan, log, and list tracks with interval + jitter, no model identification
- One hardcoded rule: flag any track whose lifetime exceeds two rotation periods
- CLI output only, SQLite file on disk
- macOS only

## Out of scope
- Jamming, deauth, or any active interference — passive listening only
- Wi-Fi probe requests, UWB, audio-based camera detection
- Cloud sync, crowd-sourced signature sharing, naming individuals

## Risks & unknowns
- CoreBluetooth's API may hide enough of the PDU to make length histograms useless, forcing the dongle path
- Signature library for recorder models requires physically owning or borrowing the devices
- Ethical edge: a room-level device detector is one small step from a people-tracker; the UI must never persist a track across sessions by default

## Done means
With two of my own BLE devices in the room, the tool produces exactly two tracks that each survive at least three MAC rotations over 45 minutes, and when I power one off its track goes stale within 30 seconds.
