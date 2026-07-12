## Overview
Governor is a real-time competitive typing game for 3-6 players in one room. Each player writes a full sentence on their phone under a shrinking predictability budget enforced live by a tiny in-browser language model. The whole joke is that the game *forbids* originality: to survive, you must write the most clichéd, autopilot prose you can summon.

## Problem
Most LLM party games score you *after* you submit — you write blind, then the model judges. That kills the moment-to-moment tension. The itch here: make the model's surprisal a live, physical resistance you feel on every keystroke, like an engine governor cutting your throttle the instant you rev too high.

## How it works
The host TV shows a shared topic ("the weather," "my morning") and one big shared gauge: the **ceiling**, a perplexity limit that starts generous and *drops steadily* over ~60 seconds.

Each phone PRIVATELY shows: your own text field, and your own live **running-perplexity meter** as a needle riding just under (hopefully) the ceiling. As you type each word, transformers.js scores your sentence's running perplexity. If a word pushes you over the current ceiling, that word is rejected — it flashes red and won't commit; you must backspace and choose something duller ("delicious" spikes you; "nice" is safe). Nobody can see anyone else's text or meter.

Goal: be first to commit a grammatical sentence of ≥12 words that sits under the ceiling. Because the ceiling keeps dropping, late finishers get squeezed into monosyllabic mush. Host screen shows only each player's *word count* as a progress bar and a shared countdown — never their words, until the winner's sentence is revealed and read aloud.

## Technical approach
Host tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Model (distilgpt2 via transformers.js) runs **on each phone** so the live meter is instant with no round-trips. Server owns the canonical clock and ceiling schedule and broadcasts `ceiling(t)`; phones report only `{wordCount, committed}` upsync. Data model: `Room{topic, startTs, ceilingCurve}`, `Player{id, text(private), runningPpl}`. The genuinely hard part: keeping every phone's ceiling perfectly in sync so rejections feel fair — solved by server-timestamped ceiling curve + local interpolation, and by defining "over" against the ceiling value at commit time, not render time.

## v1 scope
- One topic, one 60-second round.
- 3-6 players; distilgpt2 running locally per phone.
- Reject-on-spike typing with a single dropping ceiling.
- Winner = first valid 12-word sentence; read aloud on host.

## Out of scope
- Multiple rounds / scoring across rounds.
- Grammaticality checking (honor system in v1).
- Model choice, difficulty tuning, spectator mode.

## Risks & unknowns
- On-device model load time on older phones (mitigate: preload during lobby).
- Perplexity jitter making rejections feel arbitrary — needs a smoothed threshold.
- "12 real words" gaming (spamming "the the") — may need a min-unique-word rule.

## Done means
Three phones join, all show a live meter that visibly resists spicy words, the shared ceiling drops in sync, and the first player to commit a legal 12-word sentence triggers a host-screen reveal — end to end, one room, no reloads.
