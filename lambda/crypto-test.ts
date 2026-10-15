import { connect, type TLSSocket } from 'node:tls'

/**
 * QShield automated remediation test fixture.
 *
 * WHY THIS EXISTS
 * ---------------
 * This file deliberately disables TLS certificate validation
 * (`rejectUnauthorized: false`) so that QShield's static scanner has a
 * genuine, supported vulnerability to detect and automatically remediate via
 * the TS-TLS-REJECT-UNAUTHORIZED rule (expected patch: flip the literal to
 * `rejectUnauthorized: true`).
 *
 * WHY IT IS INSECURE
 * ------------------
 * `rejectUnauthorized: false` tells the TLS client to accept any server
 * certificate — including self-signed, expired, or hostname-mismatched certs.
 * This removes authentication of the peer and exposes the connection to
 * man-in-the-middle attacks. The secure setting is `rejectUnauthorized: true`
 * (the Node.js default).
 *
 * ISOLATION / SAFETY
 * ------------------
 * - This function MUST NOT be invoked by production code. It is never called.
 * - It opens NO connection on its own — `connect()` only runs if something
 *   calls this function, which nothing does.
 * - It MUST NOT be imported by any Lambda entry point (index.ts) or the
 *   frontend. The production Lambda bundle is built with
 *   `esbuild index.ts --bundle`, which only includes modules reachable from
 *   index.ts; since nothing imports this file, it is excluded from the
 *   deployed artifact automatically.
 *
 * This fixture is for QShield validation only and should be removed once
 * testing is complete (see the removal note at the bottom of this file).
 */
export function createLegacyTLSConnection(
  host: string,
  port: number = 443,
): TLSSocket {
  return connect({
    host,
    port,
    servername: host,
    rejectUnauthorized: false,
  })
}

/*
 * TO REMOVE AFTER TESTING: delete this file (lambda/crypto-test.ts). It has no
 * importers, so no other code needs to change.
 */
