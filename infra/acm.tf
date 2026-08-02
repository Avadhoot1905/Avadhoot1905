# ---------------------------------------------------------------------------
# acm.tf
# Quantum-readiness / crypto-hygiene remediation for the viewer TLS certificate.
#
# WHY THIS FILE EXISTS
#   A TLS/CBOM scan of the live edge (avadhootgm.in:443) found the leaf
#   certificate is RSA-2048, issued by "Amazon RSA 2048 M01". RSA-2048 carries a
#   classical security level of only 112 bits — below the modern 128-bit floor —
#   and is fully quantum-vulnerable. The rest of the handshake is already sound
#   (TLS 1.3, X25519MLKEM768 post-quantum hybrid key exchange), so the ONLY weak
#   link is the certificate's key.
#
#   This file provisions a replacement ECDSA P-256 certificate:
#     - EC P-256 gives a 128-bit classical security level (closes the 112->128
#       gap the scan flagged) with a smaller, faster handshake.
#     - ACM public certificates are FREE — both RSA and ECDSA. There is ZERO
#       recurring cost; this keeps the deployment comfortably under budget.
#
# WHY IT DOES NOT ATTACH THE CERT TO CLOUDFRONT
#   Consistent with cloudfront.tf: the existing distribution is referenced
#   read-only and must never be imported/clobbered. Creating an ACM certificate
#   is completely side-effect-free — it touches nothing live and costs nothing.
#   The cert ARN and the recommended viewer-certificate settings (SNI +
#   minimum_protocol_version = TLSv1.2_2021) are published via outputs for an
#   operator to attach to the existing distribution out of band — exactly how
#   the API origin and behaviors are handled.
#
#   CloudFront certificates are global and must live in us-east-1, hence the
#   aws.us_east_1 provider alias.
# ---------------------------------------------------------------------------

# --- ECDSA P-256 viewer certificate (free ACM public cert) ------------------
resource "aws_acm_certificate" "viewer" {
  provider = aws.us_east_1

  domain_name               = var.frontend_domain
  subject_alternative_names = ["www.${var.frontend_domain}"]

  # EC_prime256v1 == NIST P-256 == 128-bit classical security, replacing the
  # scanned RSA-2048 leaf (112-bit). RSA_2048 remains selectable for rollback.
  key_algorithm = var.certificate_key_algorithm

  # DNS validation is free and renews automatically; add the CNAME records
  # emitted by the acm_certificate_validation_records output to your DNS zone.
  validation_method = "DNS"

  # Never leave the edge without a usable cert during a re-issue/rotation.
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-viewer-ecdsa-p256"
  }
}
