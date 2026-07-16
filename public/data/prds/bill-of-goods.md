## Overview
Bill of Goods is a small desktop/CLI tool that probes a connected USB device, reads what its silicon actually reports, and contrasts it with the marketing claim you paste in — surfacing the lies in cheap hubs, docks, and drives. For tinkerers, IT buyers, AV/KVM installers, and reviewers who keep getting burned by spec-sheet fiction (à la the "7-port hub that wasn't" teardown).

## Problem
Cheap USB gear routinely lies: a "USB 3.0" hub is a USB 2.0 chip with blue plastic; a "7-port powered" hub is two tiered hubs sharing one 2A upstream that can't feed 7 devices; "self-powered" ports collapse under load. The truth is in the USB descriptors and topology, but nobody reads them. Buyers only find out when devices randomly drop.

## How it works
1. Plug the device in, run Bill of Goods.
2. It enumerates the device, walks the hub topology, and reads descriptors: bcdUSB (claimed spec version), negotiated link speed, hub tier depth, downstream port count, bMaxPower / power source, and whether ports are ganged.
3. You type or paste the product's marketing claim ("USB 3.2, 7 ports, 60W").
4. It renders a verdict card: claimed vs actual spec, a power-budget math check (sum of advertised per-port current vs upstream supply), tier/port-count mismatches, and a plain-English "here's the lie" summary. Optional: a quick sequential write test to attached storage to catch fake-capacity/fake-speed drives.

## Technical approach
Stack: Rust or Python CLI wrapping platform enumeration — macOS `system_profiler SPUSBDataType -json`, Linux `lsusb -v` + `/sys/bus/usb/devices` sysfs, Windows via SetupAPI/WMI. Parse the descriptor tree into a normalized topology model (nodes = hubs/devices, edges = ports, attributes = speed/power). Rules engine flags mismatches: `bcdUSB >= 0x0300` but negotiated speed high-speed → "3.0 chassis, 2.0 internals"; `sum(port bMaxPower) > upstream supply` → over-subscription. Marketing-claim parsing is a small regex/keyword extractor. Optional bandwidth attribution uses timed block writes. Hard part: normalizing wildly inconsistent enumeration output across three OSes and correctly attributing shared bandwidth across a hub tier.

## v1 scope
- macOS + Linux only.
- Read descriptor tree, print claimed-vs-actual verdict card.
- Power-budget over-subscription check.
- Manual paste of marketing claim.

## Out of scope
- Windows support.
- Bandwidth/throughput benchmarking (v2).
- Crowdsourced database of known-bad devices.

## Risks & unknowns
- Descriptors can themselves be spoofed by lying firmware — tool detects claim-vs-descriptor, not descriptor-vs-reality; must state this.
- Enumeration output varies by OS version and driver.
- Power draw is nominal (advertised), not measured without extra hardware.

## Done means
Running it against a real budget hub outputs a verdict correctly identifying at least one true mismatch (e.g., a USB 2.0 device in a hub sold as 3.0, or a power budget that exceeds the upstream supply) with a plain-English explanation.
