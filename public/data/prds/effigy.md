## Overview
Effigy is a small self-hosted honeypot that impersonates an accidentally-exposed `.git/` directory. The automated scanners that constantly probe the web for `/.git/config` (see the Lobsters "caught a .git/config crawler" post) find a perfectly plausible repo — one salted with fake secrets that are actually canary tokens. When an attacker dumps the repo and tries a credential, Effigy pings you with their IP, time, and which lure fired.

## Problem
Exposed `.git` dirs are a real breach vector, and scanners hammer for them 24/7. Defenders currently just block or ignore the noise. That throws away signal: you could instead learn *who* is scanning you, *what* they do with what they steal, and buy detection time before a real leak matters. Existing honeypots are heavyweight; nobody ships a drop-in `.git` decoy.

## How it works
1. Deploy Effigy behind your web server on a path/vhost that looks abandoned.
2. It serves a fully walkable fake `.git`: valid `config`, `HEAD`, packed refs, and loose objects that reconstruct into a believable app repo.
3. Sprinkled through the fake source: a `.env` with an AWS key (a canarytoken), a Slack webhook canary, and a DB URL. Each is unique per requesting IP.
4. When the scraper clones/dumps and later *uses* a canary, the token provider (or your own listener) fires a webhook → Effigy logs the correlation and notifies you via ntfy.
5. Optional tarpit mode: serve loose objects at a trickle to waste bot time.

## Technical approach
- **Stack:** a single Go binary (or FastAPI) reverse-proxied by Caddy/nginx; SQLite for request+token log.
- **Fake repo generation:** pre-bake a real small repo, then template per-IP secrets into blob contents at request time, recomputing object SHAs and pack index on the fly (or cache N variants). Serve the dumb-HTTP git protocol so `git-dumper`-style tools succeed.
- **Canaries:** Thinkst Canarytokens (free) for AWS-key + URL tokens; a self-hosted webhook receiver for custom ones. Data model: `probes(ip, ua, path, ts)`, `tokens(token_id, ip, kind)`, `triggers(token_id, src_ip, ts)`.
- **Hard part:** making the decoy convincing to tooling (correct pack/idx format, index-pack passes) while keeping per-IP secret injection cheap; and never letting a canary look *too* obviously fake.

## v1 scope
- Serve one static fake `.git` via dumb HTTP that `git-dumper` fully extracts.
- One AWS-key canarytoken embedded in a fake `.env`.
- Log every probe; ntfy alert on any token trigger.

## Out of scope
- Per-IP unique secrets (start with one shared canary).
- Tarpit/slowloris mode.
- Fingerprinting/classifying scanner families.

## Risks & unknowns
- Legal/ToS: canarytokens are passive and fine, but keep it clearly a decoy on your own infra.
- Sophisticated actors may detect the honeypot and skip it.
- Reconstructing valid git objects on the fly is fiddly.

## Done means
Running `git-dumper` against a deployed Effigy reconstructs the fake repo, and using the embedded AWS canary key triggers a notification containing the correct trigger source IP within seconds.
