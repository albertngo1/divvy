## Overview
Slow Packet turns a packet capture into a gorgeous, scrubbable, interactive teardown — the Bartosz Ciechanowski treatment, but generated *from your own traffic*. Feed it a `.pcap` of a TLS 1.3 handshake and it builds a 3D timeline you can drag through, watching bytes leave the client, cross the wire, and assemble into records. For students, TLS-curious engineers, and instructors who want a concrete artifact instead of a static diagram.

## Problem
Protocol diagrams are frozen and generic; Wireshark is powerful but reads like a spreadsheet of dread. Neither gives you the *felt sense* of sequence, latency, and dependency that makes a handshake click. And the best explainers (Ciechanowski) are hand-authored one-offs — nobody can point them at their own capture. The itch: 'show me *this specific* handshake, slowly, beautifully.'

## How it works
Upload a pcap. The tool parses packets, reconstructs the TCP flow and the TLS record layer, and lays them out as a 3D scene: two endpoints, a wire between them, and message 'envelopes' that travel across it. A scrub bar drives time; dragging it flies packets along the wire, expands a record to show ClientHello → key share → Finished, and highlights round-trip cost. Click any message for the decoded fields. A 'narrate' mode auto-walks the handshake with captions.

## Technical approach
Stack: fully client-side — WebAssembly pcap parsing (compile a slim libpcap/`pcap-parser`, or port logic to Rust→wasm), Three.js for the scene, TypeScript UI. Parse layers: Ethernet/IP/TCP reassembly, then TLS record framing; for TLS 1.3, dissect handshake messages up to the encryption boundary (post-handshake stays opaque unless keys are supplied). Data model: an ordered event list `(t, from, to, layer, type, bytes, fields)` that both the 3D layout and the scrubber consume. Timeline uses real capture timestamps, optionally time-warped so fast RTTs are visible. Hard part: correct, resilient dissection of messy real captures (retransmits, out-of-order, fragmented records) and a layout that stays legible when there are hundreds of packets.

## v1 scope
- Client-side pcap upload, single TCP flow
- TCP handshake + TLS 1.3 handshake messages only
- 3D two-endpoint scene + scrub bar + click-to-decode
- Sample capture bundled so it works with zero setup

## Out of scope
- Decrypting application data (no keylog support yet)
- Multi-flow / full-session dashboards
- QUIC, TLS 1.2 quirks, IPv6 edge cases

## Risks & unknowns
- Robust dissection of real-world captures is deep, fiddly work.
- 3D can become eye-candy that obscures more than it teaches — needs a 2D fallback.
- wasm pcap parsing performance on large files.

## Done means
Given the bundled sample pcap of a real TLS 1.3 handshake, I can scrub from first SYN to Finished, each message appears in correct order at its real relative time, and clicking ClientHello shows its decoded cipher suites and key share.
