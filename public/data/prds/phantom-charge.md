## Overview
Phantom Charge is a competitive spot-the-error game built from realistic cloud bills. Each round, all players see the same detailed AWS-style invoice with hundreds of line items; exactly one has been tampered with (a phantom charge, a wrong unit rate, a double-counted NAT gateway). First to correctly tap it scores; wrong taps cost time. For engineers, FinOps folks, and anyone who's ever squinted at a Cost Explorer export.

## Problem
Reading a cloud bill is the most passive, dread-filled activity in tech — until the month AWS admits $1.7B of estimates were wrong and suddenly everyone's staring at line items they never learned to read. Bill literacy is a real, valuable skill taught nowhere. Turn the dread into a race and people will actually get good at it.

## How it works
Lobby of 2–8 players. Host starts a round; everyone gets an identical rendered invoice — grouped by service, with usage type, quantity, unit rate, and line total. A deterministic generator has injected exactly one anomaly from a taxonomy: arithmetic (qty×rate ≠ total), rate outlier (a t3.micro billed at m5.24xlarge rates), phantom resource (a region you never use), or double-charge. Players scan and tap the offending line. Correct = points scaled by speed and by how subtle the anomaly is; wrong tap = 10s lockout. After the round, a reveal panel explains the real-world tell ('NAT gateway data-processing is per-GB, this line billed it per-hour'). Best of N rounds; leaderboard. Difficulty scales anomaly subtlety.

## Technical approach
Static front end + a tiny WebSocket relay (or Firebase) for lobby sync — no real billing data ever touches it. Bill generator: seeded PRNG builds a plausible invoice from a catalog of real AWS service/usage-type strings and rough public on-demand rates (EC2, S3, NAT, data transfer, RDS), with realistic quantity distributions. Anomaly injector picks one line and applies a typed mutation, recording the ground-truth index + explanation template. Rendering is a table with tap targets; scoring is server-authoritative on first-correct-tap timestamps to prevent cheating. The genuinely hard part is making the *fake* bill realistic enough that the anomaly hides — decoy lines must be individually plausible, which means honest rate tables and correlated usage (an EC2 fleet implies matching EBS + data transfer).

## v1 scope
- Seeded single-anomaly bill generator, ~150 lines, 6 services
- 4 anomaly types with reveal explanations
- Local hot-seat or 2-player WebSocket lobby
- Speed-scored best-of-5 + leaderboard

## Out of scope
- Uploading your *real* bill (great v2, privacy-fraught)
- GCP/Azure catalogs
- Multi-anomaly / 'how many errors' mode
- Persistent accounts

## Risks & unknowns
- Realism ceiling: if decoys look fake the game is trivial; needs correlated usage modeling
- Rate tables drift; hard-coded approximations may feel wrong to experts (label as stylized)
- Anomaly taxonomy must feel fair, not gotcha-arbitrary

## Done means
Two people join a lobby, get the same 150-line bill, and the round reliably has one findable-but-non-trivial planted error whose reveal teaches a real billing gotcha — with the faster correct tap winning.
