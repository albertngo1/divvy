## Overview
Kind Of is a single-player, daily-seeded deckbuilder that turns the WordNet lexical database into a climbing puzzle. It's for word nerds and deckbuilder fans who want a five-minute brain snack with a shareable score. Serious NLP infrastructure, reskinned as a solitaire ladder.

## Problem
Word games are mostly about spelling (Wordle, anagrams). Almost nothing lets you *feel* the shape of meaning — that a poodle is a dog is a canine is a carnivore is a mammal is an animal. WordNet encodes exactly that hierarchy and is beloved by researchers but invisible to everyone else. There's an itch: a game that makes taxonomy tactile and rewards elegant conceptual leaps.

## How it works
Each run starts at a random concrete noun (a 'leaf' like *espresso* or *dachshund*) and a target rank near the root (*entity*, *substance*, *organism*). You hold a hand of word-cards. To advance you play a card that stands in a valid relation to your current word: a **hypernym** (one step broader), a **hyponym** (narrower), or a **sibling** (shares a parent). Each play moves your token along the tree. Broader moves cost stamina; you regain stamina by taking clever sideways/down detours that pick up **rare-branch bonuses**. Reaching the target within the stamina budget wins; scoring rewards *short, high-rarity* paths and combo chains of same-relation plays. Draft two new cards between levels from a random offering. One shared daily seed, Wordle-style emoji share (the shape of your climb).

## Technical approach
Stack: static site, TypeScript + a small canvas/SVG board, no backend. Data source: the **Open English WordNet** (github.com/globalwordnet/english-wordnet), preprocessed offline into a compact JSON/flatbuffer of synsets with `hypernym`/`hyponym` edges and lemma strings. Precompute per-synset depth-from-root and a rarity score = 1/(subtree size) so obscure branches pay more. Daily puzzle = seeded RNG picks a start leaf and a reachable target, with a solver (BFS over the edge graph) precomputing par path length for scoring. Hand generation samples cards from a neighborhood of the solution path plus noise so every hand is winnable but not trivially. Hard part: pruning WordNet's 100k+ synsets to a fun subset (drop ultra-technical taxa, collapse duplicate lemmas) and tuning the stamina economy so 'obvious straight climb' loses to 'clever detour.'

## v1 scope
- One daily seed, nouns only
- Three card types: broader / narrower / sibling
- Stamina budget + rarity bonus scoring
- Emoji share string
- Local-storage streak

## Out of scope
- Verbs/adjectives (different WordNet relations)
- Multiplayer / leaderboards
- Accounts, server, anti-cheat
- Custom/endless mode

## Risks & unknowns
- WordNet paths can be jargon-heavy ('vascular_plant') — need aggressive curation to keep words recognizable.
- Balancing so skill beats luck given a random hand.
- Is a single climb long enough to feel like a 'run'? May need to chain 3–4 climbs per day.

## Done means
On a fresh browser, loading the site gives everyone the same start/target for the day; a player can win a climb, sees a score with a par comparison, and copies an emoji share that reproduces the path shape. Two devices on the same date get identical puzzles.
