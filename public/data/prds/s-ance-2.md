## Overview
Séance grafts Phasmophobia's core loop — gather evidence with instruments, then identify a hidden entity from a fixed table — onto network forensics. It's a browser game (and a teaching tool) for homelabbers, SOC-curious folks, and CTF players: each round a synthetic "ghost" haunts a simulated network, and you deduce which of a dozen threat archetypes it is.

## Problem
Real packet-analysis skill is learned on messy live captures nobody wants to hand a beginner, and blog write-ups of attacks are read passively. Phasmophobia proved that "deploy instruments, cross-reference three clues, commit to an ID" is wildly compelling. That exact loop maps cleanly onto "is this beaconing malware, a retry storm, a DNS tunnel, or just chatty telemetry?" — but nobody's built the ghost-hunt version.

## How it works
A round spins up a haunted network view. You have a probe budget (say 10 points). Instruments cost points and reveal one class of evidence: pcap slice (payload/ports), DNS log (query patterns/entropy), netflow (fan-out, byte ratios), timing graph (jitter/beacon interval), TLS/JA3 fingerprint. Each network ghost in the table has a fixed evidence signature (e.g. *Beacon*: regular interval + low bytes-out + rare domains; *DNS Tunnel*: high-entropy subdomains + huge query volume; *Retry Storm*: exponential timing + single destination + no exfil). You gather clues, cross out ghosts, then commit an ID. Wrong ID = the ghost "detonates." Date-seeded daily scenario + shareable result; a co-op party mode where each player controls one instrument.

## Technical approach
All client-side. Scenarios are generated, not real traffic: a seeded generator picks a ghost, then synthesizes evidence sampled from its signature distribution plus decoy noise (so two instruments can mislead — you need three). Data model: `Ghost { id, signature: {instrument → distribution} }`, `Scenario { ghostId, evidence: {instrument → sampledData} }`. Timing/netflow rendered with a lightweight charting lib; pcap slices shown as syntax-highlighted hex/ASCII. Seeded PRNG (seedrandom) keyed by date. Hardest part is authoring signatures that are *distinguishable but not trivially so* — evidence must overlap enough that a single probe is ambiguous, forcing genuine cross-referencing, which needs a confusion-matrix pass over generated rounds to tune.

## v1 scope
- 8 network ghosts with hand-authored signatures
- 4 instruments, a probe budget, commit-to-ID + win/lose
- Seeded daily scenario + emoji share string
- A one-screen "ghost journal" reference table

## Out of scope
- Real packet ingestion / live capture
- Co-op multiplayer (v2)
- Campaign/story mode, difficulty progression

## Risks & unknowns
- Balancing evidence overlap (confusion matrix tuning) is the whole game
- Could teach cargo-cult heuristics if signatures are too clean vs. reality
- Needs enough ghost variety to stay fresh past a week

## Done means
I can play a daily round: spend a probe budget across instruments, read the evidence, commit to a ghost from the table, and get a correct/incorrect verdict plus a shareable result — and the same date yields the same scenario on any machine.
