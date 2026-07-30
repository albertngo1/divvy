## Overview
Probate is a B2B SaaS that inventories an organization's low-code/no-code automation estate (Zapier, Make, Google Apps Script, Retool, Airtable automations, Power Automate, cron-y GitHub Actions), joins it against HRIS offboarding data, and produces a ranked docket of *orphaned* automations: things still executing on a schedule, still holding write credentials, whose author no longer works here. Buyers: IT ops, security, and the person who inherited "the ops folder." It is the deliberate inverse of the internal-tool-builder pitch — everyone sells you tools to create more of these; nobody sells the funeral.

## Problem
The modern company runs on thousands of small automations built by non-engineers. They are created in minutes and never deleted. When the creator leaves, the automation keeps firing — writing to Salesforce, emailing customers, moving money — under a service account nobody audits. IT has no inventory, security has no blast-radius model, and the only discovery mechanism today is an incident. Meanwhile finance keeps paying per-seat for the dead builder's license.

## How it works
1. Connect via OAuth/admin APIs, read-only: Zapier Platform API (`/v1/zaps`, run history), Google Workspace Admin SDK + Apps Script API (`projects.list`, `processes.list`, trigger metadata), Retool `/api/v2/apps` + audit log, Airtable Web API, Microsoft Graph for Power Automate flows.
2. Pull the HRIS roster (Workday/BambooHR/Rippling, or a CSV) and resolve each automation's owner, last human editor, and last human *runner*.
3. Score each artifact: `risk = write_surface × recency_of_execution × orphan_score × silence`. Write surface = which connectors it touches, weighted by a scope severity table (send email > create record > read). Silence = executions succeeding with zero human interaction in N days. Orphan = owner offboarded, or last edit older than tenure.
4. Output a docket per artifact with three buttons: **Adopt** (assign a live owner, notify them), **Probate Hold** (disable, keep 90 days, auto-restore if anyone screams), **Bury** (export definition to a git repo, then delete).
5. Weekly digest: "7 new orphans this week, 2 write to production Stripe."

## Technical approach
Rails or FastAPI + Postgres. Data model: `artifact(id, platform, external_id, definition_json, owner_email, last_edit_at)`, `execution(artifact_id, ts, status, triggered_by)`, `connector_scope(artifact_id, system, verb, severity)`, `person(email, status, terminated_at)`. Connector scopes are extracted by static parse of the definition JSON — for Apps Script, parse the manifest `oauthScopes` plus a tree-sitter pass over the `.gs` source for `UrlFetchApp`/`SpreadsheetApp` sinks. Identity resolution across platforms (personal Gmail Zapier account vs. corporate SSO identity) is the genuinely hard part; solve with a fuzzy join over display name + connected-account email + edit-time correlation, always with a human confirm step. Probate Hold uses each platform's disable endpoint plus a scheduled restore job.

## v1 scope
- Google Apps Script + Zapier only
- CSV upload for the employee roster
- Read-only: produce a ranked HTML/CSV docket, no disable buttons
- Manual OAuth by an admin, single tenant, run it as a consulting deliverable

## Out of scope
Auto-remediation, SOC2, Power Automate, rewriting automations into real code, cost reclamation.

## Risks & unknowns
Zapier's admin API coverage for enterprise accounts; whether execution history is retained long enough to measure silence; the political problem that disabling someone's zap breaks a workflow you didn't know existed (mitigated entirely by Probate Hold).

## Done means
Point it at a real Workspace with ≥200 Apps Script projects and a roster with ≥20 departed employees, and it names at least five scheduled scripts owned by leavers that have executed in the last 30 days and touch an external write scope — each verified by hand as genuinely orphaned.
