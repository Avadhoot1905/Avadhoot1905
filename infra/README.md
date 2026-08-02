# Backend Infrastructure (`/infra`)

Production-ready, low-cost, modular Terraform for the backend of this project.
The frontend (S3 + CloudFront + domain + DNS) **already exists** — this project
only adds the backend and describes how to wire it into the existing CloudFront
distribution.

> **This repository intentionally generates Terraform configuration only. No
> Terraform apply should be executed as part of this task.**

---

## Architecture

```
                      Internet
                          │
                  Existing Domain (DNS/ACM unchanged)
                          │
                  Existing CloudFront
                  ┌─────────────────┐
                  │                 │
       default    ▼                 ▼  /chat, /admin/*
             Existing S3      API Gateway (HTTP API v2)
             (frontend)             │
                                AWS Lambda  ── CloudWatch Logs
                                /        \
                               ▼          ▼
                       Bedrock Nova Lite   DynamoDB (chat_history)
```

- **CloudFront** keeps serving the frontend from its existing S3 origin. Two new
  behaviors (`/chat`, `/admin/*`) route API traffic to a new **API Gateway**
  origin. All existing behaviors are left untouched.
- **API Gateway (HTTP API v2)** exposes exactly two routes and forwards both to a
  single **Lambda**:
  - `POST /chat` — chatbot: Lambda → Bedrock Nova Lite → DynamoDB → response
  - `GET /admin/chats` — admin-only read of chat history from DynamoDB
- **Lambda** holds the (later-written) business logic. Terraform ships an inert
  placeholder package.
- **Bedrock Nova Lite** is reachable only via least-privilege IAM (`InvokeModel`).
- **DynamoDB** `chat_history` stores conversations (on-demand billing, PITR, TTL).

---

## Directory structure

```
infra/
├── README.md                    This file
├── versions.tf                  Terraform & provider version pins
├── providers.tf                 aws provider (+ us-east-1 alias for CloudFront)
├── variables.tf                 All input variables
├── locals.tf                    Naming conventions, CORS origins, common tags
├── main.tf                      Shared data sources (account/region/partition)
├── iam.tf                       Lambda role + least-privilege policy
├── lambda.tf                    Lambda function, log group, placeholder package
├── apigateway.tf                HTTP API v2: routes, integration, permissions, CORS
├── dynamodb.tf                  chat_history table
├── cloudfront.tf                API origin + behaviors for the EXISTING distribution
├── acm.tf                       Free ECDSA P-256 viewer cert (RSA-2048 remediation)
├── outputs.tf                   Outputs (incl. CloudFront wiring guidance)
├── terraform.tfvars.example     Example variable values
└── .gitignore                   Ignores state, tfvars, build artifacts
```

---

## Variables

| Variable                     | Type          | Default                   | Description                                                        |
| ---------------------------- | ------------- | ------------------------- | ------------------------------------------------------------------ |
| `aws_region`                 | `string`      | `us-east-1`               | Region for Lambda, DynamoDB, API Gateway, logs.                    |
| `environment`                | `string`      | `prod`                    | Deployment environment (dev/staging/prod).                        |
| `project_name`               | `string`      | `avadhoot1905`            | Project identifier used in names/tags.                            |
| `cloudfront_distribution_id` | `string`      | — (required)              | ID of the **existing** CloudFront distribution.                   |
| `s3_bucket_name`             | `string`      | — (required)              | Name of the **existing** frontend bucket (reference only).        |
| `frontend_domain`            | `string`      | — (required)              | Apex domain; drives CORS (`https://<domain>` + `www`).            |
| `lambda_memory`              | `number`      | `512`                     | Lambda memory (MB), 128–10240.                                    |
| `lambda_timeout`             | `number`      | `30`                      | Lambda timeout (s), 1–900.                                        |
| `lambda_runtime`             | `string`      | `nodejs20.x`              | Runtime for the future implementation.                            |
| `lambda_handler`             | `string`      | `index.handler`           | Handler for the future implementation.                            |
| `bedrock_model_id`           | `string`      | `amazon.nova-lite-v1:0`   | Model ID used to scope Bedrock IAM.                               |
| `certificate_key_algorithm`  | `string`      | `EC_prime256v1`           | Viewer cert key algorithm (ECDSA P-256; free). RSA-2048 remediation. |
| `tags`                       | `map(string)` | `{}`                      | Extra tags merged onto every resource.                           |

---

## How the infrastructure works

