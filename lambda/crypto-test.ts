import { generateKeyPairSync } from 'node:crypto'

/**
 * QShield cryptographic remediation test fixture.
 *
 * WHY THIS EXISTS
 * ---------------
 * This file deliberately contains an RSA-2048 key-generation routine so that
 * QShield's static scanner has a genuine, quantum-vulnerable cryptographic
 * implementation to detect, classify, and propose a remediation for.
 *
 * WHY RSA-2048 IS QUANTUM-VULNERABLE
 * ----------------------------------
 * RSA's security rests on the hardness of integer factorization. A
 * sufficiently large, fault-tolerant quantum computer running Shor's
 * algorithm factors the modulus in polynomial time, breaking the key.
 * RSA-2048 remains classically adequate (~112-bit security) but is not
 * quantum-safe. Note: RSA key generation alone does not reveal whether the
 * key is intended for encryption or signing — a correct remediation must
 * determine the intended use before choosing a quantum-safe replacement
 * (e.g. ML-KEM for key establishment, ML-DSA/SLH-DSA for signatures).
 *
 * ISOLATION / SAFETY
 * ------------------
 * - This function MUST NOT be invoked by production code.
 * - It MUST NOT be imported by any Lambda entry point (index.ts) or the
 *   frontend. The production Lambda bundle is built with
 *   `esbuild index.ts --bundle`, which only includes modules reachable from
 *   index.ts; since nothing imports this file, it is excluded from the
 *   deployed artifact automatically.
 * - It generates keys only in memory and never persists them.
 *
 * This fixture is for QShield validation only and should be removed once
 * testing is complete (see the removal note at the bottom of this file).
 */
export function generateLegacyKeyPair() {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })
}

/*
 * TO REMOVE AFTER TESTING: delete this file (lambda/crypto-test.ts). It has no
 * importers, so no other code needs to change.
 */
