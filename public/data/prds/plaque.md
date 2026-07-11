## Overview
Plaque is a 3-5 player concurrent-room party game where everyone but one person collaborates to forge an absurdly official-sounding award citation for that one person — the honoree — who doesn't know they're the subject. The output is a rendered certificate the honoree keeps. For warm, wholesome groups (going-away parties, birthdays, roasts-with-love). No score.

## Problem
The itch: a low-effort way to make someone feel celebrated (and gently roasted) that produces a real artifact, without one person having to write the whole speech. Group toasts are lopsided — one confident person talks, everyone else nods. Plaque forces everyone to contribute exactly one line, blind.

## How it works
The host TV shows an ornate blank certificate: 'The Order of ____ hereby recognizes [HONOREE] for…'. The server secretly picks one player as honoree. Every OTHER phone PRIVATELY shows one fill-in slot with a template constraint — 'Slot 2: an achievement that never happened (start with "having")', 'Slot 4: a specific object', 'Slot 5: a solemn closing clause.' Each writer sees ONLY their own slot and prompt, never the others', so the assembled citation is exquisite-corpse nonsense.

The honoree's phone shows a DECOY task — 'rate these certificate border styles' — so they think they're a judge, not the subject, and don't realize the room is writing about them. This per-phone lie is the load-bearing trick: pass one phone around and the surprise collapses instantly.

When all writers submit, the server assembles the slots into the certificate on the TV, reads it aloud (TTS), fills in the honoree's name with a flourish, and renders a printable PNG. The honoree keeps it. Optional: rotate so everyone gets one.

## Technical approach
Stack: host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room { code, honoreeId, templateId, slots[] }`, `Slot { index, prompt, assignedPlayerId, text }`, `Player { id, name, role: 'writer'|'honoree' }`. Sync: server assigns slots round-robin to writers on start, pushes each writer only their slot, pushes the honoree the decoy view, collects `SUBMIT_SLOT` messages, and on completion broadcasts `ASSEMBLED` to the host with the ordered text. The hard part is mundane but real: keeping the honoree's client from ever learning it's the subject (all subject-identifying state stays server-side; the honoree's socket receives only decoy payloads) and rendering a clean certificate — server-side HTML-to-PNG (Satori/resvg) or a hidden host canvas exported via `toBlob()`.

## v1 scope
- 1 certificate template, 4 fixed slots
- 3-4 players, one honoree, one round
- Private per-slot writing + honoree decoy screen
- Assembled certificate on TV + downloadable PNG via QR

## Out of scope
- Multiple templates, custom borders, honoree rotation
- TTS voice options, animations
- Editing/redo of submitted slots
- Saving a gallery of past certificates

## Risks & unknowns
- The decoy must be convincing; a sharp honoree may guess from turn order or who's typing
- Blind slot-filling can produce duds if prompts are too open — needs tight constraints
- Certificate render fidelity across fonts/emoji in the PNG
- Small groups mean few clauses; may feel thin with 3 players

## Done means
Four phones join; one is silently made honoree and sees a fake 'judge' screen while the other three each fill one private slot; on submit the TV displays a single assembled certificate with the honoree's name, reads it aloud, and offers a working QR to download a printable PNG — and the honoree never saw the clauses being written.
