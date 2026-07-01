## Problem
The front-page story is that Claude Code hides marks in text you can't see — steganography is suddenly a household anxiety. But hidden-in-plain-sight signaling is also a perfect, untapped game mechanic: everyone reads the SAME words, yet one of you is secretly transmitting.

## What it is
A lightweight web room (4–8 players). Each round one 'smuggler' is dealt a secret word and must post normal-looking chat messages; the app silently laces their prose with zero-width characters encoding the word. Everyone sees identical rendered text. 'Detectives' get one tool: a 'decoder lens' they can spend a limited number of times per game to reveal the hidden bits of ONE message. Smuggler wins if the word lands before they're caught; crowd wins by fingering the marked messages. It's Werewolf where the tell is literally invisible until you look — a playable dramatization of the HN headline.

## v1 (humiliatingly small)
One shared page, no accounts. A text box that encodes a chosen word into zero-width joiners/non-joiners appended to whatever you type, and a 'reveal' button that decodes any pasted message. Two browser tabs = smuggler + detective. Prove the hidden channel works end to end before adding rooms or scoring.

## Done means
Two people on two devices can pass a secret word through visually-identical messages, and the detective can catch it exactly once per game using the lens — the bluff-vs-reveal tension is real.
