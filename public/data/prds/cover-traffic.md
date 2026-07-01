## Overview
Cover Traffic is an online party game (3–8 players) built entirely around steganography. Two **Agents** secretly share a codebook and must transmit a target phrase to each other using only the game's ordinary chat and moves. One **Eavesdropper** watches everything and tries to detect *that a hidden channel exists* and decode it. Everyone else is innocent cover traffic. For people who liked Spyfall/Codenames but want the thrill of an actual covert channel.

## Problem
Steganography is having a moment (marking AI requests, hidden watermarks) but it's abstract — you read about hidden channels, you never *sweat* one. Existing hidden-role games hide *who you are*; none make you hide *a message in plain sight* under active surveillance. Cover Traffic makes the felt experience of covert communication — the tension of encoding without looking like you're encoding — into a game.

## How it works
Each round, Agents get a random target phrase and a shared **codebook** (e.g. "first letter of your message = next word of the phrase," or "emoji color = digit," or "reaction timing = Morse"). Everyone plays a simple shared minigame with a public chat/action log — say, a co-op tile-placing board — so there's constant innocent traffic to hide inside. Agents weave the phrase into their normal-looking messages/moves. At round end, each Agent guesses the phrase (must both succeed to score) and the Eavesdropper accuses a channel + attempts a decode. Scoring rewards Agents for *undetected* success and rewards the Eavesdropper for correct detection — so obvious encodings win the message but lose the round. Innocents just play and muddy the signal.

## Technical approach
Node + WebSocket server (Socket.IO), React client, in-memory room state (no DB for v1). Codebooks are declarative JSON schemes: `{channel: 'first-letter'|'emoji-hue'|'msg-timing', encode/decode rules}`, so new covert channels are data, not code. Server relays all chat/moves verbatim (it must NOT know the secret — the codebook is delivered only to Agents) and runs the shared minigame state machine. Scoring is computed at reveal from the phrase guesses + Eavesdropper accusation. The genuinely hard part is **game balance**: tuning how much cover traffic and how many codebook bits make the channel *winnably hideable but detectable* — too easy to hide and the Eavesdropper never wins; too little bandwidth and Agents can't transmit in one round. Needs a bits-per-round budget per codebook.

## v1 scope
- Rooms + roles (2 Agents, 1 Eavesdropper, rest innocent), WebSocket chat log
- Two codebooks: 'first-letter' and 'emoji-hue'
- One trivial shared minigame for cover traffic
- Reveal + scoring screen

## Out of scope
- Matchmaking, accounts, timing/Morse channels, mobile, voice
- Anti-cheat against out-of-band coordination

## Risks & unknowns
- Balance is the whole game and can only be found by playtesting
- Players may coordinate out-of-band (Discord) — mitigated by fresh per-round codebooks
- Onboarding: teaching "encode without looking like it" fast enough to be fun

## Done means
Three humans in a room complete a round where the two Agents both correctly recover a 3-word phrase via the 'first-letter' codebook, the Eavesdropper's decode attempt is scored, and the reveal screen shows who transmitted what and awards points per the undetected-success rule.
