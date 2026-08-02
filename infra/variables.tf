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
# Bedrock.
# ---------------------------------------------------------------------------

variable "bedrock_model_id" {
  description = "Amazon Bedrock model identifier (Nova Lite). Used to scope IAM InvokeModel permissions."
  type        = string
  default     = "amazon.nova-lite-v1:0"
}

# ---------------------------------------------------------------------------
# Tagging.
# ---------------------------------------------------------------------------

variable "tags" {
  description = "Additional tags merged onto every resource."
  type        = map(string)
  default     = {}
}
