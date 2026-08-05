# ---------------------------------------------------------------------------
# cloudfront.tf
# CloudFront wiring for the API origin.
#
# IMPORTANT — why this file does not `aws_cloudfront_distribution { ... }`:
#   The frontend distribution ALREADY EXISTS and is provided by ID. Managing it
#   in Terraform would require `terraform import`, which this project explicitly
#   must not do (importing risks Terraform recreating/clobbering the live
#   frontend behaviors). Instead this file:
#
#     1. References the existing distribution read-only (data source) so its
#        domain/ARN are available for outputs and sanity checks.
#     2. Creates the REUSABLE, side-effect-free CloudFront policies the API
#        behaviors need (a disabled cache policy + an all-viewer origin request
#        policy). These are new global resources; they touch nothing existing.
#     3. Publishes, via locals + outputs, the EXACT origin and ordered cache
#        behaviors an operator (or a later, import-based Terraform change) must
#        attach to the existing distribution.
#
#   CloudFront is global, so all resources here use the us-east-1 provider alias.
# ---------------------------------------------------------------------------

# --- Existing distribution (read-only reference) ---------------------------
data "aws_cloudfront_distribution" "existing" {
  provider = aws.us_east_1
  id       = var.cloudfront_distribution_id
}

# --- API origin host (API Gateway v2 default endpoint host, no scheme) ------
# Derived from the HTTP API's api_endpoint, e.g.
#   https://abc123.execute-api.us-east-1.amazonaws.com  ->  abc123.execute-api...
locals {
  api_origin_domain_name = replace(aws_apigatewayv2_api.http.api_endpoint, "https://", "")
  api_origin_id          = "${local.name_prefix}-http-api-origin"
}

# --- Cache policy: caching fully disabled for dynamic API responses --------
resource "aws_cloudfront_cache_policy" "api_no_cache" {
  provider    = aws.us_east_1
  name        = "${local.name_prefix}-api-no-cache"
  comment     = "Disable caching for API responses (dynamic Lambda output)."
  default_ttl = 0
  min_ttl     = 0
  max_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    # NOTE: Accept-Encoding gzip/brotli normalization is invalid on a
    # caching-disabled policy (all TTLs = 0); CloudFront rejects it. Omitted
    # (defaults to false). Compression is still enabled per-behavior via
    # `compress = true` on the API cache behaviors.
  }
}

# --- Origin request policy: forward what the API needs ---------------------
# API Gateway (HTTP API) rejects requests whose Host header is not its own
# execute-api domain (403 ForbiddenException). CloudFront only sets Host to the
# origin domain when the origin request policy does NOT forward the viewer Host.
# A CUSTOM policy cannot express "all viewer headers EXCEPT Host" (its
# `allViewer`/`allViewerAndWhitelistCloudFront` behaviors both include Host), so
# we use the AWS-managed "AllViewerExceptHostHeader" policy — the canonical and
# AWS-recommended choice for API Gateway / Lambda-URL origins behind CloudFront.
data "aws_cloudfront_origin_request_policy" "api_all_viewer" {
  provider = aws.us_east_1
  name     = "Managed-AllViewerExceptHostHeader"
}

# ---------------------------------------------------------------------------
# Recommended distribution changes, expressed as data for outputs.
#
# Apply these to the EXISTING distribution (var.cloudfront_distribution_id) via
# the AWS console, CLI, or a future import-based Terraform module. The existing
# frontend origin and its default behavior must be left UNTOUCHED.
#
# Path patterns "/chat" and "/admin/*" are more specific than the default
# behavior, so they take precedence for API traffic only.
# ---------------------------------------------------------------------------
locals {
  cloudfront_api_origin = {
    origin_id            = local.api_origin_id
    domain_name          = local.api_origin_domain_name
    origin_protocol      = "https-only" # CloudFront -> origin is always HTTPS
    origin_ssl_protocols = ["TLSv1.2"]
  }

  # Recommended viewer certificate for the existing distribution. Swapping the
  # scanned RSA-2048 leaf (112-bit, quantum-weak) for this free ECDSA P-256 cert
  # (128-bit) is the sole crypto remediation the CBOM scan calls for; TLS 1.3 and
  # the X25519MLKEM768 post-quantum hybrid key exchange are already in place.
  # Pinning TLSv1.2_2021 drops legacy ciphers and enables AES-256-GCM suites.
  cloudfront_viewer_certificate = {
    acm_certificate_arn      = aws_acm_certificate.viewer.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  cloudfront_api_behaviors = [
    {
      path_pattern             = "/chat"
      target_origin_id         = local.api_origin_id
      viewer_protocol_policy   = "https-only" # viewers must use HTTPS
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD"]
      cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.api_all_viewer.id
      compress                 = true
    },
    {
      path_pattern             = "/admin/*"
      target_origin_id         = local.api_origin_id
      viewer_protocol_policy   = "https-only"
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD"]
      cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.api_all_viewer.id
      compress                 = true
    },
  ]
}
