## Overview
Bang Bang (named for `!!`, the bash rerun-last-command bang) is a terminal roguelike that builds your deck from your real `~/.zsh_history`. It's a 'know thyself via your prompt' toy for developers and sysadmins — the cards you draw are literally the commands you lean on all day.

## Problem
Everyone's shell history is a dense, personal fingerprint of how they actually work, and it just sits there being grepped once a month. Meanwhile most 'personal-data games' graft a genre onto step counts or email. Nobody has made your command muscle-memory *fight for you*. There's a self-knowledge payoff: you discover you have 400 `git status` cards and zero `awk` cards.

## How it works
On first run it parses your history, tokenizes each line into a command 'archetype' (first word + subcommand: `git commit`, `docker ps`, `rm`, `grep`, `kubectl`, `ssh`), and assigns rarity by frequency — your top commands become common, reliable cards; rare exotic commands become powerful one-shot legendaries. Each day a date-seeded 'incident' enemy appears with a theme and weaknesses: *Disk Full* (weak to `rm`/`du`/`docker prune`), *Merge Hell* (weak to `git`), *Prod Down* (weak to `ssh`/`systemctl`/`kubectl`). Combat is turn-based: draw a hand of your command-cards, play them for effects pulled from a curated archetype→mechanic table (attack, block, cleanse debuffs, draw). `!!` is a wildcard that replays your last-played card. Win streaks unlock relics; a bad play (a destructive card with no target) can backfire. Everything is offline; args are stripped and only the archetype is kept.

## Technical approach
Node + Ink (React for the terminal) for the TUI, or a single local HTML page if you prefer paste-in. History parsing handles zsh extended-history timestamps and bash. Archetypes come from a hand-authored `archetypes.json` mapping ~120 common command families to a card template (cost, damage, keywords, flavor); unknown commands fall back to a generic 'improvised' card so nobody's history breaks it. Daily seed = date → deterministic incident + enemy stats (mulberry32 PRNG). The hard part is *making the mapping feel earned, not arbitrary* — the fun dies if `grep` doing 8 damage feels random, so each archetype's mechanic should riff on what the command actually does (`grep` = 'scry/filter', `kill` = execute a low-HP debuff, `sudo` = risky double-damage that can backfire).

## v1 scope
- Parse zsh history → deck with 3 rarity tiers
- One incident type, one enemy, turn-based combat loop in Ink
- Curated table for ~40 top command families + generic fallback

## Out of scope
- Relics/meta-progression, multiplayer, cloud sync, arg-level analysis, non-shell data sources

## Risks & unknowns
- Thin/boring histories yield weak decks — may need a starter pack
- Balancing frequency→power so a `cd`-heavy history isn't unwinnable
- Privacy optics of touching history (mitigate: local-only, args stripped, opt-in)

## Done means
You run one command, your real history loads, you fight today's Disk Full incident to a win or loss, and you feel a flicker of recognition seeing your top commands as your best cards.
