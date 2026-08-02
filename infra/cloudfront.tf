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
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# --- Origin request policy: forward what the API needs ---------------------
# Forwards all viewer headers EXCEPT Host (API Gateway must see its own host),
# plus all query strings. This is the AWS-recommended shape for API origins.
resource "aws_cloudfront_origin_request_policy" "api_all_viewer" {
  provider = aws.us_east_1
  name     = "${local.name_prefix}-api-all-viewer-except-host"
  comment  = "Forward viewer headers (except Host), all cookies and query strings to the API origin."

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allViewerAndWhitelistCloudFront"
    headers {
      items = ["CloudFront-Viewer-Country"]
    }
  }
  query_strings_config {
    query_string_behavior = "all"
  }
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
    origin_id           = local.api_origin_id
    domain_name         = local.api_origin_domain_name
    origin_protocol     = "https-only" # CloudFront -> origin is always HTTPS
    origin_ssl_protocols = ["TLSv1.2"]
  }

  cloudfront_api_behaviors = [
    {
      path_pattern             = "/chat"
      target_origin_id         = local.api_origin_id
      viewer_protocol_policy   = "https-only" # viewers must use HTTPS
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD"]
      cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
      origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id
      compress                 = true
    },
    {
      path_pattern             = "/admin/*"
      target_origin_id         = local.api_origin_id
      viewer_protocol_policy   = "https-only"
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD"]
      cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
      origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id
      compress                 = true
    },
  ]
}
