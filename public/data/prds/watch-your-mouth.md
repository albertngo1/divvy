## Overview
A cutthroat describe-the-word game for 4 players and a host screen, riffing on Taboo/Trapwords but inverting who owns the forbidden list. In Trapwords the *opposing team* writes the traps and the whole team shares them. Here every listener privately plants one trap word aimed at one specific rival, so the forbidden list is different for every ear in the room and known to nobody but its author.

## Problem
Taboo's forbidden words are printed on the card: static, shared, and the describer can read them. Trapwords hides them, but they're still one shared list. Meanwhile at a real table there's no way to say "if he says *bird*, only Dana goes deaf" without everyone overhearing the setup. The itch is a per-listener minefield — which is trivially a phone problem and impossible as a card.

## How it works
**Setup (20s).** The Describer's phone privately shows the target word (`PENGUIN`). Every other phone privately shows a grid of 12 plausible clue words (`bird, ice, tuxedo, swim, cold, fish, waddle, black, Antarctic, zoo, fly, egg`) and asks two things: pick ONE word, and pick ONE rival to bury it under. Nobody sees anyone else's choice, ever.

**Round (75s).** The Describer talks out loud, freely. Their phone is a push-to-talk pad running on-device Web Speech ASR; recognized tokens stream to the server as text only — raw audio never leaves the phone. When a token matches a trap, only the *victim's* phone hard-buzzes and greys out: they are muted for the rest of the round and cannot guess. The TV shows only three anonymous lamps going from LISTENING to dark. No word, no author, no reason.

The Describer therefore watches the room die in silence and must guess *which* of their own words is toxic and to whom, steering vocabulary blind. First un-muted listener to type the target on their phone scores; the Describer scores with them. The trap author scores only if their trap fired **and** someone else still guessed right — so a greedy early trap that kills the round pays nothing. The reveal at the end is the whole payoff: TV prints "Dana buried *bird* under Ben. It fired at 0:11."

## Technical approach
Socket.IO server (or PartyKit DO) behind Tailscale Serve, authoritative. Model: `round{targetWord, describerId, traps: [{authorId, victimId, word, firedAt|null}], muted: Set, guesses}`. ASR runs client-side (`webkitSpeechRecognition`, interim results on); the phone emits `{tokens: [...], t}` at ~300ms cadence. Server normalizes (lowercase, stem, strip plurals), matches against traps, and emits `MUTED` to exactly one socket and an anonymized `LAMP_OFF{slot}` to the TV. Trap words are never sent to any client but their author until the reveal.

Hard part: matching fairly. Word-boundary and stemming mismatches ("birds", "birdlike") decide the round, so the trap list must be a fixed curated vocabulary with precomputed stem sets rather than free text. Second hard part: ASR latency (~400ms) means a listener can guess *after* saying-the-trap but *before* the mute lands — resolve by server-timestamping guesses against `firedAt` and rejecting late ones.

## v1 scope
- Exactly 4 players (1 Describer, 3 listeners), one round, 75 seconds.
- One hardcoded target word with a hand-curated 12-word trap grid.
- Mute = grey screen + vibrate. No un-mute, no partial credit.
- TV: timer, three anonymous lamps, end-of-round reveal list.

## Out of scope
Multiple rounds, describer rotation, scoreboards, custom decks, server-side ASR, spectators, mobile Safari fallbacks beyond "tap to type your guess."

## Risks & unknowns
Web Speech ASR quality on a noisy phone in a loud room is the make-or-break; fallback is a typed-clue variant that keeps the mechanic but kills the energy. The curated 12-word grid may make trap choice obvious (everyone picks `bird`), collapsing the bluff — mitigate by scoring trap *uniqueness*. Also: getting muted early is genuinely un-fun for 60 seconds, so the reveal must be worth the wait.

## Done means
Four phones, one TV, one spoken round. The Describer says a listener's trap word out loud; that phone alone vibrates and greys within 800ms, the TV's corresponding lamp goes dark with no label, the other two listeners keep playing unaffected, and the end-of-round reveal correctly attributes each trap to its author, victim, and fire time.
