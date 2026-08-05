# ---------------------------------------------------------------------------
# outputs.tf
# ---------------------------------------------------------------------------

output "lambda_function_name" {
  description = "Name of the backend Lambda function (deploy real code to this)."
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "ARN of the backend Lambda function."
  value       = aws_lambda_function.api.arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role."
  value       = aws_iam_role.lambda.arn
}

output "dynamodb_table_name" {
  description = "Name of the chat history DynamoDB table."
  value       = aws_dynamodb_table.chat_history.name
}

output "dynamodb_table_arn" {
  description = "ARN of the chat history DynamoDB table."
  value       = aws_dynamodb_table.chat_history.arn
}

output "http_api_id" {
  description = "ID of the HTTP API (API Gateway v2)."
  value       = aws_apigatewayv2_api.http.id
}

output "http_api_endpoint" {
  description = "Invoke URL of the HTTP API default stage."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "log_group_name" {
  description = "CloudWatch log group for the Lambda function."
  value       = aws_cloudwatch_log_group.lambda.name
}

# --- CloudFront integration guidance ---------------------------------------
# These outputs describe the changes to apply to the EXISTING distribution.
# Nothing here modifies the live distribution.

output "cloudfront_api_origin_domain_name" {
  description = "Origin domain name to add to the existing CloudFront distribution for API traffic."
  value       = local.api_origin_domain_name
}

output "cloudfront_api_origin" {
  description = "Full API origin spec to attach to the existing CloudFront distribution."
  value       = local.cloudfront_api_origin
}

output "cloudfront_api_behaviors" {
  description = "Ordered cache behaviors (/chat and /admin/*) to attach to the existing CloudFront distribution."
  value       = local.cloudfront_api_behaviors
}

output "cloudfront_cache_policy_id" {
  description = "ID of the caching-disabled policy to use on the API behaviors."
  value       = aws_cloudfront_cache_policy.api_no_cache.id
}

output "cloudfront_origin_request_policy_id" {
  description = "ID of the origin request policy to use on the API behaviors."
  value       = data.aws_cloudfront_origin_request_policy.api_all_viewer.id
}

output "existing_cloudfront_domain_name" {
  description = "Domain name of the existing (referenced) CloudFront distribution."
  value       = data.aws_cloudfront_distribution.existing.domain_name
}

# --- Viewer TLS certificate remediation (ECDSA P-256, free ACM cert) --------
# The CBOM scan flagged the live RSA-2048 leaf (112-bit). These outputs give an
# operator everything needed to validate and attach the replacement cert to the
# existing distribution out of band — nothing here modifies the live edge.

output "acm_viewer_certificate_arn" {
  description = "ARN of the ECDSA P-256 viewer certificate to set on the existing CloudFront distribution."
  value       = aws_acm_certificate.viewer.arn
}

output "acm_certificate_validation_records" {
  description = "DNS CNAME records to create for ACM validation (free, auto-renewing)."
  value = [
    for o in aws_acm_certificate.viewer.domain_validation_options : {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  ]
}

output "cloudfront_viewer_certificate" {
  description = "viewer_certificate block (SNI + TLSv1.2_2021) to apply to the existing distribution once the ACM cert is validated."
  value       = local.cloudfront_viewer_certificate
}
