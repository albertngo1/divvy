## Overview

Blast Freeze is a CLI + optional GitHub Action that audits a repository's *permanent* weight — the bytes that will be re-downloaded by every clone, every CI job, forever — and attributes that weight to the specific commits and authors that introduced it. It exists for the maintainer who just watched someone commit a 150MB binary and wants to answer, before the revert lands, "what does this actually cost us, and what else is already in here that we never noticed?"

## Problem

Git history is write-once in practice. A vendored binary, a checked-in `.pack`, a 40MB test fixture, an accidental `node_modules` — you can `git rm` it and the repo *looks* clean, but every future `git clone` still pays for it. Nobody notices because the itch is distributed: the maintainer feels nothing, while 4,000 CI runs a month and every new contributor eat the tax. Existing tools (`git-sizer`, BFG) tell you the repo is big; they don't tell you *when it happened, who did it, or what it costs per month*.

## How it works

Run `blastfreeze audit` in a repo. It walks the full object graph and produces a "cold chain report":

1. **Frozen weight** — every blob >256KB that is unreachable from HEAD (i.e. deleted, but still in history). These are pure dead weight.
2. **Freeze point** — for each such blob, the introducing commit, author, date, and the deleting commit if any. Rendered as a timeline: "2024-03-11, `a3f9c1`, +38MB, `vendor/chromedriver`, deleted 6 days later, still costing you."
3. **Carrying cost** — multiply cumulative repo size by observed clone volume. If run as a GitHub Action, it pulls `GET /repos/{owner}/{repo}/actions/runs` to count monthly workflow runs, assumes one fetch per run (configurable, minus cache hits), and reports "this repo ships 61GB/month of dead bytes; 38MB of that is chromedriver from 2024."
4. **Thaw plan** — emits a ready-to-run `git filter-repo --strip-blobs-bigger-than` invocation plus the blowback list (every open PR that would need rebasing, from the API), so the maintainer sees the real cost of cleanup before committing to it.

Optional `--guard` mode runs on PRs and fails the check when a diff adds a blob above threshold that is non-text by entropy, posting the projected lifetime cost in the PR comment: *"this 150MB file will cost ~2.1TB/year of clone bandwidth."*

## Technical approach

Go, single static binary, using `go-git` for portability but shelling to `git cat-file --batch-all-objects --batch-check='%(objectname) %(objecttype) %(objectsize) %(objectsize:disk)'` for the fast path — that one command gives the whole object inventory in a single pass and is dramatically faster than any library walk.

Data model: an in-memory table of `{oid, size, diskSize, path, introCommit, introAuthor, introTime, deleteCommit, reachableFromHead bool}`. Reachability comes from `git rev-list --objects --all --filter=blob:none` vs `git rev-list --objects HEAD` set difference. Path attribution and intro-commit discovery is the expensive part: naive `git log --all --find-object=<oid>` is O(blobs × history). Instead do one reverse `git log --all --raw --no-abbrev --pretty=format:%H%x00%an%x00%at` pass, streaming, and build oid→first-appearing-commit in a single sweep — one process, one traversal, all blobs attributed.

Binary-ness is entropy-based (Shannon entropy over the first 8KB, >7.2 bits/byte = compressed/binary) rather than extension-based, so it catches `data.txt` that's actually a base64 tarball.

The genuinely hard part is the carrying-cost model being defensible rather than clickbait. GitHub does not expose clone bandwidth for repos you don't own, and CI caching (`actions/checkout` with `fetch-depth: 1`) changes the math by an order of magnitude. v1 handles this by parsing the repo's own workflow YAML for `fetch-depth` and reporting a range with the assumption stated inline, never a single scary number.

## v1 scope

- `blastfreeze audit` in a local repo, terminal table output only
- Unreachable blobs >256KB, with intro commit/author/date
- Total frozen weight vs live weight, as a single headline number
- Entropy-based binary detection
- Emits the `git filter-repo` command as text; does not run it

## Out of scope

- Actually rewriting history (print the command, let the human pull the trigger)
- The GitHub Action / PR guard mode
- Non-git VCS
- Any hosted service or web dashboard
- LFS migration advice

## Risks & unknowns

- On multi-GB repos the single reverse `git log --raw` pass may still take minutes; needs a progress bar and possibly a `--since` cutoff.
- Shallow-clone-by-default CI means the carrying cost may be far smaller than the dramatic framing implies — if the honest number is boring, the tool is just `git-sizer` with authorship. The authorship timeline has to carry the value on its own.
- Naming and shaming authors is socially loaded; default output should attribute to commits, with `--blame` opt-in for names.

## Done means

Run against a public repo with a known committed-binary incident, and the tool reports that blob in the top 3 by frozen weight, names the correct introducing commit SHA and date, and completes a full audit of a 500MB-history repo in under 60 seconds on a laptop.
