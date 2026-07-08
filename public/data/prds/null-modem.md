## Overview
Null Modem is a shop-floor appliance + web UI that loads NC programs onto legacy CNC controls (Fanuc, Mazak, Okuma, pre-USB Haas) that only accept G-code via RS-232 serial or a 3.5" floppy. It's for small job shops and one-person machine shops who keep an ancient Windows XP tower alive purely to talk to a $200k machine.

## Problem
A huge share of working CNC iron predates USB. Programs move via serial drip-feed (the control's memory is too small to hold the whole program) or floppy disks that are rotting and unreadable. The transfer PC is a single point of failure, floppy drives are failing, and the exact XON/XOFF / baud / parity / end-of-block ritual lives in one veteran operator's head. When that PC dies or that person retires, the machine stops.

## How it works
A Pi with a USB-to-serial adapter (and optionally a FlashFloppy/Gotek emulator wired to the floppy header) sits next to the machine on the shop LAN. The operator opens the web UI on a phone/tablet, picks a program, and hits Send. The Pi negotiates the machine's saved serial profile, drip-feeds via DC1/DC2/DC3/DC4 handshake codes when the control requests more, and shows a live progress/throughput bar. For floppy-only machines it mounts a program as a virtual disk image the control reads.

## Technical approach
Pi 4 + Python (pyserial) backend, small Flask/FastAPI + htmx UI. Per-machine profile JSON: baud, data bits, parity, stop bits, flow control (XON/XOFF vs RTS/CTS), EOB char, leading/trailing null padding, remote-request codes. Programs live in a git repo on the Pi so G-code edits are diffable and revertible. Drip-feed uses a bounded ring buffer that refills on the control's DC1 request so the read buffer never starves at high feed rates. Floppy path shells out to FlashFloppy image mounts. Hardest part: matching each control's finicky handshake and null padding without a crash — getting timing/flow control wrong can feed a program mid-cut.

## v1 scope
- Single machine, RS-232 only (skip floppy emulation)
- Saved serial profile + send a program with live progress
- Git-backed program store with diff view
- Manual DC-code drip-feed for oversized programs

## Out of scope
- Receiving/uploading edited programs back off the control (DNC receive)
- Multi-shop cloud, accounts, tool/offset management
- Floppy emulation (v2)

## Risks & unknowns
- Control variance: every vendor's handshake differs; need a test matrix
- Safety: sending the wrong program or corrupting a drip mid-cut risks a machine crash — needs a confirm-and-verify gate
- Real floppy header wiring is fiddly and machine-specific

## Done means
On a real legacy Fanuc control, an operator selects a program in the web UI, drip-feeds it, and the machine runs the part correctly with no manual serial fiddling.
