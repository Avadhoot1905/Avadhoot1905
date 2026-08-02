# ---------------------------------------------------------------------------
# locals.tf
# Derived values and naming conventions used throughout the project.
# ---------------------------------------------------------------------------

locals {
  # Canonical name prefix, e.g. "avadhoot1905-prod".
  name_prefix = "${var.project_name}-${var.environment}"

  # Concrete resource names derived from the prefix.
  lambda_function_name = "${local.name_prefix}-api"
  dynamodb_table_name  = "chat_history"
  log_group_name       = "/aws/lambda/${local.name_prefix}-api"
  http_api_name        = "${local.name_prefix}-http-api"

  # Allowed CORS origins for the HTTP API. Both the apex and www subdomain are
  # permitted so the frontend works regardless of which host the browser uses.
  cors_allowed_origins = [
    "https://${var.frontend_domain}",
    "https://www.${var.frontend_domain}",
  ]

  # Tags applied to every resource via provider default_tags, merged with any
  # caller-supplied tags.
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Component   = "backend"
    },
    var.tags,
  )
}
