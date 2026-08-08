## Overview

**Never Happened** is a cooperative 20-minute party game for 4–6 people that ends with a printed one-page "document" of an event the group never experienced: a fake trip, a fake dinner, a fake band they were all in. There is no winner. The keepsake is the document, and the group's shared goal is that a hostile interviewer cannot find the contradiction inside it — even though the app guarantees at least two contradictions exist, and every player is personally required to plant one.

## Problem

Collaborative-fiction party games sag because there is no pressure and no failure state, so the story stays generic. Deduction games have pressure but produce nothing you keep. The itch: give a co-writing game a real adversary, and let the group's survival — not a score — be the thing that makes the printed page worth keeping.

## How it works

1. TV shows a seed premise: *"The four of you spent one night in a town none of you can find on a map."* Plus five blank slots: **the reason we went, the meal, the argument, what we took home, why we never talk about it.**
2. Each phone privately receives a **mandate** — one concrete detail you must get into the record: *"It was raining the whole time."* *"There were exactly three of us."* *"We paid in cash."* Mandates are drawn so at least two directly conflict. You never learn whose mandate conflicts with yours, or that yours is even one of the conflicting pair.
3. **Drafting (6 min).** Players fill slots from their phones, one sentence at a time, into a shared document that renders live on the TV. Authorship is never shown — on the TV or anywhere. Your phone shows your mandate, a private "mandate satisfied" self-check, and your draft box.
4. **The Interview (8 min).** An LLM interviewer reads the document and asks follow-up questions — but each question goes to exactly **one phone, privately**, with a 45-second answer timer. The rest of the room sees only the TV: a name, a spinning cursor, and then the answer appearing verbatim in the transcript. There is no chance to coordinate before answering, and once your answer is on the TV the room must retroactively make it true. Four to six questions total, and the interviewer follows threads: it will circle back on whatever it found soft.
5. **The Verdict.** The interviewer names the single detail it believes is fabricated and explains why. If it names something no mandate covers, the group survived. Either way the TV prints the finished document — story, transcript, verdict — and the mandates are revealed last, as a footer.
6. Everyone downloads the same PDF. Nobody keeps a score.

Private per phone: your mandate, your draft-in-progress, your interview question and its timer. Shared: the document, the transcript, the verdict.

## Technical approach

Host tab + phone PWAs + an authoritative Durable Object per room; the DO is the only thing holding mandates and the only thing that calls the model, so a phone cannot read another phone's mandate or pre-fetch its own question. Data model: `Room {phase, premise, slots[], transcript[]}`, `Player {id, name, mandateId, satisfiedSelf}`, `MandateDeck {pairs: [[a,b], ...]}` where a pair is a designed contradiction, `Interview {targetPlayerId, question, deadlineTs, answer}`.

Sync: the document is CRDT-free by construction — one sentence per slot, submissions are server-ordered appends, last write per slot wins with an explicit lock while someone is typing (`slotLock {slotId, playerId, expiresAt}`), which avoids real merge conflicts in a five-person room.

The genuinely hard part is **the interview loop's latency and targeting**. The DO calls Claude with the full document plus the transcript so far, asking for one question and one target player; that round-trip is 2–6 seconds of dead TV. Mitigation: stream the question token-by-token to the TV as suspense theatre while the target's phone receives it complete, and pre-warm the *next* question during the current 45-second answer window, discarding it if the answer invalidates it. Second hard part: keeping the interviewer from being either omniscient (it instantly names the planted contradiction and the round is over in 40 seconds) or toothless. v1 handles this by never telling the model that mandates exist — it only sees what the room wrote.

## v1 scope

- One premise, hard-coded. Five slots. Four players.
- One mandate deck of 8 details containing exactly two designed conflict pairs.
- Four interview questions, round-robin across players, no adaptive targeting.
- Verdict = one model call: "name the fabricated detail and why."
- Keepsake = a print-stylesheet page the host tab renders; `Cmd-P` to PDF. No storage, no accounts.

## Out of scope

Multiple premises, adaptive question targeting, difficulty tuning, voice answers, image generation for the "document," any scoring or win/loss tracking, rounds beyond one.

## Risks & unknowns

- The interviewer may be trivially good at this, ending the game instantly. Needs a live calibration pass; the fallback is capping it to questions about *stated* details only.
- Typing five sentences on a phone under a timer is real friction; if drafting drags, cut to three slots.
- Model cost and latency on a home connection — 6 calls a game is fine, but a stalled call must degrade to a canned question rather than freeze the TV.
- The output may simply be boring prose. The mandate conflicts are the engine; if they are too subtle the document reads like autocomplete.

## Done means

Four phones join, each shows a different mandate that never appears on the TV, the room fills five slots into one document, the interviewer asks four questions that each land on exactly one phone with the other three seeing only the answer after it is submitted, a verdict is rendered naming a specific detail, and the host tab prints a single page containing story, transcript, verdict, and the revealed mandates that all four players want to keep.
