## Overview
Haystack inverts VeraCrypt. Instead of hiding one real secret inside a couple of plausible decoys, it floods a drive or folder with thousands of statistically realistic fake encrypted containers — fake wallets, diaries, keyfiles, `tax_2019_FINAL.kdbx` — so an adversary who images your disk cannot tell which container (if any) holds anything real. Maximum plausible deniability by burying the needle in identical needles.

## Problem
VeraCrypt's hidden-volume deniability has a known weakness: there are usually only one or two decoys, and forensic analysts know the pattern. Under coercion ("give us the second password") a single decoy is unconvincing. The stronger position is a field where every container is equally suspicious and equally deniable — but hand-crafting convincing fakes at scale is impossible for a human.

## How it works
Point Haystack at a directory and choose a density. It generates N encrypted blobs whose sizes, timestamps, entropy profiles, and filenames follow a learned distribution of "real secret" files. Each blob is genuinely AES-encrypted under a random throwaway key that is immediately discarded, so a decoy is indistinguishable from a real encrypted store — because it *is* real ciphertext, just of random plaintext. You may optionally hide 0, 1, or several genuine volumes among them; even you can no longer prove how many exist. The manifest of real keys lives only in your head or on a hardware token.

## Technical approach
Rust CLI. Filenames are drawn from a Markov model trained on a curated corpus of plausible secret-file names (`wallet.dat`, `seed.txt`, `passwords.kdbx`, `journal_2021.gpg`). Sizes are sampled from a fitted log-normal distribution; mtimes are jittered across a realistic span. Each decoy is random bytes encrypted with AES-256-GCM under an ephemeral key that's zeroized after write, so ciphertext is high-entropy and structurally identical to a real archive. Optional real volumes use age/rage or a genuine VeraCrypt container so tooling signatures match. The hard part is anti-forensics realism: avoiding tells (uniform entropy variance, suspiciously regular sizes, filesystem allocation patterns) that would let an analyst cluster real-vs-decoy. I'll validate with a Kolmogorov–Smirnov test that decoys are indistinguishable from a labeled real sample.

## v1 scope
- CLI: `haystack seed ./dir --count 2000 --profile wallets`
- Markov filename generator + log-normal size sampler
- AES-256-GCM decoy blobs with discarded ephemeral keys
- KS-test report proving decoys match the target distribution

## Out of scope
- GUI, cloud sync, mounting real volumes
- Steganographic hiding inside media files
- Legal advice — this is a research toy, decoys only

## Risks & unknowns
- Real forensic tooling may cluster on tells I haven't modeled.
- "Deniability" is a legal/threat-model claim I cannot fully guarantee.
- Abuse potential — enforce decoys-only, never generate illicit content.

## Done means
Running the tool produces a directory that an external analyst (or a classifier script) cannot statistically separate into real vs fake with better than coin-flip accuracy on a blind test.
