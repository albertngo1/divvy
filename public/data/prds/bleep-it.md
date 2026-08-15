## Overview

A four-player, 100-second cooperative panic game for a living room with a TV and no headphones. The TV is a compromised PA system that insists on reading your crew's classified briefing aloud. Six words in it are radioactive. You cannot edit the script and you cannot mute the speaker — you can only be louder than it, at exactly the right instant.

## Problem

Every voice party game treats room noise as the error signal: crosstalk garbles you, coughs cost you, shouting is punished. Almost none make noise the *instrument*. Separately, the whole Spaceteam lineage pays a heavy tax for speech recognition — it breaks on accents, on background noise, on iOS. This game needs only two facts: how loud the room was, and exactly when. That is a far sturdier primitive, and it happens to produce the funniest 400 milliseconds in party gaming.

## How it works

The host plays a pre-rendered voiceover: *"Delivery for the Chancellor — the package is inside the REACTOR housing, north dock, oh-four-hundred."* The host knows each redacted word's on/off time to the millisecond. A redacted word is scored HEARD (bad) unless the live room level exceeds the expected playback level by ≥8 dB across ≥80% of that word's window.

Private on phones:

- **One Prompter.** Their phone — and only theirs — shows the script scrolled six seconds ahead, redactions highlighted, with a countdown to the next one. No one else sees a single word of text.
- **Three Jammers.** Each phone shows a JAM pad, a private charge meter, and a private *jam duration* printed on the pad (0.4s / 0.9s / 1.5s, dealt secretly). Hold past your duration and you overheat: locked out for six seconds.

Because durations differ and are private, the Prompter must pick who fires and when, out loud — while forbidden to say a redacted word themselves (saying it leaks it: instant fault). So cueing sounds like *"Ben — the one right after 'housing' — go on my three."* Jammers answer back with what they've got left.

Shared TV: the VO waveform scrolling right-to-left, redactions as black bars, a fault counter, and a verdict stamp after each — BURIED or HEARD.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit or a Durable Object). Model: `Room { scriptId, tStart, redactions[{wordIdx, tOn, tOff, expectedDb}], faults, phones[{id, role, jamMs, cooldownUntil}] }`. The host owns the clock; phones sync with NTP-style offset (median of nine round-trips — ±15 ms is ample against an 80 ms decision granularity).

The host tab runs one AudioWorklet over `getUserMedia`, computing 20 ms A-weighted RMS. Since the host both plays the VO and hears it, the expected level per frame comes straight from the rendered buffer; masking is measured minus expected. The genuinely hard part is that browsers helpfully delete exactly the sound we are measuring: `echoCancellation: false, autoGainControl: false, noiseSuppression: false` are mandatory, and we still need a three-second silence calibration at round start plus per-redaction renormalisation to survive AGC drift and wildly different TV volumes.

Jam pads are advisory: the host scores acoustic reality. A pad press only arms the visual and starts the private cooldown, so a dropped packet costs a UI beat, never a false verdict.

## v1 scope

- 4 players, exactly one 100-second script, 6 redacted words
- One Prompter, three Jammers, no rotation
- Binary verdict per word; three HEARD ends the run
- Four-letter room code, no accounts, no lobby art

## Out of scope

Speech recognition, role rotation, multi-round campaigns, custom or user-written scripts, jam varieties, score beyond win/lose, iOS Safari if mic constraints fight us.

## Risks & unknowns

Browser AEC may make masking undetectable on some devices. Laptop mics clip and compress. A room that simply screams non-stop is the obvious exploit — mitigated because sustained noise raises the calibrated baseline, which raises the bar, so screaming stops working within seconds.

## Done means

Four phones join by code; the VO plays; when the room yells over word 3 the TV stamps BURIED within 300 ms of the word ending, and when they fumble word 4 it stamps HEARD; three misses ends the round; the Prompter uttering a redacted word faults instantly.
