## Overview
Cover Track is a menubar app (and drum-machine toy) that defends against acoustic keylogging — the real attack where a mic recording of your keyboard is used to reconstruct what you typed. It takes a toy, the Skred-style drum/synth construction kit trending on Lobsters, and makes it dangerously useful: every keystroke triggers a percussive hit, so your captured audio carries a beat instead of a fingerprint.

## Problem
Acoustic side-channel papers (and the security awesome-lists making the rounds) show that per-key sound differences leak passwords over Zoom, phone mics, even smart speakers. Nobody wants to run a noisy fan or type slower. But a masking sound that is *correlated* with your typing (and pleasant) can bury the discriminative signal while sounding intentional.

## How it works
The app listens to global keydown/keyup timing (not key identity for logging — see below) and, on each press, fires a drum voice whose timing exactly overlaps the physical click, with randomized velocity, pitch, and voice so identical keys never sound identical. A steady low-level groove (kick/hihat pattern) runs underneath so silence between bursts doesn't reveal word boundaries. You get a 4-track step sequencer to design your 'cover kit' — it's genuinely a fun toy — while a Threat meter estimates masking quality (SNR of key-transient vs. masking energy in the 1–8 kHz band where key differences live). A 'panic groove' hotkey ramps density while typing passwords.

## Technical approach
Swift + AVAudioEngine (macOS) or a Web Audio + Electron build; global key *timing* via CGEventTap with a strict rule that only press timestamps and a random voice index are used — key codes are never stored or mapped to sounds, so the app itself can't become a keylogger. Sample-accurate scheduling ties each hit to the event within a few ms. The hard part is masking efficacy: I model it after the published attacks (per-key mel-spectrogram + kNN/CNN), then run an offline evaluator that records self-typed audio with and without Cover Track and reports how much the classifier's accuracy drops. Kits ship as JSON; a small library of pre-tuned 'high-mask' kits (broadband transients) balances protection and listenability.

## v1 scope
- Menubar toggle, one broadband cover kit, underlying groove
- Per-key hit with randomized velocity/pitch/voice
- 4-step toy sequencer to tweak the kit
- Offline evaluator notebook showing classifier accuracy drop

## Out of scope
- Windows/Linux, mobile
- Actually intercepting/altering the mic stream (we add sound to the room, not the stream)
- Proving cryptographic guarantees

## Risks & unknowns
- Might annoy coworkers on calls; needs a 'push to protect' mode
- Masking might not generalize across mic/room; needs honest eval
- Global key tap triggers OS accessibility permission friction

## Done means
Against a reproduced published acoustic-keylogger on my own recordings, top-1 key-recovery accuracy drops from >50% to near chance with Cover Track on, and the demo kit is something I'd leave running because it sounds good.
