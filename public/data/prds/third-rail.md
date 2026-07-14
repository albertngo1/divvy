## Overview
Third Rail is a 2v2 phone-native riff on the board game *Trapwords*. One player describes a secret word to their teammate out loud — but the opposing team has secretly buried "trap words" in the field, and stepping on any one of them ends the turn. It's for 4+ people who like the shouty, sweaty tension of Taboo but want the forbidden list chosen adversarially by the people rooting against them.

## Problem
Taboo's taboo words are printed on the card — the describer knows exactly what to dodge, so the skill is just vocabulary gymnastics. The itch: what if you had to navigate a minefield you *can't see*, planted by opponents who know exactly how you think? That asymmetry — one team blind, one team holding the map — only works if the map stays private.

## How it works
Team A is on offense. The server picks a target word (e.g. VOLCANO). It appears **privately on the describer's phone only**; the guesser's phone shows a blank "listen and guess" screen.

Before describing starts, **Team B (defense) gets 30 seconds** to each privately type trap words they bet the describer will use ("lava," "erupt," "mountain," "hot"). These render **only on Team B's phones** and the server; the pooled set (dedup'd, capped at 3) is invisible to Team A the entire round.

The describer then talks freely, avoiding the invisible traps, while the guesser shouts guesses. Team B are live judges: when they hear a planted word, any defender **taps it on their phone** → server confirms → host TV detonates a big red "TRAPPED!" and the turn ends in failure. If the guesser lands the word before a trap trips, offense scores.

Per-phone privacy is the whole game: the trap set must be simultaneously **hidden from offense, live on defense, and authored blind** (defenders don't see each other's picks until lock). Pass one phone around and either offense sees the mines or defense can't buzz — the fun evaporates.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room {players[], teams{A,B}, phase, targetWord, traps:[{word, byPlayerId, tripped}], guessed:bool}`. Phases: `lobby → trap-set (defense input only) → describe (live) → resolve`. `targetWord` is pushed only to the describer's socket; `traps` only to defense sockets. Sync is turn-gated, not tight real-time — the buzz is a human tap, so no speech recognition needed in v1. Genuinely hard part: **leak-proofing** — the server must never broadcast `targetWord` or `traps` to the wrong team, and trap-matching (if auto-detected later) needs stemming/fuzzy matching to be fair.

## v1 scope
- Exactly 4 players (2v2), fixed teams
- One target word, one round
- Defense submits up to 3 traps total, deduped
- Manual defender tap to trip a trap (no audio detection)
- First correct guess wins; first trap tripped loses

## Out of scope
- Automatic speech-based trap detection
- Multi-round matches, scoring across turns, lives/health
- Trap-word dictionaries, synonym auto-expansion
- More than two teams

## Risks & unknowns
- Honesty: does a defender always buzz truthfully and instantly? Social pressure may help, but disputes happen.
- Trap authoring blind vs. shared: blind is cleaner but may produce weak traps with only 2 defenders.
- Describer accidentally seeing traps via a peeked phone breaks everything — UI must make the target/trap screens visually obvious per-role.

## Done means
Four phones join a room; the describer's phone shows VOLCANO and the guesser's does not; both defense phones privately collect three trap words the offense never sees; when the describer says a trap word and a defender taps it, the host TV flips to "TRAPPED!" and the round ends — all within one round, no page reloads, no leaked secrets.
