## Overview
Lodestone is a cooperative concurrent-room game where each player's phone is a private metal detector driven by the raw magnetometer. The physical room — its hidden ferrous objects — is the board. For 3 players who like getting up and hunting, one round, five minutes.

## Problem
The magnetometer is the most ignored sensor in every phone: apps use it only as a compass needle. But its raw magnitude spikes near iron and steel, which means the room is already full of invisible targets. The itch: turn 'find the metal' into a shared treasure hunt where nobody can see anyone else's hunt.

## How it works
The host TV shows a bare room map: a ring of N unlabeled deposit slots. Each phone PRIVATELY shows a single warmer/colder meter and one secret assignment ('you seek deposit #2'). Players physically sweep their phone across surfaces; when a phone's magnetometer magnitude anomaly rises above baseline and is held over one object for 1.5s, that player claims it — the host reveals which real object it maps to and lights a tile. No phone ever shows another phone's meter or target.

Private/asymmetric state is the whole point: three secret assignments mean three players sweep three different objects at the same instant. A single phone passed around finds one object at a time and cannot hold three private targets — the simultaneous, hidden hunt collapses to a serial chore.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones read the Magnetometer interface (Generic Sensor API) at ~30Hz. Data model: `{roomId, players:[{id, targetSlot, claimed}], slots:[{id, claimedBy}]}`. Each phone streams only claim events (not raw readings) to the server, which is authoritative over slot ownership and broadcasts the map to the host. Sync strategy: fire-and-confirm claims; server rejects double-claims.

Genuinely hard part: the Earth's field (~50µT) dominates absolute magnitude and rotates as you turn the phone, so you cannot threshold on raw value. Detect a LOCAL anomaly via the derivative/variance of magnitude over a sliding 1s sweep window — a real object produces a sharp transient as the phone passes it. Baseline-calibrate by holding the phone still in the room center, away from metal, for 3s.

## v1 scope
- 3 players, 3 pre-seeded metal objects, one cooperative round
- Single warmer/colder meter per phone, one secret target each
- Host map = 3 tiles that light on claim
- Win = all 3 found

## Out of scope
- Competitive/stealing modes, bluffing about which object you found
- Auto-discovering objects (objects are host-seeded for v1)
- Scoring, multiple rounds, iOS support

## Risks & unknowns
- iOS Safari does NOT expose the raw magnetometer → Android-Chrome-only v1 (honest, tiny scope)
- Phone's own speaker/vibration magnet causes false spikes; filter on sweep transients
- Calibration drift; noisy readings in electrically busy rooms

## Done means
Three Android phones join, calibrate, and in one round each independently sweeps to its secret metal object; the host map lights all 3 tiles from real anomaly spikes, no phone shared.
