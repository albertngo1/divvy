## Overview
Burn-In is a desktop tool that turns any Android phone into a graded resale listing via ADB. It runs a battery of hardware checks and outputs a standardized condition report (PDF + JSON) with photos and pass/fail per component. For part-time phone flippers and small refurbishers selling on Swappa, eBay, and Facebook Marketplace.

## Problem
Used-phone resellers grade devices by vibes: "battery seems fine, screen looks clean." Buyers get burned (a phantom OLED burn-in, a dead proximity sensor, a blocklisted IMEI) and leave bad feedback or force returns. Doing real QA by hand — dialing `*#*#4636#*#*`, running a rainbow of test screens, checking each sensor — takes 15 fiddly minutes per phone and isn't documented. The capability exists in ADB; nobody's packaged it as a one-click grading report.

## How it works
1. Reseller enables USB debugging, plugs in, clicks Grade.
2. Burn-In queries the device: battery design vs. current capacity + cycle count, model/storage/Android version, root/bootloader state, and a component checklist.
3. It pushes a lightweight companion APK (or uses `am`/`content` + instrumentation) to read sensor liveness (accel, gyro, proximity, mag), then drives an on-screen guided sequence: solid-color burn-in slides captured by the phone camera / user photo, touch-grid sweep, speaker/mic loopback, button prompts.
4. It runs an offline IMEI checksum + optional online blocklist lookup.
5. Output: a grade (A/B/C via a transparent rubric) and a report PDF with per-test evidence, ready to paste into a listing.

## Technical approach
- Stack: Electron or a Tauri app wrapping `adb` (bundled platform-tools); reuse patterns from ADB-Explorer.
- Battery: `adb shell dumpsys battery` + `/sys/class/power_supply/*/charge_full` vs `charge_full_design` for health %; `batterystats` for cycles where exposed.
- Sensors: a tiny companion APK exposing a `SensorManager` liveness probe over a local socket (`adb forward`), since raw sensor values aren't cleanly shell-readable.
- Burn-in scan: display full-field R/G/B/gray slides; capture via the phone's own camera front-facing? No — user photographs the screen, and a client-side vision pass (uniformity variance + ghosting detection on the captured image) flags retention. v1 can be manual pass/fail with the guided slides.
- IMEI: `dumpsys iphonesubinfo` / `service call`; Luhn check offline; blocklist via a paid GSMA-style API optional.
- Data model: a versioned `rubric.json` + `report.json`; PDF via headless print.
- Hard part: sensor + burn-in verification without deep per-OEM hacks — the companion-APK socket is the clean path; automated OLED-ghosting detection from a phone-photo is the genuinely fuzzy CV bit.

## v1 scope
- Single connected device.
- Battery health %, model/storage/OS, root state, IMEI Luhn check.
- Guided manual R/G/B burn-in slides + button/touch prompts with tap-to-pass.
- One-page PDF export.

## Out of scope
- iOS.
- Automated CV ghosting detection (manual in v1).
- Bulk/rack grading of many phones at once.

## Risks & unknowns
- USB-debugging friction deters casual sellers.
- OEM variance in `dumpsys` fields (Samsung vs Pixel vs Xiaomi).
- Live IMEI blocklist needs a paid data source.

## Done means
Plug in two phones — one healthy, one with a known-weak battery — and produce two PDFs where the battery-health %, model, and IMEI-checksum result are correct for each, and the weak phone is graded a tier lower per the rubric.
