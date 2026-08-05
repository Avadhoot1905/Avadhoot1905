# ---------------------------------------------------------------------------
# variables.tf
# All configurable inputs for the backend infrastructure.
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for regional resources (Lambda, DynamoDB, API Gateway, logs)."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Short project identifier used to name and tag resources."
  type        = string
  default     = "avadhoot1905"
}

# ---------------------------------------------------------------------------
# Existing frontend infrastructure (referenced, never recreated).
# ---------------------------------------------------------------------------

variable "cloudfront_distribution_id" {
  description = "ID of the EXISTING CloudFront distribution that serves the frontend."
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the EXISTING S3 bucket backing the frontend origin. Referenced for outputs/documentation only."
  type        = string
}

variable "frontend_domain" {
  description = "Primary frontend domain (e.g. example.com). Used to configure CORS on the HTTP API."
  type        = string
}

# ---------------------------------------------------------------------------
# Lambda tuning.
# ---------------------------------------------------------------------------

variable "lambda_memory" {
  description = "Memory (MB) allocated to the Lambda function."
  type        = number
  default     = 512

  validation {
    condition     = var.lambda_memory >= 128 && var.lambda_memory <= 10240
    error_message = "lambda_memory must be between 128 and 10240 MB."
  }
}

variable "lambda_timeout" {
  description = "Lambda execution timeout in seconds."
  type        = number
  default     = 30

  validation {
    condition     = var.lambda_timeout >= 1 && var.lambda_timeout <= 900
    error_message = "lambda_timeout must be between 1 and 900 seconds."
  }
}

variable "lambda_runtime" {
  description = "Lambda runtime identifier for the (future) function implementation."
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_handler" {
  description = "Lambda handler entrypoint for the (future) function implementation."
  type        = string
  default     = "index.handler"
}

# ---------------------------------------------------------------------------
# Viewer TLS certificate (crypto-hygiene remediation).
# ---------------------------------------------------------------------------

variable "certificate_key_algorithm" {
  description = <<-EOT
    Key algorithm for the ACM viewer certificate. Defaults to ECDSA P-256
    (EC_prime256v1) which delivers 128-bit classical security, replacing the
    scanned RSA-2048 leaf (112-bit, quantum-weak). ACM public certificates are
    free regardless of algorithm, so this has no cost impact. RSA_2048 is kept
    selectable only for rollback/compatibility.
  EOT
  type        = string
  default     = "EC_prime256v1"

  validation {
    condition     = contains(["EC_prime256v1", "EC_secp384r1", "RSA_2048"], var.certificate_key_algorithm)
    error_message = "certificate_key_algorithm must be one of: EC_prime256v1, EC_secp384r1, RSA_2048."
  }
}

# ---------------------------------------------------------------------------
# Bedrock.
# ---------------------------------------------------------------------------

variable "bedrock_model_id" {
  description = "Underlying Bedrock FOUNDATION MODEL id (Nova Lite). Used ONLY to scope IAM InvokeModel permissions (grants both foundation-model/<id> and inference-profile/*<id>). Keep this as the bare foundation-model id."
  type        = string
  default     = "amazon.nova-lite-v1:0"
}

variable "bedrock_inference_profile_id" {
  description = <<-EOT
    Bedrock model/inference-profile id the Lambda actually invokes at RUNTIME
    (BEDROCK_MODEL_ID env var). In ap-south-1 (and most regions) Nova Lite has no
    on-demand throughput on the bare foundation-model id, so a cross-region
    inference profile is required — e.g. "apac.amazon.nova-lite-v1:0" (APAC),
    "us.amazon.nova-lite-v1:0" (US). IAM is scoped separately via
    bedrock_model_id so this value carries no permission risk. Set it back to the
    bare foundation-model id only in regions where on-demand is supported.
  EOT
  type        = string
  default     = "apac.amazon.nova-lite-v1:0"
}

# ---------------------------------------------------------------------------
# Admin endpoint.
# ---------------------------------------------------------------------------

variable "admin_secret" {
  description = "Shared secret checked against the x-admin-secret header on GET /admin/chats. Consumed by the Lambda as ADMIN_SECRET. Set via terraform.tfvars (gitignored)."
  type        = string
  sensitive   = true
  default     = ""
}

# ---------------------------------------------------------------------------
# Tagging.
# ---------------------------------------------------------------------------

variable "tags" {
  description = "Additional tags merged onto every resource."
  type        = map(string)
  default     = {}
}
