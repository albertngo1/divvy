## Overview

A 4-player hidden-role word game where the imposter's private view is not different *content* — it is the same prompt screen with one extra strip along the bottom: a live, anonymized stream of the characters the other three players are typing right now, delayed 1.5s and truncated to the first five letters. Deletions show as they happen. The imposter is a keylogger with a social obligation.

## Problem

Hidden-role games are turn-based and talky; the fun arrives only at the vote. This puts the deduction *inside the typing*, in real time, and gives innocents an active weapon instead of a waiting posture: your own keystrokes are bait, and the keystroke log is the courtroom evidence.

## How it works

Three prompts, ~40 seconds each. TV shows the prompt ("An animal that would be bad at its job"). Every phone shows the same text field.

Goals are asymmetric and both are public knowledge:
- **Innocents** score for an answer nobody else wrote. Collisions cost both parties.
- **The imposter** scores for *colliding* — matching another player's submitted answer exactly, at least twice across three prompts.

So the imposter must read the feed and race to copy, but a copy that lands too fast or too central is a tell. Meanwhile innocents learn the counterplay within one round: type OTTER, watch the room, backspace it all, submit BADGER. If OTTER shows up on the TV under somebody's name, you have them.

TV shows, live, only anonymous *dots* — one per player, filling as their character count grows, emptying when they delete. Enough to feel the room hesitate, not enough to read a word. Answers reveal unattributed at the end of each prompt, then attributed.

After the third prompt, one simultaneous vote. The reveal replays every player's actual keystroke timeline side by side on the TV, scrubbing in real time — decoys, backspaces, and the imposter's 1.5s-late convergence, all visible. That replay is the payoff shot.

## Technical approach

PartyKit Durable Object per room; phone PWAs, host browser tab. Phones send `{t, op: 'ins'|'del', ch}` events, coalesced at 100ms. Server appends to a per-player keystroke log (the authoritative record), and pushes to the imposter socket only: `{slot, prefix}` where `prefix` is the first 5 chars of that player's buffer as of `now - 1500ms`, slots randomly permuted per prompt so the imposter can't stably map slot→person.

Data model: `{prompts[], buffers: {pid: string}, logs: {pid: Event[]}, submissions, imposterId, votes}`.

Hard part: the delayed feed must be a genuine replay of past buffer state, not a throttled live copy — the imposter has to see a decoy that has *already been deleted* on the real phone, or the bait mechanic dies. That means keeping a small ring buffer of buffer-states per player and serving the imposter from 1.5s back. Second hard part: fair, drift-free timelines across four phones for the replay — timestamp everything server-side on receipt, never trust phone clocks.

## v1 scope

- Exactly 4 players, 3 prompts, one round, no lobby
- 20 hardcoded prompts, one text field, no keyboard hints
- Imposter feed: fixed 1.5s delay, 5-char truncation, permuted slots
- Exact-string collision detection (case/space normalized only)
- One simultaneous vote + keystroke replay screen

## Out of scope

Variable delay, 5+ players, fuzzy answer matching, per-round scoring history, mobile keyboard autocorrect handling, spectators, rematch.

## Risks & unknowns

Phone autocorrect and swipe-typing may deliver whole words in one event, gutting the character-level feed; may need to force a plain input mode. The imposter's job might be trivially easy at 4 players — the delay and truncation are the tuning dials. And innocents may collide by pure coincidence on obvious prompts, producing false convictions; prompt authoring must reward weird answers.

## Done means

Four phones join by code; typing on any innocent phone appears on the imposter's phone 1.5s late and truncated to 5 characters, including a prefix that was already deleted locally; the TV shows anonymous fill dots that never leak letters; three prompts resolve to attributed answers; the vote screen replays all four keystroke timelines in sync from server timestamps.
