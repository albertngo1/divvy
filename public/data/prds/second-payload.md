## Overview
Second Payload is a browser-based daily puzzle for reverse-engineers and the merely curious: every day a fresh obfuscated, self-evaluating script (bash/JS/PowerShell flavor rotates) is served, and you race to unwrap it to the hidden message inside. It's the passive delight of reading 'Decoding the obfuscated bash script on a Uniqlo t-shirt' turned into a competitive daily.

## Problem
Write-ups deobfuscating malware, CTF one-liners, or novelty shirt scripts are fun to read but you never *do* them — you scroll the reveal. Meanwhile hidden-payload stories (Tenda backdoor, GitLost prompt injection) prove deobfuscation is a real skill worth drilling. There's no low-stakes daily rep.

## How it works
The day's script is shown in a sandboxed editor. You never run the real thing; instead you use safe 'probes': substitute-and-preview (replace `eval`/`exec` with `echo`), base64/hex/rot decode, un-minify, variable-rename, and a step-tracer that shows what each layer *would* emit. Each probe you use is logged. When you submit the final decoded plaintext flag, you're scored on wall-clock time and probe count (fewer = better). Wordle-style share string: 🧅🧅🧅 for layers peeled, ⏱ for time. Global daily leaderboard + streak.

## Technical approach
Static site (Vite + TS). Puzzles are authored offline as a layered spec: `{ layer: 'base64'|'rot13'|'xor'|'char-substitution'|'string-reverse'|'gzip', payload }`, composed to produce the obfuscated blob; the solver runs the same primitives *in reverse* purely client-side — no code execution ever, so it's safe by construction. The 'self-evaluating' illusion (script that decodes itself) is faked with a deterministic interpreter for a tiny whitelisted opcode set (concat, decode, emit) rather than a real shell. Date-seeded via `flag = HMAC(dailyKey, YYYY-MMDD)`; leaderboard is a single Cloudflare Worker + KV storing `{hash, timeMs, probes}`. Hard part: authoring layered puzzles that are decodable by humans but not trivially one-shot by pasting into an online decoder — mix encodings and add a char-substitution layer keyed to an in-puzzle clue.

## v1 scope
- One encoding family (base64 → rot13 → reverse), 3 layers
- Client-side reverse-primitives + step preview
- Date-seeded daily puzzle, no accounts
- Local streak in localStorage, share string

## Out of scope
- Real script execution / sandboxing a shell
- User-submitted puzzles
- Multi-language interpreters

## Risks & unknowns
- Players paste into CyberChef and skip the game — mitigate with a substitution layer keyed to an in-puzzle riddle
- Puzzle authoring is the real labor; need a generator to keep the daily fed
- 'Teaches obfuscation' optics — keep payloads benign/silly

## Done means
On a fresh browser, today's puzzle loads, a first-time player can peel all three layers using only the provided probes, submitting the correct flag records a time+probe score to the shared leaderboard, and the share string copies to clipboard.
