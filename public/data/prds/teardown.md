## Overview
Teardown is a deobfuscation pipeline plus a public catalog for the scripts and small binaries that consumer products run behind your back — the Akamai-obfuscated bash shipping on retail-store devices being the spark. Aimed at privacy journalists, right-to-repair folks, and curious owners who lack reverse-engineering chops. You feed it a nasty script; it hands you a plain-English teardown.

## Problem
Consumer hardware increasingly ships self-evaluating, self-modifying scripts whose entire point is to be unreadable. The capability to unroll them (trace `eval`, decode base64/hex layers, resolve variable indirection, watch what a sandboxed run touches) is cheap for someone who does this daily and effectively impossible for the person whose fridge is beaconing. That gap is the arbitrage: turn a reverser's afternoon into a page anyone can read and cite.

## How it works
Paste or upload a script. The pipeline runs static passes (recursively decode base64/hex/rot layers, constant-fold string concatenation, resolve `$var` indirection, expand `eval`/`source` into an inline tree) then an optional instrumented dynamic pass in a locked-down container (no network egress, syscall trace via strace/seccomp) to capture files touched, commands spawned, and *attempted* network destinations. Output: an annotated AST view, a "phones home to" list with WHOIS/ASN, a plain-language summary, and a risk badge. One click publishes a signed, permalinked teardown page to a browsable catalog, deduped by script hash.

## Technical approach
CLI + web UI. Static deobfuscation in Python: tokenize bash with `bashlex`, iteratively rewrite decode/`eval` nodes until fixpoint, cap recursion depth. Dynamic pass: ephemeral rootless Podman container, `--network none`, DNS/connect attempts captured via an LD_PRELOAD shim or seccomp-notify (we log the *intent* without letting it out). Data model: `Teardown { scriptHash, layers[], destinations[], filesTouched[], summary, signature }`; catalog is content-addressed (hash = permalink), stored as flat JSON + static HTML (Hugo/SSG). Signing with minisign so pages are tamper-evident. Genuinely hard part: safely executing hostile code for the dynamic pass — everything runs static-first, dynamic is opt-in, sandbox escape is the real threat model.

## v1 scope
- CLI that takes a bash script and outputs the unrolled AST + decoded layers
- Recursive base64/hex/eval/var-indirection static passes to fixpoint
- Network-destination extraction from static strings
- Renders one static teardown HTML page per script hash

## Out of scope
- Dynamic sandboxed execution (v2, opt-in)
- Non-bash targets (JS, ELF binaries)
- Community submissions / moderation / accounts

## Risks & unknowns
- Executing hostile code safely — dynamic pass is a genuine security surface
- Legal exposure: DMCA/ToS around reversing shipped scripts
- Obfuscators can defeat static-only analysis; adversarial arms race

## Done means
Given the real Akamai-style obfuscated retail script, the CLI produces a readable unrolled tree, lists every hardcoded network destination, and emits a self-contained teardown HTML page keyed by the script's hash — with no code executed.
