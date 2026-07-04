## Overview
Perma-Death is a roguelike survivor mode dressed as a party game. Every player starts with 3 lives and a private stat sheet (BLUFF, TRIVIA, RHYTHM, WORD). Each round a prompt rolls a random stat and the app picks a live player to attempt it; failing costs a life. Dead players aren't out — they become hecklers with veto power over one live player's next turn per round. Runs until one survivor remains. The dead-player heckler seat means being knocked out early is arguably more fun than surviving.

## How it works
4-8 phones join a lobby. Each phone privately generates a stat sheet (four stats, values 1-10, rolled on join). Each round: the app rolls a random stat + a random live player, picks a mini-game from that stat's pool (BLUFF = a Two-Truths-One-Lie prompt, RHYTHM = tap-to-beat, TRIVIA = MC question, WORD = anagram). The chosen player's stat value determines difficulty (higher stat = harder challenge for more reward or safer margin). Fail = lose a life. When you hit 0, your phone flips into HECKLER mode: you now see the next live player's prompt in advance and can spend a per-round veto to force a re-roll on their challenge. Last survivor wins the run.

## Technical approach
Per-player state = `{ lives: 3, stats: {BLUFF, TRIVIA, RHYTHM, WORD}, mode: 'alive'|'dead' }`, all server-authoritative. Prompt roll is a two-step server pick: choose stat (weighted random), then choose a live player (round-robin with skips). Prompt bank is a static JSON per stat with ~30 items each. Spectator UI for dead players is a separate socket channel that receives an *advance copy* of the next live-player prompt plus a per-round VETO button; server enforces max-one-veto-per-heckler-per-round. Stat sheets are unicast at join and never broadcast; heckler prompt previews are unicast to dead players only.

## v1 scope
- 4 stats, 4 mini-games (one per stat)
- ~30 prompts per stat, hand-authored, no LLM
- Simple veto (dead player force-rerolls the next live-player prompt); no other heckler powers
- Session ends at 1 survivor, no persistent stats across sessions

## Out of scope
- Item drops, upgrades, roguelike run modifiers
- LLM-generated prompts, custom stat sheets
- Multiple heckler powers (mute, swap, curse) — save for v2
- Team survival mode, respawn tokens

## Risks & unknowns
- Elimination games historically feel bad for the person out first; the heckler seat is the mitigation but needs playtesting to confirm it lands
- Prompt bank of 120 items total may exhaust in 2-3 sessions
- Random stat roll may repeatedly target the same player unluckily — may need anti-streak weighting

## Done means
Six phones join a room and play a full run to one survivor, at least two eliminated players successfully use their veto power to force a re-roll on a live player's turn, and the final survivor screen displays correctly — verified against a scripted playthrough.
