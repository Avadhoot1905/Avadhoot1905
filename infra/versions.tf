# ---------------------------------------------------------------------------
# versions.tf
# Pin Terraform core and provider versions for reproducible deployments.
# ---------------------------------------------------------------------------

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    # Used only to build the placeholder Lambda deployment package locally.
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}
