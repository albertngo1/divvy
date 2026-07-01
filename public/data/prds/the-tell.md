## Overview
The Tell is a browser party game: 4–8 humans and one hidden AI join a text lobby, chat through prompts, then vote out who they think is the bot. Its twist over generic 'find the AI' games comes from the HN steganography story — the AI's messages carry a subtle, *learnable* tell (a statistical fingerprint), so mastery is about training your eye, not just vibes. Among Us for the LLM era. For friend groups, streamers, and AI-curious players.

## Problem
'Human or not' novelty games are one-note: guess once, done. There's no skill curve and no reason to replay. The Tell adds a concrete, discoverable signal players can get *better* at reading round over round — turning a gimmick into a game with depth, and quietly teaching people what machine text actually looks like.

## How it works
Each round: a prompt appears ('describe your worst haircut'). Everyone including the bot answers in a shared chat. Two discussion rounds of free chat follow, then a vote. If humans vote out the bot, humans win; if the bot survives, it wins. The tell: the bot is instructed (system prompt) to obey a hidden constraint — e.g., subtly over-index on a target sentence rhythm or lexical pattern — configurable per difficulty. On Easy the tell is loud; on Hard it's faint. A post-round 'reveal' highlights the bot's messages and, optionally, points at the tell so players calibrate for next round.

## Technical approach
Stack: SvelteKit or Next + WebSocket server (Node/`ws`) for lobbies; Redis or in-memory for room state. The AI player calls the Claude API (claude-haiku-4-5 for latency/cost) with a system prompt encoding persona + the hidden tell constraint + anti-detection guidance tuned per difficulty. Message timing is jittered so response latency doesn't trivially out the bot. Data model: `Room{players[], botSeat, round, phase}`, `Message{seat, text, ts}`, `Vote{from, target}`. Hard part: prompt-engineering an AI that's beatable-but-not-obvious across difficulties, and designing tells that are real signals yet not so mechanical the bot reads as broken. Moderation: profanity filter + rate limits since it's open chat.

## v1 scope
- Lobby of up to 6, one bot seat, 3 rounds then vote
- One difficulty with a single documented tell
- Claude Haiku bot with latency jitter
- Reveal screen showing bot messages

## Out of scope
- Multiple bots / multiple impostors
- Persistent accounts, ranking, cosmetics
- Voice, native apps
- Custom prompt packs (ship one deck)

## Risks & unknowns
- Bot too easy or too hard to spot — needs heavy playtest tuning
- API latency/cost under many concurrent rooms
- Griefing/toxic chat in open lobbies
- Players may collude out-of-band

## Done means
A 5-human lobby plays 3 full rounds, the bot participates seamlessly with human-like latency, and across sessions players' bot-detection accuracy measurably improves once they learn the tell (win rate rises round over round).
