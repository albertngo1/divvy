## Overview
Print the Key is a linguistic steganography tool plus a ~200KB ternary language model that is *the key*. Encoder turns ciphertext bits into innocuous prose; decoder recovers them by rerunning the identical model over the identical prefix. The model ships as a printable artifact — a page of QR codes, or a base32 block with Reed–Solomon parity — so the shared secret can be mailed, photographed, or memorized-by-photocopier, and will still decode identically in ten years on hardware that doesn't exist yet.

## Problem
Arithmetic-coding stego over a language model (Meteor, ADG, and friends) is beautiful on paper and fragile in practice for one boring reason: **it requires bit-identical probability distributions on both ends.** Float16 GPU kernels, a different BLAS, a PyTorch minor version, a fused-attention flag — any one of them shifts a logit by a ULP, the arithmetic decoder's interval splits differently, and the message doesn't degrade, it *vanishes* from that token onward. The published work sidesteps this by encoding and decoding in the same process. Nobody can actually use it. Also: your key is a 4GB checkpoint.

## How it works
1. Message → AES-256-CTR → uniform ciphertext bitstream.
2. Encoder runs the tiny model over a chosen prompt ("a letter home, 1890s"). At each step it takes the model's next-token PMF, quantizes it to a 16-bit integer PMF summing exactly to 65536, and uses it as the model for a range coder run *backwards*: consume bits from the ciphertext, emit the token those bits select.
3. Output is cover text. Send it however — email, postcard, forum post.
4. Decoder loads the same printed model, replays the same prompt, and reads each token's position back out as bits. Identical integer PMFs ⇒ identical intervals ⇒ exact recovery.

## Technical approach
Training in PyTorch: a 2M-parameter, 6-layer, d=192 transformer with BitNet-style ternary weights (per-channel int8 scales), trained on Project Gutenberg pre-1920 English so the cover register matches the paper-mail conceit. Tokenizer is a 4096-entry byte-level BPE shipped inside the artifact.

Inference is a single-file C implementation, no libm, no floats: int8 activations, int32 accumulators, integer-domain softmax via a 4096-entry exp LUT with fixed shift, then exact PMF renormalization to sum 65536 (the leftover mass is deterministically assigned to the argmax — that rule is part of the spec). Same C compiles to WASM for the web UI and to a CLI. A conformance suite hashes the PMF at every step of a fixed 512-token replay; x86-64, arm64, and WASM must produce identical digests or the build fails.

Artifact format: model + tokenizer + spec version, zstd'd, RS(255,223)-coded, split across ~90 QR codes at version 20 / ECC-M, laid out with sequence headers so a phone can scan them in any order.

The hard part is the entropy budget. A 2M model has maybe 1.2 bits/token of usable entropy after top-p truncation, so a 140-character message costs ~1,500 tokens of cover — a long letter. Push truncation looser and the text gets weird; tighter and the rate collapses. That tradeoff *is* the product.

## v1 scope
- One pretrained model, one prompt template ("letter home")
- Encode/decode 140 ASCII characters
- CLI only; QR export as a PDF
- Conformance digest test on two architectures

## Out of scope
- Deniability against a statistical detector; multiple registers/languages; key rotation; a GUI; anything about the transport channel.

## Risks & unknowns
Tiny-model cover text may be obviously machine-written to a human skim, which defeats the point even if it defeats a classifier. Integer softmax renormalization edge cases (ties at the 65536 boundary) need a spec that's actually unambiguous. Reading 90 QR codes is genuinely annoying — a printed base32 block with a phone-camera OCR path may beat it.

## Done means
Encode on a Mac, print the model, scan it on a Linux box that has never seen the checkpoint file, decode the emailed cover text, and get the original 140 bytes back byte-for-byte.
