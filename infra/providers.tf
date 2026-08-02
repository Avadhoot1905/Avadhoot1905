# ---------------------------------------------------------------------------
# providers.tf
# Provider configuration.
#
# NOTE:
# - The primary provider targets the configurable `var.aws_region`. This is
#   where Lambda, DynamoDB, API Gateway, IAM, and CloudWatch Logs live.
# - A dedicated `us-east-1` alias is declared because CloudFront and any of its
#   associated resources are global and must be managed from us-east-1. It is
#   provided here so future CloudFront-adjacent resources (e.g. response headers
#   policies) can be added without restructuring the project.
# ---------------------------------------------------------------------------

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# CloudFront is a global service; its control-plane lives in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}
