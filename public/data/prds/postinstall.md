## Overview
Postinstall is a CLI + tiny web service that scans an untrusted project — a take-home interview repo, a random `npm install`, a StackOverflow zip — for code that executes *before you asked it to*: git hooks, package-manager lifecycle scripts, obfuscated payloads, and outbound-network behavior. Aimed at job seekers, security-curious devs, and bootcamps whose students are handed repos and told to run them.

## Problem
The HN post 'I Inspected My Take-Home Interview Project. It Was a Whole Operation' documented a fake interview repo whose git hooks and install scripts quietly exfiltrated data. Candidates are the perfect mark: they *want* to run the code, they're rushed, and 'just clone it and `npm install`' is normal. The attack surface — `preinstall`/`postinstall` scripts, `.husky/` and `.git/hooks/`, `Makefile` install targets, VS Code `tasks.json` autorun — is invisible unless you go looking, and most candidates don't know to.

## How it works
`npx postinstall ./their-repo`. It does a **static pass** with zero code execution: enumerates every auto-run entry point, flags obfuscated/minified blobs, base64 chunks, `eval`, `child_process`, and network calls, and grep-maps every URL/IP the project would contact. Then an optional **dynamic pass** runs `npm install --ignore-scripts` inside a network-jailed container, re-enables scripts, and records real syscalls/DNS via strace/tcpdump — showing you 'this postinstall script tried to POST ~/.ssh to 5.8.x.x'. Output is a ranked report: red (executes + network), yellow (executes locally), green (inert).

## Technical approach
Stack: Node CLI for the static analyzer, a Docker/gVisor sandbox with an egress-blocking network namespace + fake DNS sink for the dynamic pass. Static: parse `package.json` scripts, walk `.git/hooks`, `.husky`, `Makefile`, `Justfile`, `.vscode/tasks.json`, Python `setup.py`/`sysconfig` hooks; AST-scan JS with `@babel/parser` for `eval`/`Function`/`require('child_process')`/`net`/`http`; entropy-score strings to catch obfuscation. Dynamic: run install in the sandbox, capture DNS queries and connect() attempts via a pinned resolver + iptables log. Data model: `entrypoint(kind, path, trigger)`, `signal(entrypoint_id, type, severity, evidence)`. Hard part: distinguishing legit postinstall (native module rebuilds, `node-gyp`) from malicious — solved with an allowlist of known-benign patterns plus a 'why this fired' explanation so the human makes the call.

## v1 scope
- JS/npm ecosystem only
- Static pass fully offline, no execution
- Enumerate git hooks + npm lifecycle scripts + Makefile targets
- Terminal report with red/yellow/green and clickable evidence lines

## Out of scope
- Dynamic sandbox pass (v2)
- Python/pip, Go, Rust ecosystems
- CI integration / GitHub App

## Risks & unknowns
- False positives on legit native-module postinstalls annoying users
- Determined attackers can time-bomb or geofence payloads past a one-shot scan
- Sandbox escape risk in the dynamic pass — must be off by default

## Done means
Pointed at the real fake-interview repo from the HN post (and 5 hand-crafted malicious samples), Postinstall flags the exfiltration entry point RED in every case, with the offending file, line, and destination URL shown — and flags a clean create-react-app project all-green.
