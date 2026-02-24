#!/usr/bin/env bash

# Test script to verify chat server is working

echo "🧪 Testing Chat Server Integration..."
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
  echo "✅ Health check passed: $HEALTH_RESPONSE"
else
  echo "❌ Health check failed - is the server running?"
  exit 1
fi

echo ""

# Test 2: Chat endpoint
echo "2️⃣ Testing chat endpoint..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-'$(date +%s)'",
    "message": "Hi! Just testing. Reply with OK."
  }')

if echo "$CHAT_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Chat endpoint working!"
  echo "📝 Response preview:"
  echo "$CHAT_RESPONSE" | grep -o '"response":"[^"]*"' | head -c 100
  echo "..."
else
  echo "❌ Chat endpoint failed"
  echo "Response: $CHAT_RESPONSE"
  exit 1
fi

echo ""
echo ""
echo "🎉 All tests passed! Chat server is ready."
echo ""
echo "📍 Next steps:"
echo "   1. Keep this server running (Terminal 1)"
echo "   2. Open a new terminal (Terminal 2)"
echo "   3. Run: npm run dev"
echo "   4. Open http://localhost:3000"
echo "   5. Click the Messages app to chat!"
echo ""
