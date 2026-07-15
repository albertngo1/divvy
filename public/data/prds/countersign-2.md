## Overview
Countersign is a small B2B SaaS that adds an out-of-band confirmation step to money-movement in real-estate title, escrow, and small law firms. When someone requests a wire or ACH change, the *real* counterparty — buyer, seller, lender, or exec — approves it on a channel established at onboarding, never on the inbound call itself.

## Problem
Business Email Compromise and now cheap voice cloning let a fraudster spoof a CEO, agent, or seller and redirect a closing wire. Title and escrow companies routinely move hundreds of thousands per transaction; a single redirected wire is catastrophic and often uninsured. Today verification is a bookkeeper calling 'the number on file' — which is exactly what the attacker impersonates. The HN 'three-second theft' piece shows why the inbound channel can no longer be trusted at all.

## How it works
1. At deal open, each party registers a verification channel (their phone via SMS/app push, plus a shared secret) — think of it as a mini-KYC handshake per transaction.
2. Any payment instruction (new wire, changed account number) is entered by staff into Countersign.
3. Countersign initiates an *outbound* challenge to the registered party: a push notification or SMS with a one-time code and the exact dollar amount + last-4 of the destination account.
4. The party confirms the details match; only then does Countersign mark the instruction 'verified' and log an immutable evidence trail.
5. Mismatch or timeout → blocked, with an alert to the compliance officer.

## Technical approach
Stack: Rails or Django + Postgres, Twilio Verify for SMS/voice OTP, a thin React dashboard, and a mobile PWA for approvers (no app-store friction). Data model: `Organization`, `Transaction`, `Party` (with verified channel + rotating shared secret), `Instruction` (amount, masked destination, state machine: draft→challenged→verified/blocked), `AuditEvent` (append-only, hash-chained for tamper evidence). Challenges are TOTP-style codes bound to instruction details so a code phished in isolation is useless. The genuinely hard part is onboarding trust: how do you register a channel for a party you've only ever met over the same untrusted email/phone? v1 solves this by piggybacking on the in-person or notarized moment that already exists in a closing.

## v1 scope
- Single org, staff-entered instructions
- One approver per instruction, SMS OTP + amount/last-4 echo
- Hash-chained audit log with PDF export for the file
- Slack/email alert on block

## Out of scope
- Bank/escrow-software integrations (manual entry first)
- Multi-party quorum approvals
- Biometric or hardware-key channels

## Risks & unknowns
- Channel-registration bootstrap is the whole ballgame; if it's phishable, the product is theater.
- Insurance/regulatory positioning (is this a 'control' underwriters recognize?).
- Sales cycle into conservative title industry is slow.

## Done means
A title officer can create a $250k wire instruction, the seller receives an outbound challenge echoing the amount and last-4, confirms it, and the system produces a tamper-evident PDF audit trail — and a simulated attacker who controls the inbound email/phone cannot get an instruction marked 'verified'.