1. **IAM (`iam.tf`)** — Creates a Lambda execution role whose policy allows only:
   CloudWatch Logs (scoped to this function's log group), Bedrock `InvokeModel`
   (scoped to the Nova Lite model + inference profiles), and DynamoDB read/write
   (scoped to `chat_history` and its indexes).
2. **Lambda (`lambda.tf`)** — One function. A minimal placeholder ZIP is generated
   by Terraform so nothing binary is committed. `lifecycle.ignore_changes` on the
   package means a later real deployment (CI/CD or `aws lambda update-function-code`)
   is never reverted by `terraform apply`. Its log group has 14-day retention.
3. **API Gateway (`apigateway.tf`)** — An HTTP API (v2) with a single AWS_PROXY
   integration and exactly two routes (`POST /chat`, `GET /admin/chats`). No
   `$default` route and no `/{proxy+}`. CORS is configured for the frontend
   domain. Per-route `aws_lambda_permission` resources authorize invocation.
   Adding auth later is a two-line change on the `/admin/chats` route (see the
   commented authorizer seam in the file).
4. **DynamoDB (`dynamodb.tf`)** — `chat_history` with `chatId` (HASH) + `timestamp`
   (RANGE), `PAY_PER_REQUEST` billing, point-in-time recovery, and a TTL attribute
   (`expiresAt`) reserved for future use.
5. **CloudFront (`cloudfront.tf`)** — The existing distribution is **not** managed,
   recreated, or imported. Terraform references it read-only and creates the
   reusable policies the API behaviors need (a caching-**disabled** cache policy and
   an all-viewer-except-Host origin request policy). The exact origin + ordered
   behaviors (`/chat`, `/admin/*`, HTTPS-only, GET/POST/OPTIONS, caching disabled)
   are published as **outputs** to apply to the existing distribution.

6. **ACM (`acm.tf`)** — Provisions a **free** ECDSA P-256 (`EC_prime256v1`) public
   certificate for the apex + `www` domain. A TLS/CBOM scan of the live edge found
   the current leaf certificate is **RSA-2048** (112-bit classical security,
   quantum-vulnerable); ECDSA P-256 raises this to 128-bit at **zero cost** (ACM
   public certs are free for any algorithm). The rest of the handshake is already
   sound — TLS 1.3 with the `X25519MLKEM768` post-quantum hybrid key exchange — so
   the certificate key was the only weak link. The cert is **not** attached to the
   live distribution here (same no-import rule as CloudFront); its ARN, DNS
   validation records, and the recommended `viewer_certificate` block
   (`sni-only` + `minimum_protocol_version = TLSv1.2_2021`, which also enables
   AES-256-GCM suites) are published as outputs to apply out of band.

### Applying the crypto remediation

After `terraform plan`:
1. Add the CNAME records from `acm_certificate_validation_records` to the domain's
   DNS zone; ACM validates and auto-renews for free.
2. Once the cert shows `ISSUED`, set the existing distribution's viewer
   certificate to `acm_viewer_certificate_arn` using the settings in the
   `cloudfront_viewer_certificate` output. The frontend origin and all existing
   behaviors stay untouched.

### Applying the CloudFront behaviors

Because the live distribution must not be imported/clobbered, attach the API
origin and behaviors out of band. After `terraform plan`, the outputs
`cloudfront_api_origin`, `cloudfront_api_behaviors`, `cloudfront_cache_policy_id`,
and `cloudfront_origin_request_policy_id` give you everything needed to add them
via the AWS console/CLI (or a dedicated, import-based module) — leaving the
existing frontend origin and default behavior untouched.

---

## Deployment instructions

Prerequisites: Terraform >= 1.6, AWS provider 5.x, credentials for the target
account.

```bash
cd infra

# 1. Provide variable values
cp terraform.tfvars.example terraform.tfvars
#   then edit terraform.tfvars

# 2. Initialize providers and modules
terraform init

# 3. Review the planned changes
terraform plan
```

**Stop here.** Do **not** run `terraform apply`.

> **This repository intentionally generates Terraform configuration only. No
> Terraform apply should be executed as part of this task.**

---

## Cost profile

All chosen services are effectively pay-per-use with no idle cost: Lambda
(per-invocation), API Gateway HTTP API (per-request, cheaper than REST), DynamoDB
`PAY_PER_REQUEST` (+ negligible PITR), and CloudWatch Logs (14-day retention).
Bedrock is billed per token by the model itself. The ACM viewer certificate
(`acm.tf`) is a **public certificate and is free** — including DNS validation and
auto-renewal — so the crypto remediation adds **$0/month**. Total recurring idle
cost remains effectively zero and well under the $1/month target.

---

## Not created (by design)

REST API Gateway, ECS, EC2, ALB/NLB, VPC, NAT, ECR, Step Functions, EventBridge,
SNS, SQS, WAF, Cognito, Secrets Manager, Route53, RDS, ElastiCache, OpenSearch.
No Lambda code, no Bedrock inference code — Terraform provisions infrastructure
and IAM only.

> **ACM** is now used — but only for a single **free** public certificate
> (`acm.tf`) that remediates the RSA-2048 finding. No private CA, no cost.
