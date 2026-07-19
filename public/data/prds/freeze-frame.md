## Overview
A physical hidden-role game for 3-6 people in a room with a TV. Everyone becomes a living statue: on each beat the host counts down and all players simultaneously strike a pose their phone privately dictates. One player — the *Understudy* — holds a pose-card identical to everyone else's except on one secret beat, and they don't know it. The group hunts the single frame where one statue broke formation.

## Problem
Hidden-role games (Werewolf, Mafia) are all talk and no body, and the imposter usually guards a clean secret they can simply avoid mentioning. The itch: a *physical, wordless* tell that even the imposter can't fully control, plus the paranoia of not knowing whether **you** are the odd one — because your card looks exactly as legitimate as everyone else's.

## How it works
- 3-6 players, one 5-beat routine.
- Each phone privately shows a single pose per beat from a shared vocabulary (HANDS UP, CROUCH, POINT LEFT, LOOK BACK, ARMS CROSSED, KNEEL) as one big icon.
- The host TV drives tempo: "Beat 1 — 3, 2, 1, FREEZE." On FREEZE everyone strikes their current pose and holds ~3s while the room looks around. Then beat 2, and so on.
- All honest players share the *identical* 5-pose card. The Understudy's card matches on 4 beats and differs on exactly 1 secret beat. Because poses commit simultaneously from a private card, nobody can pre-copy — you reveal blind at the same instant as everyone else.
- On the divergent beat the Understudy is the single odd statue. They can't prepare (they don't know which beat is theirs), and once they notice the room disagree, *overcorrecting* on the next beat can make them odd again by copying a pose the room isn't doing.
- **Phone (private):** only your own current pose icon + a small hold timer. **Shared TV:** beat counter, countdown, then the accusation phase.
- Accusation: each phone privately taps who was the Understudy and on which beat. TV reveals votes plus the true divergent beat with the two pose-cards side by side.

## Technical approach
- Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).
- Data model: `Room{code, players[], routine: Pose[5], understudyId, secretBeat}`. Each client's personalized card = `routine` with `routine[secretBeat]` swapped only for the Understudy.
- Sync: the server runs a beat clock and broadcasts `BEAT_START{n, freezeAt: serverTs}`. Clients render the countdown against `serverTs` using a one-time clock-offset handshake on join, so all phones FREEZE within ~100ms. No per-frame streaming — just one scheduled timestamp per beat.
- Genuinely hard part: not graphics but *fair simultaneity + no card leakage*. Poses must be delivered just-in-time (reveal beat n's icon only at `BEAT_START`) so nobody can screenshot the whole routine and compare cards ahead of time.

## v1 scope
- 3-4 players, exactly one round, one 5-beat routine.
- Fixed vocabulary of 6 pose icons.
- One Understudy, one server-chosen divergent beat.
- Human observation only; single accusation vote; reveal screen.

## Out of scope
- Motion-sensor auto-detection of poses.
- Multiple imposters, multi-round matches, cross-game scoring.
- Custom poses, music, animation.

## Risks & unknowns
- Copying: quick players may glance and mirror a neighbor before freezing — the just-in-time reveal + hard countdown mitigates but doesn't fully eliminate.
- A single divergent beat may be too obvious or too easy to miss depending on pose distinctiveness; needs playtest tuning of the vocabulary.
- Clock drift across cheap phones threatening simultaneity fairness.

## Done means
Four phones join via code; on FREEZE all four show a pose within ~150ms of each other; exactly one phone's secret-beat icon differs; players physically strike poses; the accusation screen correctly reveals the Understudy and the divergent beat with both cards shown side by side.
