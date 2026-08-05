## Overview
A voice-driven party game for 4–6 people in one room with a TV and their phones. It takes Anomia's category-collision face-off and buries it inside an ordinary conversation: nobody sees the categories, and the trigger is something a person actually said out loud.

## Problem
Anomia's fun is the ambush — the sudden face-off you didn't see coming. But it's a table game: all the information is public on card faces, so the ambush is purely reflex. Meanwhile every "say the word" party game degenerates into stilted keyword-dropping because everyone knows the target space. There's no game where the *conversation itself* is the board and each player is playing a different, hidden objective inside it.

## How it works
Host screen (public): a mundane conversation prompt — "plan a surprise party for someone who hates surprises" — a 90-second timer, a live per-player score bar, and a mic-level indicator. It never shows the transcript.

Each phone (private): one secret BAIT category ("breakfast foods", "things with wheels", "European capitals") and a live HOT/COLD meter. You score +2 every time another player utters a word in your category. You score −3 if *you* say one. So you must steer without stepping — ask leading questions, set up someone else's sentence, bait them into finishing it.

The Anomia beat: when one spoken word matches two players' secret categories, both phones flash FACE-OFF and both players get 3 seconds to slap their screen; the faster one takes the pot, and both categories are revealed publicly and retired. Categories leak one at a time, and the endgame gets deliciously paranoid.

At the buzzer the host reveals every category and the specific quote that triggered each score.

## Technical approach
Host tab runs a single `webkitSpeechRecognition` continuous session on the laptop mic (one good recognizer beats N flaky phone mics). Interim + final transcript chunks stream to a PartyKit Durable Object over WebSocket.

Data model: `Room { promptId, phase, deadlineTs, players: [{id, name, categoryId, score, retired}] }`, `Category { id, label, lexicon: string[] }`, `Event { ts, token, speakerUnknown, matchedPlayerIds[] }`.

Matching happens **server-side**, not on phones: the DO lowercases + stems each final token, checks it against every live player's lexicon, and emits *targeted* messages — the scoring player gets `{+2, quote}`, everyone else gets nothing. Phones never receive the transcript, so devtools can't leak categories.

Hard part: latency and attribution. Chrome finalizes phrases ~500ms–2s late, so the face-off slap window must be anchored to the DO's clock, not phone clocks — server sends `faceOffOpensAt` and accepts slaps by server receipt time. We deliberately do NOT try to identify *who* spoke (diarization is out of reach); a self-trigger penalty relies on the honor system plus a phone-side "that was me" tap.

## v1 scope
- 4 players, one 90-second round, one hardcoded prompt
- 8 hand-written categories, ~40 words each, flat string matching
- Host-mic recognition only; Chrome desktop host required
- Face-off = both phones flash, first slap wins, no animation
- Final reveal screen with quotes; no persistence

## Out of scope
Phone-side mics, speaker diarization, LLM-generated categories, fuzzy/semantic matching, multi-round scoring, non-English.

## Risks & unknowns
Speech recognition may miss quiet or overlapping speakers — the whole game dies if the recall is bad. Category lexicons must be broad enough to hit but narrow enough to feel fair. Players may just shout wordlists instead of conversing; the −3 self-penalty and a "no lists" rule card may not be enough.

## Done means
Four phones join by QR code. During one 90-second recorded conversation, at least 6 legitimate score events fire within 2s of the spoken word, at least one FACE-OFF resolves to a single winner, and the reveal screen names each category with the exact quote that triggered it.
