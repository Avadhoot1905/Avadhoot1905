import { createECDH } from 'node:crypto'

/**
 * QShield cryptographic remediation test fixture.
 *
 * WHY THIS EXISTS
 * ---------------
 * This file deliberately performs a classical elliptic-curve Diffie-Hellman
 * (ECDH) key exchange so that QShield's scanner has a genuine, quantum-
 * vulnerable key-establishment operation with explicit cryptographic intent
 * to detect, classify, and (if supported) auto-remediate.
 *
 * WHAT THIS IS
 * ------------
 * This is KEY ESTABLISHMENT (key agreement) — not signing, encryption, or
 * certificate authentication. Two parties each generate an ephemeral P-256
 * (prime256v1) key pair and derive a shared secret from the other party's
 * public key.
 *
 * WHY IT IS QUANTUM-VULNERABLE
 * ----------------------------
 * ECDH on prime256v1 rests on the hardness of the elliptic-curve discrete
 * logarithm problem. A sufficiently large, fault-tolerant quantum computer
 * running Shor's algorithm solves ECDLP in polynomial time and recovers the
 * private key / shared secret. This is a property of elliptic-curve DH in
 * general: migrating to a different classical curve (e.g. X25519) does NOT
 * make it quantum-safe. A genuine post-quantum migration for key
 * establishment generally uses ML-KEM (FIPS 203) or a hybrid scheme
 * (e.g. X25519MLKEM768). Note that ML-KEM is a key-encapsulation mechanism,
 * not a drop-in replacement for the createECDH API — a correct automated fix
 * must account for the different API and message flow (encapsulate/
 * decapsulate rather than symmetric computeSecret on both sides).
 *
 * ISOLATION / SAFETY
 * ------------------
 * - This function MUST NOT be invoked by production code.
 * - It MUST NOT be imported by any Lambda entry point (index.ts) or the
 *   frontend. The production Lambda bundle is built with
 *   `esbuild index.ts --bundle`, which only includes modules reachable from
 *   index.ts; since nothing imports this file, it is excluded from the
 *   deployed artifact automatically.
 * - Keys and the derived secret exist only in memory for the duration of the
 *   call and are never persisted.
 *
 * This fixture is for QShield validation only and should be removed once
 * testing is complete (see the removal note at the bottom of this file).
 */
export function performLegacyKeyExchange() {
  const alice = createECDH('prime256v1')
  const bob = createECDH('prime256v1')

  alice.generateKeys()
  bob.generateKeys()

  const aliceSecret = alice.computeSecret(bob.getPublicKey())
  const bobSecret = bob.computeSecret(alice.getPublicKey())

  if (!aliceSecret.equals(bobSecret)) {
    throw new Error('Key exchange failed: derived secrets do not match')
  }

  return aliceSecret
}

/*
 * TO REMOVE AFTER TESTING: delete this file (lambda/crypto-test.ts). It has no
 * importers, so no other code needs to change.
 */
