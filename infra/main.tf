# ---------------------------------------------------------------------------
# main.tf
# Shared data sources and cross-cutting concerns.
#
# Resource definitions are split by concern into dedicated files:
#   - iam.tf         IAM role and least-privilege policies for Lambda
#   - lambda.tf      Lambda function + CloudWatch log group + placeholder package
#   - apigateway.tf  HTTP API (v2), routes, integration, permissions, CORS
#   - dynamodb.tf    chat_history table
#   - cloudfront.tf  API origin + behaviors attached to the EXISTING distribution
# ---------------------------------------------------------------------------

# Account / partition / region context, used to construct tightly-scoped ARNs.
data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_region" "current" {}
