## Overview
Plant is a hidden-role party wordgame for 4-6 people on a shared host screen with private phone controllers. A small in-browser LLM's perplexity is both the win condition and the lie detector: most players cooperate to keep a sentence bland, one saboteur tries to make it jarring, and the model's surprise is the objective 'tell' everyone argues over.

## Problem
Cooperative perplexity games (like our earlier Iron Out) all pull the same direction — toward blandness — with no betrayal or tension. Meanwhile social-deduction games lean entirely on human tells. Plant fuses them: the model gives an *objective, tamperable* signal, but who nudged it is still a human whodunit.

## How it works
The host TV shows a sentence skeleton with one blank per player, e.g. `The ___ chef ___ the ___ onto the ___ plate.` Each phone PRIVATELY owns exactly ONE blank (highlighted only on that phone) and a secret role: most players are **Cooks** (goal: fill their word so the finished sentence's perplexity stays LOW) and exactly one is the **Plant** (goal: push perplexity HIGH with a jarring-but-deniable word). Everyone types simultaneously and blind — no phone sees others' words or roles. The host assembles the sentence, scores it with distilgpt2, and the TV reveals the finished sentence + final perplexity against a 'clean' target line. Then every phone PRIVATELY votes who the Plant was. Plant wins if perplexity lands above the line AND they dodge the vote; Cooks win if they finger the Plant or keep it under the line.

Private per phone: your blank, your word, your role, your vote. Shared on TV: the skeleton, the assembled sentence, the perplexity meter, the vote tally. A passed phone can't hold simultaneous secret roles/blanks — the asymmetry is the game.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{skeleton, blanks[], phase}`, `Player{id, blankIndex, role, word, vote}`. distilgpt2 via transformers.js runs on the host. Blanks assigned round-robin; role dealt randomly. Two sync barriers: fill, then vote. The genuinely hard part is *legibility with deniability* — per-blank surprisal contribution must stay hidden until AFTER the vote, or it leaks the Plant mid-round; and the skeleton must be tuned so ordinary Cook words are genuinely low-surprisal, otherwise an innocent gets framed.

## v1 scope
- One hand-authored skeleton, 4-5 players, exactly one Plant, one round
- Desktop host + phone PWA, distilgpt2, English only
- Single perplexity score + one blind vote → win/lose resolves

## Out of scope
- Multiple rounds / cross-round scoreboard
- Multiple Plants or teams
- Player-authored skeletons, mobile host

## Risks & unknowns
- Model may find a Cook's honest word more surprising than the Plant's, causing false accusations — mitigate with skeleton tuning and a low bar for 'over the line.'
- Per-word attribution is noisy; keep it post-vote flavor only.
- Needs 4+ for deduction to breathe.

## Done means
Four phones each secretly fill their own private blank blind; the host assembles the sentence, shows its perplexity vs the line, phones vote; exactly one Plant exists and the correct win/lose outcome resolves.
