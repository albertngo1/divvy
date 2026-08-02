## Overview

A CLI (and later an editor lens) that answers the question people actually ask when they run blame: *why is this line here, and who decided it?* It skips every commit that changed the line without changing its meaning.

## Problem

You blame a suspicious line. You get `chore: apply prettier`, or `refactor: move to src/`, or `rename userId -> user_id`. So you run `git log -L`, then `git blame -C -C -C`, then hunt for the reformat SHA to feed `--ignore-rev`, then repeat one level down. Four commands and three minutes, several times a day, and the friction is high enough that most of the time you just give up and guess. `.git-blame-ignore-revs` only helps if someone maintained it, which nobody did.

## How it works

`descent src/auth.py:42` walks history backwards from HEAD. At each commit that touched the line, it parses both the before and after blobs with tree-sitter and compares the **enclosing AST node**, normalized: whitespace stripped, string quote style canonicalized, trailing commas dropped, parenthesization normalized.

- AST-identical → cosmetic. Record it as a rung, keep walking.
- Node gone from this file → search the commit's other touched files for a subtree with a matching Merkle hash. If found, it's a move. Keep walking in the new file.
- Identifiers substituted consistently across the enclosing scope → rename. Keep walking.
- Anything else → **stop**. This is the commit where the meaning changed.

Output is a ladder, most recent first, each rung labeled with why it was skipped, ending at the real commit with its message and diff hunk.

## Technical approach

Rust, `git2` for history walking, tree-sitter grammars for the language set. AST subtree hashing is a Merkle hash over (node kind, normalized leaf text) — this is what makes cross-file move detection cheap, since you compare hashes rather than diffing. Renames are detected by checking whether a single consistent identifier substitution makes the two subtrees hash-equal.

Embeddings enter only as a last-resort tie-breaker: when a subtree was rewritten substantially, encode both versions with a small code model (fastembed / a MiniLM code checkpoint) and keep walking if cosine > 0.92, flagging the rung as *probably* the same idea. This is the only fuzzy step and it is always labeled as such.

Hard part is performance on deep histories: naive walking parses thousands of blobs. Mitigations are a pathspec-pruned revwalk, a sqlite sidecar caching `blob_oid → AST hash table`, and bailing out with a partial ladder after a wall-clock budget.

## v1 scope

- Python only
- One command, one line number, no ranges
- No cache — accept 10s on first run
- Stop at the first semantic change; no continuing past it
- Plain text ladder output

## Out of scope

Editor plugins, whole-file blame, merge commit heuristics, multi-language repos, blaming deleted lines.

## Risks & unknowns

Tree-sitter will fail to parse old revisions of files (syntax that predates the grammar, Python 2). Some rewrites are genuinely ambiguous — a rewritten function is a judgment call, and the embedding threshold will be wrong sometimes. On a chaotically-maintained repo the tool may be no faster than a human, and if the ladder is long it becomes noise rather than an answer.

## Done means

On 20 hand-labeled lines across three open-source Python repos with known reformat/move commits, it skips 100% of the cosmetic commits, lands on the human-agreed "real" commit for at least 16 of the 20, and returns in under 3 seconds per line on a warm cache.
