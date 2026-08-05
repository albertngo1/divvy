## Overview
A 4–7 player warm-blooded party game where the group co-authors one anonymous letter to a single person in the room. That person then tries to unmask the authors — but every guess, right or wrong, defaces the letter they're going to keep. For friend groups, going-away parties, birthdays, last nights of a trip. Ends with a PNG everyone screenshots.

## Problem
Group-written keepsakes (a signed card, a slam book) are sincere but boring to make: you write, you pass, nothing is at stake. Party games are exciting but disposable — nobody has ever kept a Quiplash score. Nothing makes sincerity risky, and risk is what makes sincerity land.

## How it works
One player is the **Addressee** (drawn at random). Everyone else is a **Writer**.

Each Writer's phone privately shows: (a) a distinct sincere prompt about the Addressee — "something you noticed about them this year", "advice you'd only give them", "the thing you'd say if you had to leave tomorrow"; (b) a **secret handicap** nobody else sees — "under seven words", "must contain a number", "no first-person pronouns", "start with a question". The handicap deforms your natural voice, which is the whole defense: sincerity leaks identity, constraint launders it.

The host screen shows the letter assembling in one uniform hand, line by line, in random order — no names, no timing cues, no "3 of 5 submitted" per-player state.

Then the **Cutting** phase. The Addressee's phone privately shows the full letter with tappable lines and a roster. They get three cuts: pick a line, pick a person. The server verifies; the host screen animates the result. Correct → the line is struck through in ink and that Writer is publicly identified (they lose). Wrong → a black redaction bar is stamped over the accused name, permanently, in the letter. Either way, the artifact takes damage. Three cuts is a real cost.

Surviving Writers are never revealed — not at the end, not ever. The host renders the final letter, scars included, and pushes the image to every phone.

## Technical approach
PartyKit Durable Object per room; host tab + phone PWAs over WebSocket. Data model: `Room{code, phase, addresseeId, players[]}`, `Line{id, authorId, text, promptId, handicapId, state: intact|struck|redacted, accusedName?}`. **Authorship never leaves the server** — the Addressee's client receives `{id, text}` only, and cuts are resolved server-side, so devtools can't win the game.

Sync: server-authoritative phase machine, full-state broadcast (state is tiny), per-socket filtering so each Writer sees only their own prompt+handicap.

The genuinely hard part is side-channel leakage: the host screen must never reflect what the Addressee is currently inspecting or hovering, and submission order must be shuffled and buffered (hold all lines until the last Writer submits, then reveal on a randomized cadence) or fast typists get identified by position. Second hard part: rendering the letter twice — live DOM on the host and an offscreen canvas export — pixel-consistently, including strikes and bars.

## v1 scope
- 5 players, one Addressee, one round, one letter
- 8 hardcoded prompts, 6 hardcoded handicaps
- Text-only lines, 140 char cap
- Exactly 3 cuts, no timer
- Export as canvas PNG, shown as a QR on the host screen

## Out of scope
Multiple rounds, rotating Addressee, handwriting fonts per player, voice notes, saved letter history, spectators, reconnect-after-refresh.

## Risks & unknowns
Sincerity may not survive a party context — the group may default to jokes, which makes attribution trivial and the keepsake worthless; handicaps may need to be stricter to force flat, anonymous diction. Three cuts may be too many (letter shredded) or too few (Addressee never engages). The Addressee is passive for 3 minutes during writing.

## Done means
Five phones join by room code; each shows a different prompt and handicap; five lines land on the host screen in shuffled order with no authorship visible anywhere in the network payloads to the Addressee's client; the Addressee makes three cuts; correct cuts strike lines and name authors on the host screen, wrong cuts stamp redaction bars; the final image, scars intact, downloads to all five phones.
