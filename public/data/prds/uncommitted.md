## Overview
Uncommitted is the gremlin twin of GitButler: a working git client that plays like Hunt: Showdown or Escape from Tarkov. Your dirty working tree is *loot in your backpack*; committing is *extracting alive*; losing changes is *dying with full pockets*. For developers who want their VCS to give them the visceral gear-fear it probably should.

## Problem
Git's UX flattens risk into calm status output. A junior nukes an hour of work with `git checkout .` and feels nothing until it's gone. Uncommitted re-injects the tension that matches the actual stakes: uncommitted work is genuinely at risk, so the interface should make you *feel* the exposure and reward the discipline of extracting (committing) often.

## How it works
The TUI shows your changes as loot with weight = lines changed and rarity = how long since it was saved. A HUD "threat meter" rises the longer you go without committing and the more files you've touched — the classic extraction pressure to bank your run. Actions are reskinned git: `commit` = **extract** (loot banked, threat resets, XP earned); `stash` = **stash cache** (safe but you must return for it); `git checkout`/discard = **you died, loot dropped**, complete with a death-recap of exactly which changes you flushed; a merge conflict spawns a **firefight** minigame where you resolve hunks under a soft timer; `push` = **exfil to base**. It's a real client — every action is a genuine git command underneath.

## Technical approach
Stack: Rust + ratatui (or Go + bubbletea), wrapping libgit2/gitoxide so every game action is a real, safe git operation. State model: poll `git status --porcelain=v2` + diff stats into a loot inventory; threat meter is a function of `uncommitted_line_count × minutes_since_last_commit`. The discard→"death" path must *actually* protect the user — it silently auto-stashes to a hidden ref before any destructive action so "death" is recoverable from a graveyard menu, turning a footgun into a teachable moment. Hard part: mapping messy real-world git states (detached HEAD, rebase-in-progress, submodules) onto the game metaphor without lying about what git is doing.

## v1 scope
- Read-only loot view of the working tree with weight/rarity
- Threat meter driven by uncommitted lines × idle time
- `commit` = extract animation + XP; `discard` = death recap with hidden-ref recovery
- Single repo, single branch

## Out of scope
- Merge-conflict firefight minigame (v2)
- Push/exfil, remotes, multiplayer 'raids'
- Rebase/cherry-pick metaphors

## Risks & unknowns
- Gamifying destructive git ops is dangerous if the safety net has any gap
- Novelty may wear off once the animations are seen; retention unclear
- Mapping non-linear git states to a linear "run" metaphor gets weird fast

## Done means
In a scratch repo I edit three files, watch the threat meter climb, run discard, get a death-recap listing exactly what I lost, and recover every byte of it from the graveyard menu's hidden ref.
