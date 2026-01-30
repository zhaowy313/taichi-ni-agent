# Specification: Cloudflare Proxy & Billing Infrastructure

## Overview
This track focuses on building the core infrastructure for the TaiChi-NiHaixia Agent. This includes the Cloudflare Worker proxy shell, API key authentication, and token-based billing logic.

## Functional Requirements
- **OpenAI-Compatible Proxy:** Create a Cloudflare Worker that accepts `/v1/chat/completions` and routes to Cloudflare Workers AI.
- **API Key Authentication:** Implement `sk-taichi-` key verification against Cloudflare KV (for speed) and D1 (for source of truth).
- **Token Billing:** Implement real-time token counting from model responses and deduct the equivalent cost from the user's balance in D1.
- **Error Handling:** Return appropriate HTTP status codes (401 Unauthorized, 402 Payment Required) for invalid keys or insufficient balance.

## Non-Functional Requirements
- **Performance:** Edge-side verification to maintain low latency.
- **Security:** Hashed storage for API keys in D1.
- **Scalability:** Leverage Cloudflare's global network for request handling.

## Tech Stack Refinement
- **Runtime:** Cloudflare Workers (TypeScript)
- **Storage:** Cloudflare D1 (Relational/Billing), Cloudflare KV (Caching/Auth)
- **AI Gateway:** Integration for observability and caching.
