# ---------------------------------------------------------------------------
# iam.tf
# Least-privilege execution role for the Lambda function.
#
# Grants ONLY:
#   - CloudWatch Logs (scoped to this function's log group)
#   - Bedrock InvokeModel (scoped to the Nova Lite model)
#   - DynamoDB read/write (scoped to the chat_history table + its indexes)
# ---------------------------------------------------------------------------

# Trust policy: allow the Lambda service to assume this role.
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    sid     = "LambdaAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.name_prefix}-lambda-role"
  description        = "Execution role for the ${local.lambda_function_name} Lambda function."
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# ---------------------------------------------------------------------------
# Permission policy (least privilege).
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_permissions" {
  # --- CloudWatch Logs -----------------------------------------------------
  # CreateLogGroup is intentionally omitted: the group is created by Terraform
  # (see lambda.tf), so the function only needs to write streams/events.
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "${aws_cloudwatch_log_group.lambda.arn}:*",
    ]
  }

  # --- Bedrock (Nova Lite) -------------------------------------------------
  # Scope InvokeModel to the specific foundation model. Both the foundation
  # model ARN and the inference-profile ARN forms are included because Nova
  # models are commonly invoked via inference profiles.
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

  # --- DynamoDB read/write -------------------------------------------------
  statement {
    sid    = "DynamoDBReadWrite"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:PutItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
    ]

    resources = [
      aws_dynamodb_table.chat_history.arn,
      "${aws_dynamodb_table.chat_history.arn}/index/*",
    ]
  }
}

resource "aws_iam_role_policy" "lambda_permissions" {
  name   = "${local.name_prefix}-lambda-policy"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_permissions.json
}
