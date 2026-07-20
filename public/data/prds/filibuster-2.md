## Overview
A self-hostable service that answers your spam/scam calls with a stalling AI voice persona, transcribes the call, and scores it — then ranks you and your friends on a shared leaderboard of cumulative minutes stolen back from scammers. Turns a purely passive annoyance (robocalls) into a competitive sport.

## Problem
Everyone passively eats scam calls; the only 'win' available is hanging up. Scambaiting is satisfying but requires you to personally waste your own time. Meanwhile realtime voice-agent infra (livekit/agents, trending) and tiny on-device ASR (Moonshine) are now cheap enough that a bot can do the baiting — and the wasted-scammer-time metric is inherently gamifiable.

## How it works
1. You set your carrier to conditionally forward suspected-spam calls (or forward manually) to a Filibuster number.
2. A voice agent picks up as a plausible confused mark ('Oh, the warranty? Let me find my glasses...') and stalls: asks clarifying questions, mishears, wanders off-topic, never quite gives info.
3. Call ends; Filibuster logs duration, a transcript, and a highlight clip.
4. A friends leaderboard ranks players by total minutes wasted this week, longest single call, and 'best line' voted from clips.

## Technical approach
Stack: LiveKit Agents for the realtime pipeline (SIP inbound via a Twilio/Telnyx trunk → STT → LLM → TTS). STT: Moonshine/Whisper streaming; LLM: a small fast model with a stall-optimized system prompt and a persona bank; TTS: a low-latency voice. Data model: `call(id, user_id, started, ended, duration, transcript, persona)`, `user`, weekly `leaderboard` view. Key trick: a latency-tuned 'keep them talking' policy — inject hesitations, ask for repeats, and detect the scammer's hang-up intent to escalate stalling. Hard parts: keeping round-trip latency low enough to feel human, and NOT engaging real callers (a whitelist + an early 'press 1 if this is a real person' human-passthrough gate).

## v1 scope
- One forwarding number, one persona, manual call forwarding.
- Duration + transcript logging, personal running total.
- A single shared leaderboard among an invite group.

## Out of scope
- Automatic spam classification / carrier integration.
- Voting/highlight-clip UI (just store the audio).
- Multi-persona marketplace.

## Risks & unknowns
- Legal: two-party-consent recording laws vary by state — may need to disclose or drop recording, keep only duration.
- Ethics of tying up phone lines; avoid enabling harassment of real numbers (strict inbound-only, no outbound dialing).
- Telephony cost per minute could make long calls expensive.

## Done means
A forwarded scam call is answered by the agent, kept on the line for over three minutes with coherent-sounding stalling, logged with duration + transcript, and the caller's minutes appear on the leaderboard for two test users.
