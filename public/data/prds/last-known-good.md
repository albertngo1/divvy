## Overview
A B2B service that continuously proves your database backups are restorable — and turns that proof into a signed, tamper-evident artifact. Buyers: seed-to-Series-B engineering teams with 1–20 Postgres databases who have SOC 2 obligations, a cyber-insurance questionnaire asking for "documented RTO/RPO testing," and zero appetite to build restore automation.

## Problem
Everyone runs backups. Almost nobody restores them. The first real restore happens during the outage, which is when you discover the WAL archive stopped 40 days ago, the `pgvector` version doesn't match, or the dump excludes a schema. Meanwhile auditors and insurers ask for a *tested* RTO number, and teams write down a guess. There is no artifact that says "on 2026-07-28 this backup restored in 11m42s and passed 14 assertions," and no way for a third party to trust it wasn't typed into a spreadsheet after the fact.

## How it works
You install an agent (a CloudFormation stack creating a cross-account role) so restores run in *your* VPC — we never touch your bytes, only metadata. Weekly, the control plane instructs the agent to: boot an ephemeral instance, restore from your WAL-G/pgBackRest/RDS snapshot to the newest recoverable point, stopwatch the wall-clock to first successful `SELECT 1`, run your assertion pack, tear everything down.

The assertion pack is a plain `.sql` file you commit: row counts per critical table, per-table freshness (`max(updated_at)` within N minutes), a few checksums, and any invariant you care about. Measured RPO = now minus the newest committed row timestamp found. Output is a JSON report plus PDF, signed ed25519 and appended to a public Merkle transparency log, so an auditor can verify the timestamp and content were never edited.

## Technical approach
Control plane: FastAPI + Postgres + Temporal for the long, retry-heavy restore workflow. Agent: a small Go binary launched as a Fargate task; restore target is an EC2 instance with attached gp3, or `aws rds restore-db-instance-to-point-in-time` when snapshots are the source. Extension/version drift is detected up front by comparing `pg_available_extensions` on the target against the source's `pg_extension` catalog captured in the last report.

Data model: `target`(engine, source_type, credentials_ref) → `run`(started_at, restored_lsn, rto_ms, rpo_ms, cost_cents) → `assertion_result`. Signing: ed25519 over the canonicalized JSON; leaves batched hourly into a Merkle tree whose roots are published, so certificates are verifiable offline.

The hard part is cost and time on large databases — a 2 TB restore weekly is expensive. Mitigation: snapshot-clone restores where the provider supports them, and a tiered schedule (full restore monthly, WAL-replay-only integrity check weekly).

## v1 scope
- Postgres only, WAL-G-to-S3 only, AWS only
- Weekly cron, one target per customer
- Assertion pack = one `.sql` file, each statement must return true
- Emailed PDF + JSON with measured RTO/RPO
- Signature + published Merkle root; a `lkg verify report.json` CLI

## Out of scope
MySQL/Mongo, GCP/Azure, app-level failover testing, restoring into production, multi-region orchestration, a dashboard beyond a single run list.

## Risks & unknowns
Cross-account IAM makes security review the sales bottleneck; restore cost could exceed price on big customers; insurers may not yet discount on evidence, so the wedge may be SOC 2 evidence collection instead; a failed restore is a support incident you now own emotionally.

## Done means
One design-partner database restores weekly unattended for a month; a deliberately corrupted WAL segment produces a FAILED report within one cycle; the emailed PDF's signature verifies against the published Merkle root from a machine that never touched the service.
