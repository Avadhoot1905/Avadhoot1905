# ---------------------------------------------------------------------------
# bedrock_apikey.tf
# Dedicated IAM user that backs the LONG-TERM Bedrock API key (bearer token).
#
# A long-term Bedrock API key is an IAM *service-specific credential* for
# `bedrock.amazonaws.com` attached to an IAM user. The Lambda authenticates to
# Bedrock with this key via the AWS_BEARER_TOKEN_BEDROCK env var (see lambda.tf)
# instead of SigV4-signing with its execution role.
#
# This file manages the user and its least-privilege policy. The credential
# itself (the secret key value) is minted out of band with the AWS CLI, because
# the pinned AWS provider (5.100.0) predates the Bedrock API-key attributes on
# `aws_iam_service_specific_credential`:
#
#   aws iam create-service-specific-credential \
#     --user-name <bedrock_api_key_user_name output> \
#     --service-name bedrock.amazonaws.com
#     # omit --credential-age-days for NO EXPIRY
#
# The returned ServiceApiKeyValue is stored in terraform.tfvars (var.bedrock_api_key,
# gitignored) and in lambda/.env, and injected into the Lambda by lambda.tf.
# ---------------------------------------------------------------------------

resource "aws_iam_user" "bedrock_api" {
  name = "${local.name_prefix}-bedrock-apikey"
  path = "/"

  tags = {
    Purpose = "bedrock-long-term-api-key"
  }
}

# Least privilege: only InvokeModel on Nova Lite (foundation model + its
# inference profiles), mirroring the Lambda execution role's Bedrock statement.
data "aws_iam_policy_document" "bedrock_api_user" {
  # Actual model invocation, scoped to Nova Lite (foundation model + profiles).
  statement {
    sid    = "BedrockInvokeModel"
    effect = "Allow"

    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream",
    ]

    resources = [
      "arn:${data.aws_partition.current.partition}:bedrock:*::foundation-model/${var.bedrock_model_id}",
      "arn:${data.aws_partition.current.partition}:bedrock:*:${data.aws_caller_identity.current.account_id}:inference-profile/*${var.bedrock_model_id}",
    ]
  }

  # Auth gate for bearer-token (API key) requests. Required in addition to
  # InvokeModel when authenticating via AWS_BEARER_TOKEN_BEDROCK; the request is
  # still authorized against the scoped InvokeModel statement above. Must be "*"
  # (mirrors the AmazonBedrockLimitedAccess managed policy).
  statement {
    sid       = "BedrockBearerTokenAuth"
    effect    = "Allow"
    actions   = ["bedrock:CallWithBearerToken"]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "bedrock_api_user" {
  name   = "${local.name_prefix}-bedrock-apikey-policy"
  user   = aws_iam_user.bedrock_api.name
  policy = data.aws_iam_policy_document.bedrock_api_user.json
}
