## Overview
Detonate is a one-command disposable sandbox that 'detonates' an untrusted project and reports every install-time side effect. For job candidates handed a take-home repo, OSS reviewers vetting a PR, and anyone about to run `npm install` on code they didn't write.

## Problem
The HN post 'I Inspected My Take-Home Interview Project. It Was a Whole Operation' documents a take-home whose git hooks and postinstall scripts quietly pwn the candidate's machine. The default human behavior is `git clone && npm install` — trusting a stranger's lifecycle scripts with full shell access. There's no easy 'blow it up somewhere safe first' button.

## How it works
Point Detonate at a repo or zip. It spins a throwaway container, runs the install with network + filesystem + process tracing, and produces a red/green verdict: outbound connections attempted, files written outside the project dir, binaries spawned, git hooks present, and obfuscated/eval'd/base64 payloads in scripts. You see exactly what the install *tried* to do, then decide.

## Technical approach
Docker for the disposable rootfs (Firecracker/Lima as a stronger-isolation upgrade). Install runs under strace or eBPF (bpftrace) inside a network namespace with NO real egress — instead a logging DNS/HTTP sink answers everything, so beaconing payloads 'connect' to a honeypot and reveal their intent without reaching a real host. A static pre-scan reads `package.json` scripts, `.husky/` and `.git/hooks/`, and postinstall bodies for `eval`, `child_process`, base64 blobs, and env exfil patterns. Heuristic score plus optional LLM triage of the flagged scripts. Output: JSON + a terminal summary. Hard part: making the faked network realistic enough to trigger payloads while guaranteeing zero real egress, and keeping false positives low.

## v1 scope
- Node projects only, Docker sandbox
- Capture outbound connection attempts, fs writes outside cwd, spawned processes
- List lifecycle scripts + git hooks with suspicious-pattern flags
- Red/green summary, nonzero exit on danger

## Out of scope
- Windows / native Windows malware
- Full reverse-engineering of payloads
- CI/CD integration

## Risks & unknowns
Sandbox escape (must default to no real network, ever); false confidence for users; sandbox-aware malware that stays dormant when it detects tracing.

## Done means
`detonate ./suspicious-repo` on a repo with a malicious postinstall flags the outbound beacon and the git hook, returns nonzero, and the payload never touches the host machine.
