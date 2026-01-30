#!/bin/bash

# Verification Script for TaiChi-NiHaixia Agent Production Deployment

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./verify_prod.sh <BASE_URL> <ADMIN_SECRET>"
  echo "Example: ./verify_prod.sh https://taichi-ni-agent.your-subdomain.workers.dev my-secure-secret"
  exit 1
fi

BASE_URL=$1
ADMIN_SECRET=$2

echo "--- 1. Admin: Create User ---"
USER_ID="prod-test-user-$(date +%s)"
CREATE_USER_RESP=$(curl -s -X POST "$BASE_URL/admin/users" \
  -H "X-Admin-Key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\"}")

echo "Response: $CREATE_USER_RESP"
if [[ "$CREATE_USER_RESP" == *"\"user_id\":\"$USER_ID\""* ]]; then
  echo "SUCCESS: User created."
else
  echo "FAILURE: User creation failed."
  exit 1
fi

echo -e "\n--- 2. Admin: Generate API Key ---"
GEN_KEY_RESP=$(curl -s -X POST "$BASE_URL/admin/keys" \
  -H "X-Admin-Key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\"}")

echo "Response: $GEN_KEY_RESP"
API_KEY=$(echo $GEN_KEY_RESP | sed -n 's/.*\"key\":\"\([^\"]*\)\".*/\1/p')

if [[ "$API_KEY" == sk-taichi-* ]]; then
  echo "SUCCESS: API Key generated: $API_KEY"
else
  echo "FAILURE: API Key generation failed."
  exit 1
fi

echo -e "\n--- 3. Admin: Top-up Balance ---"
CREDIT_RESP=$(curl -s -X POST "$BASE_URL/admin/credit" \
  -H "X-Admin-Key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\", \"amount\": 1.0}")

echo "Response: $CREDIT_RESP"
if [[ "$CREDIT_RESP" == *"\"success\":true"* ]]; then
  echo "SUCCESS: Balance updated."
else
  echo "FAILURE: Balance update failed."
  exit 1
fi

echo -e "\n--- 4. Proxy: Chat Completion ---"
PROXY_RESP=$(curl -s -X POST "$BASE_URL/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"messages\": [{\"role\": \"user\", \"content\": \"Hello, TaiChi Agent!\"}]}")

echo "Response: $PROXY_RESP"
if [[ "$PROXY_RESP" == *"chat.completion"* ]]; then
  echo "SUCCESS: Proxy response received."
else
  echo "FAILURE: Proxy check failed."
  exit 1
fi

echo -e "\n--- Verification Complete! ---"
