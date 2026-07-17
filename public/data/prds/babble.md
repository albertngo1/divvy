## Overview
Babble is a 4-player cocktail-party-effect game for a shared TV plus four phones. Everyone talks at once — on purpose — and each player must filter one specific voice out of the din to catch a hidden word. It's for groups who love the Spaceteam roar but want the *listening* to be the skill.

## Problem
Every voice party game so far has been about NOT overlapping — one mic, don't step on each other, shout in turn. That's the collision-avoidance itch, done to death. Babble scratches the opposite one: the human superpower of selectively attending to a single speaker in a crowd. Nobody has built a party game around the cocktail-party effect, and it only works if everyone is genuinely talking simultaneously.

## How it works
Host screen (shared): four player colors, a 20-second countdown ring, and a live "din meter" that fills as the room gets loud. No secret info ever appears here.

Each phone shows PRIVATELY three things: (1) YOUR CHANT — a punchy 2-3 word phrase to repeat aloud, nonstop, for the whole mingle window; (2) YOUR MARK — the color of exactly one other player; (3) YOUR CATCH — a category, e.g. "Blue's chant hides one FRUIT — tap it when you hear it," plus four tappable options.

Chants are engineered so each contains exactly one word matching some listener's category, and marks form a permutation (a cycle) so everyone is watched by exactly one person. On GO, all four chant at once → a wall of overlapping sound. You must lock onto your mark's voice, catch their qualifying word, and tap the right option before time runs out. Coordination is physical and verbal: lean toward your mark, beg them (mid-chant) to say it louder — but they're busy being someone else's mark too.

Per-phone is load-bearing: your chant AND your mark differ per phone, and one shared phone literally cannot chant and listen at once. The real channel is the room's acoustics, not the network.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, phase, players[]}; Player{id, color, chant, markId, category, options[], answerId, caughtCorrectly}. Round content is a pre-generated chant-SET: four phrases where each holds exactly one unambiguous category word plus three plausible decoys. Sync is trivial by design — the server only pushes phase transitions (lobby → mingle(20s) → reveal) and collects taps; NO audio ever hits the network. That's the trick that makes it shippable. The genuinely hard part is authoring: chant sets that are catchy and repeatable, contain exactly one clean category word, and are tuned so filtering four simultaneous talkers is hard-but-doable.

## v1 scope
- Exactly 4 players, one 20-second round.
- Hand-written pool of ~6 chant-sets, no live generation.
- Tap-to-answer from 4 options; host reveals who caught their mark.

## Out of scope
- Variable player counts; LLM-generated chants; streaks/leaderboards; any server-side audio capture or DSP.

## Risks & unknowns
- Room acoustics: echoey or too-quiet rooms break the effect.
- Players may not commit to chanting continuously.
- Four talkers might be trivially easy or impossible — needs playtest tuning.
- Poor accessibility for hard-of-hearing players.

## Done means
Four phones join, each shows a distinct chant + mark, the host runs a 20s simultaneous-chant window, every player taps one answer, and the host reveals who correctly caught their mark's word — with catching demonstrably nontrivial in playtest (not a free point for everyone).
