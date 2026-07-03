## Overview
Carding is a drop-in age-assurance widget for small alcohol, vape, CBD, and adult-goods e-commerce stores. It proves a shopper is over the legal threshold using a zero-knowledge attestation — the merchant gets a signed yes/no, never a name, birthdate, or scanned ID.

## Problem
A wave of state and national age-verification laws now requires real 21+/18+ checks on regulated goods, with liability for the merchant. Small Shopify/WooCommerce shops have two bad options: a clumsy 'click here if you're 21' checkbox that fails legally, or an enterprise ID-scanning vendor that is expensive, kills conversion, and turns the tiny wine shop into a honeypot of scanned driver's licenses — exactly the kind of PII the new privacy rulings (and the current 'privacy emergency' mood) punish you for holding.

## How it works
1. Merchant installs the Carding app/snippet; it injects an age gate at checkout.
2. First time, the shopper verifies once through a Carding-integrated issuer (mobile driver's license / mDL, a bank KYC, or a one-time ID scan handled entirely by the issuer, not the store).
3. The issuer returns a ZK proof: 'holder is ≥ 21 as of today' — no DOB, no name.
4. Carding relays a signed boolean + proof reference to the store's order. The shopper gets a reusable local credential so repeat checkouts are one tap.
5. Merchant keeps only the boolean and proof hash as their compliance receipt.

## Technical approach
- Standards-first: consume EUDI-wallet / ISO 18013-5 mobile driver's licenses and emerging ZK age-proof schemes (the Google/industry zero-knowledge age-assurance work) rather than rolling our own crypto.
- Where a raw ID must be read, it's processed by a certified issuer/IDV partner; Carding never receives the document — we hold only the verifiable presentation.
- Verifier service (Rust/Go) validates the ZK presentation against issuer public keys; issues a short-lived signed attestation JWT to the store backend.
- Shopify App (embedded, App Bridge) + a generic JS snippet + webhook that stamps the order with `age_verified=true, proof=<hash>`.
- Data model: Attestation { merchantId, orderId, threshold, result, proofHash, issuer, ts }. No PII columns by design.
- Hard part: covering enough issuers that real shoppers can actually complete a proof, and the legal mapping from 'ZK proof' to 'defensible compliance record' per jurisdiction.

## v1 scope
- One issuer integration + one merchant platform (Shopify).
- Checkout gate that blocks completion until a valid 21+ proof.
- Per-order compliance receipt (boolean + proof hash) in the merchant dashboard.

## Out of scope
- Building our own identity issuance or KYC.
- Under-18 general web age-gating, parental consent flows.
- WooCommerce/Magento, multi-region legal certification.

## Risks & unknowns
- ZK age-proof ecosystems are early; real issuer/wallet coverage may be thin in the US in 2026.
- Whether regulators accept a ZK boolean as sufficient 'reasonable verification.'
- Conversion drag if the first-time proof flow is slow.

## Done means
A test shopper completes checkout on a demo Shopify store, is blocked when under-age and allowed when over-age, the store database contains only a boolean + proof hash (no DOB/name), and a second checkout reuses the credential in one tap.
