# ---------------------------------------------------------------------------
# apigateway.tf
# HTTP API (API Gateway v2) fronting the single Lambda.
#
# Exactly two routes are defined:
#   POST /chat          -> chatbot (Lambda -> Bedrock -> DynamoDB)
#   GET  /admin/chats   -> admin-only chat history read (Lambda -> DynamoDB)
#
# No $default route, no /{proxy+}, no generic catch-all.
#
# Authentication is intentionally NOT implemented (the frontend guards the
# admin page). The design leaves a clean seam: to add auth later, create an
# `aws_apigatewayv2_authorizer` (JWT/Cognito or a Lambda authorizer) and set
# `authorizer_id` + `authorization_type` on the /admin/chats route below.
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_api" "http" {
  name          = local.http_api_name
  description   = "HTTP API for ${local.name_prefix} backend."
  protocol_type = "HTTP"

  # CORS is handled at the API layer so browser preflight (OPTIONS) succeeds
  # even though the app is served via CloudFront on the same domain.
  cors_configuration {
    allow_origins  = local.cors_allowed_origins
    allow_methods  = ["GET", "POST", "OPTIONS"]
    allow_headers  = ["content-type", "authorization"]
    expose_headers = ["content-type"]
    max_age        = 3600
  }
}

# --- Lambda integration (shared by both routes) ----------------------------
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# --- Routes -----------------------------------------------------------------
resource "aws_apigatewayv2_route" "post_chat" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /chat"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get_admin_chats" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /admin/chats"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  # To require auth later, uncomment and wire up an authorizer resource:
  #   authorization_type = "JWT"
  #   authorizer_id      = aws_apigatewayv2_authorizer.admin.id
}

# --- Stage ------------------------------------------------------------------
# Auto-deploy default stage. Access logging can be attached later if desired.
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 100
  }
}

# --- Lambda invoke permissions ---------------------------------------------
# One permission per route so API Gateway may invoke the function. Source ARNs
# are scoped to the exact method+path.
resource "aws_lambda_permission" "post_chat" {
  statement_id  = "AllowInvokeFromApiGwPostChat"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/POST/chat"
}

resource "aws_lambda_permission" "get_admin_chats" {
  statement_id  = "AllowInvokeFromApiGwGetAdminChats"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/GET/admin/chats"
}
