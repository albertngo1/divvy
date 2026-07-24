## Overview
Beacon Frame is a macOS menubar app that sonifies the WiFi environment around you into slow, evolving ambient music. It's a 'radio of the room' for anyone who likes generative audio (Brian Eno by way of 802.11) running quietly while they work. Every scan produces a different piece because the RF landscape is always drifting.

## Problem
Generative-music toys usually loop a fixed algorithm or pull from a static seed. They stop feeling alive. Meanwhile there's a rich, invisible, constantly-changing data field bathing every room — dozens of beacon frames, moving devices, fluctuating signal strength — that nobody perceives. Beacon Frame makes that field audible and turns 'ambient' back into something genuinely responsive to *where you are right now*.

## How it works
Every ~10 seconds the app scans nearby networks. Each network (keyed by BSSID) becomes a persistent *voice*:
- **RSSI → amplitude**: strong signal = louder, present; fading network = decrescendo into silence.
- **Channel/frequency → pitch class**: 2.4GHz vs 5GHz split into registers; channel maps into a chosen scale (pentatonic default, always consonant).
- **SSID hash → timbre**: deterministic waveform/envelope so 'your' network always sounds like itself.
- **Appearance/disappearance → note onsets and releases**: a device walking past is a phrase that swells and dies.
Density of networks controls overall harmonic thickness. You never see any SSID text unless you open a debug panel — it's ambient art, not a scanner UI. A menubar meter shows only 'RF density.'

## Technical approach
Swift + CoreWLAN: `CWInterface.scanForNetworks()` returns `CWNetwork` objects with `rssiValue`, `wlanChannel`, `bssid`, `ssid`. Audio via AudioKit or raw AVAudioEngine — a small bank of oscillators/samplers, one node per active BSSID, with smoothing (exponential glide on gain/pitch) so scans don't click. A scheduler maps scan deltas to onset/release events; a global 'conductor' quantizes onsets to a slow grid and constrains all pitches to the active scale so it never sounds ugly. State: a dict of BSSID → voice with last-seen timestamp; garbage-collect voices unseen for N scans. The hard part: **making scan jitter musical** — scans are coarse (every few seconds) and RSSI is noisy, so heavy smoothing + quantization + note-stealing logic is what separates 'music' from 'random beeps.'

## v1 scope
- Single scan loop → oscillator bank, pentatonic mapping.
- RSSI→volume, channel→pitch, appearance→onset.
- Menubar on/off + master volume + one scale choice.

## Out of scope
- Bluetooth/BLE sources (v2), visual wallpaper output, presets/recording.
- Any logging or export of BSSIDs (privacy: in-memory only).

## Risks & unknowns
- macOS restricts SSID access without Location permission; may get BSSID/RSSI only — fine, the app only needs RSSI+channel+a stable key.
- Scan rate is OS-throttled; too slow = static music. Test real cadence.
- Empty RF environments (rural) sound sparse — add a subtle drone floor.

## Done means
Running in a normal apartment it produces continuous, pleasant, drifting ambient audio where physically moving a phone with a hotspot near/away from the Mac audibly swells and fades a distinct voice, and no two 60-second recordings are identical.
