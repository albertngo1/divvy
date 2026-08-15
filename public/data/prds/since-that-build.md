## Overview

`since` is a CLI (plus an LSP-adjacent editor plugin) that takes a stack trace produced by commit X and replays it against commit Y — your checkout. Every `file:line` is remapped through the intervening diffs, so `auth.py:412` from the build that crashed becomes `auth.py:389 (moved)` in the tree in front of you. For anyone who reads Sentry, Datadog, or a customer's pasted traceback against a moving `main`.

## Problem

A stack trace is a coordinate system pinned to a commit. The moment anyone else merges, those coordinates rot. You open line 412, find a blank line or an unrelated function, then spend four minutes on `git log`/`git blame` archaeology just to reach the *starting point* of debugging. This happens several times a day on any team with real deploy velocity, and every debugging session pays the tax before it begins.

## How it works

1. Pipe or paste a trace: `sentry issues show 4812 | since --from-build $SHA`.
2. `since` parses frames with per-language grammars (Python traceback, Node/V8, JVM, Go panic, Rust backtrace).
3. For each frame's file, it walks the commit chain from the build SHA to `HEAD`, composing line maps.
4. It prints the trace re-rendered: new line number, three lines of current source inline, and a tag per frame — `unchanged`, `moved +23`, `CHANGED`, `deleted`, or `file renamed`.
5. `--open` sends the whole thing to your editor as a jump list.

The `CHANGED` tag is the real payoff: it instantly separates "this bug still exists exactly as shipped" from "someone already touched this code — read the diff first."

## Technical approach

Rust or Go, single static binary, `libgit2`/`go-git` for object access. Core data structure: a **line map**, a sorted array of `(oldStart, newStart, length)` runs built per commit-pair from `git diff -U0` hunk headers; composing across N commits is a linear merge of interval maps, so a 400-commit gap costs milliseconds. Rename detection comes from `--find-renames` similarity scores so a moved file still resolves. When a frame lands *inside* a modified hunk, the line is unmappable — that is precisely the `CHANGED` signal, and `since` prints the hunk instead of guessing.

Build SHA discovery: read it from the trace's release tag, `--from-build`, or a `.since.toml` mapping deploy IDs to SHAs.

Hard parts: (a) shallow clones and squash-merges break the chain — detect and degrade to a fuzzy content anchor (hash the frame's ±5 source lines from the old blob, search the new blob); (b) minified/bundled JS needs source maps before any of this is meaningful; (c) inlined and generated frames have no honest source coordinate.

## v1 scope

- Python tracebacks and Node V8 stacks only
- `since --from-build <sha> < trace.txt` reading stdin, printing annotated output
- Line map composition + rename following; no fuzzy fallback
- `--json` output so editors can consume it

## Out of scope

Sentry/Datadog API integration, source maps, JVM/Go/Rust parsers, VS Code extension, remapping in the other direction.

## Risks & unknowns

Squash-merge workflows may sever history often enough to make the fuzzy anchor mandatory rather than optional — needs measuring on a real repo first. Trace formats vary more than expected across framework middleware wrappers. Value evaporates for teams that deploy from tags they still have checked out.

## Done means

On a repo with 500 commits since the build, a 12-frame Python traceback is remapped in under 200ms, every unchanged frame points at byte-identical source, and every frame the tool marks `CHANGED` genuinely intersects a diff hunk.
