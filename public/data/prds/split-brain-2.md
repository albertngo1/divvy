## Overview
Split Brain is a local-multiplayer party game for 4–8 people, one shared 'host' phone acting as the network. Each player is a database replica; together you try to agree on a shared log — but the host keeps injecting latency and partitions, and the fun (and betrayal) comes from watching consensus fail exactly the way real distributed systems do. Sparked by Cloudflare's Meerkat consensus post.

## Problem
CAP theorem, quorums, and 'split-brain' are abstract until you've been burned by them. But they're also a perfect party mechanic: hidden information, forced coordination, and a designated moment where the table splits into two camps that can't talk. There's no fun, physical way to *feel* a network partition.

## How it works
Players join a room by QR. Each holds a value on their screen. A round asks the table to commit an agreed entry to a shared log by passing messages — you tap to send your value to specific peers, routed through the host. Mid-round the host may PARTITION the table into two groups that can't message across the gap. Each side, not knowing the other's state, may elect its own leader and commit writes. When the partition HEALS, conflicting writes surface — and you're scored on consistency: points for a clean converged log, penalties for lost or duplicated entries (the split-brain failure everyone just caused).

## Technical approach
Host web app (SvelteKit) runs a WebSocket server over the LAN (or PartyKit) and is the message router. It maintains a simulated network: a per-round adjacency matrix (toggle links to create partitions), plus a delay queue on the message bus. Under the hood it runs a simplified Raft — terms, votes, elected leader, append-only log per replica. Scoring computes divergence between replica logs via edit distance at heal time. The genuinely hard part is game-design, not code: tuning partition frequency, message costs, and reconciliation scoring so the *failure modes emerge naturally and feel like a heist gone wrong* rather than a systems lecture.

## v1 scope
- 3 preset scenarios: happy path, one clean partition, flapping link
- 4 players, single value type, host screen shows ground truth
- One round type, manual host-triggered partitions

## Out of scope
- Real peer-to-peer networking between phones
- Byzantine faults / malicious replicas
- A tutorial/teaching mode with theory

## Risks & unknowns
Could read as homework instead of a party game; balancing chaos vs comprehension; LAN WebSocket setup friction on the host device.

## Done means
A full match runs end-to-end where a mid-round partition causes two simultaneous leaders, both sides commit writes, and reconciliation at heal produces a scored, visible conflict that the whole table can see and argue about.
