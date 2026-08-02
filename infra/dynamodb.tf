# ---------------------------------------------------------------------------
# dynamodb.tf
# Chat history table.
#
# - PAY_PER_REQUEST billing: no idle cost, scales to zero.
# - Point-in-time recovery: negligible cost on an on-demand table, enabled.
# - TTL: attribute reserved for future automatic expiry of old chats.
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "chat_history" {
  name         = local.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "chatId"
  range_key = "timestamp"

  attribute {
    name = "chatId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # Continuous backups for accidental-deletion / corruption recovery.
  point_in_time_recovery {
    enabled = true
  }

  # TTL support for future use. Items carrying an epoch value in `expiresAt`
  # will be expired automatically at no extra cost. Harmless until the
  # application starts writing the attribute.
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name = local.dynamodb_table_name
  }
}
