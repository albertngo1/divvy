## Overview

Label Says is a ~$25 hardware jig plus a small CLI that characterizes a USB-C cable three ways — what its e-marker chip *claims*, what its conductors *measure*, and what a PD negotiation *actually yields* — and reduces all three to a stable fingerprint. For tinkerers, IT closets, and anyone who has ever wondered whether the cable someone handed them at a conference is the cable they think it is.

## Problem

USB-C cable markings are unreliable-to-fictional: 240W labels on 3A wire, "USB4" on USB 2.0-only conductors. That's the annoying failure. The interesting failure is adversarial — malicious cables (O.MG-class) contain extra silicon, and they look, weigh, and charge exactly like the real thing. Existing consumer testers give you a number on an LCD and no memory. Nobody keeps a *registry* of the cables they own, so a swap is undetectable.

## How it works

1. Plug the cable between the two ports on the jig.
2. `labelsays scan` runs three passes:
   - **Claim**: sniff the CC line, issue `Discover_Identity` VDM, capture the ID Header / Cert Stat / Product / Cable VDO — max current, cable speed, VBUS-through, active vs passive, VID/PID.
   - **Measure**: apply a programmed load at three current steps, measure VBUS at both ends, solve for round-trip conductor resistance; measure GND drop separately; check SBU/D+/D- continuity.
   - **Negotiate**: request each advertised PDO from a fake sink and record what the source actually delivers.
3. Output a verdict table with mismatches highlighted (`VDO says 5A, measured 340 mΩ → cannot sustain 5A without >1.7V drop`) and a `sha256` fingerprint of the normalized tuple.
4. `labelsays register --name "desk-left"` stores it. `labelsays check desk-left` re-scans and diffs. Any drift in VID/PID, VDO bits, or resistance beyond ±8% is a loud failure.

## Technical approach

- **Jig**: RP2040 (Pico) + two FUSB302B PD PHYs (one per end, so you see both sides of the cable) + INA219 current/voltage sensors + a small programmable e-load (logic-level MOSFET, gate driven by DAC, 5W resistor, closed-loop on INA219 reading). Two USB-C receptacles with all pins broken out.
- **Firmware**: C, using a trimmed PD stack (tcpm-style state machine from the Zephyr/Chromium EC lineage) — it must speak enough of USB PD 3.1 to issue structured VDMs and act as a sink.
- **Host**: Python CLI over USB CDC. SQLite registry: `cables(id, name, fingerprint, vdo_blob, r_milliohm, first_seen, last_seen)`, plus a `scans` table for history so resistance drift over time is graphable.
- **Hard part**: the fingerprint must be stable across temperature and connector reseating while still catching a swapped cable. Resistance varies with contact quality; the fix is many reseats during registration to learn a per-cable tolerance band, plus weighting the immutable VDO bits far more heavily than the analog measurements.

## v1 scope

- Passive cables only. 5V and 9V PDOs only. No 5A/EPR.
- `scan`, `register`, `check` — three commands, text output.
- Mismatch rules: three hardcoded checks (current claim vs resistance, speed claim vs SS pair continuity, VID/PID drift).

## Out of scope

- Signal-integrity / eye diagrams, USB4 20Gbps testing, active cable redrivers, a GUI, a hosted database of known-good VIDs.

## Risks & unknowns

- Many cheap cables have no e-marker at all; for those the fingerprint is purely analog and much weaker. Say so honestly in the output.
- A sophisticated malicious cable can replay a legitimate VDO byte-for-byte — this catches swaps and lies, not a determined clone. Frame it as inventory integrity, not attestation.
- E-load thermal limits at 9V.

## Done means

Given ten cables from a drawer, the tool registers all ten, and after shuffling them and re-scanning, correctly identifies each by name with zero false matches — and flags a cable labeled 100W whose measured resistance makes 100W impossible.
