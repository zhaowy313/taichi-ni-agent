# Technology Stack: TaiChi-NiHaixia Agent

## Core Runtime & Language
- **Platform:** [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform for low-latency request handling.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Ensuring type safety and better developer experience for the proxy and billing logic.

## AI Infrastructure
- **Proxy Shell:** [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) - For observability, caching, rate limiting, and unified API access.
- **Inference (MVP):** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) - Utilizing models like `@cf/meta/llama-3.3-70b-instruct` as initial backend placeholders.
- **API Standard:** OpenAI-compatible `/v1/chat/completions` endpoint.

## Data & Billing
- **Relational Data:** [Cloudflare D1](https://developers.cloudflare.com/d1/) - Storing user accounts, hashed API keys, and balance history.
- **Fast Lookups:** [Cloudflare KV](https://developers.cloudflare.com/kv/) - For high-speed verification of active API keys and session data at the edge.
- **Format:** `sk-taichi-` prefixed API keys.

## Ecosystem Integration
- **Framework:** [OpenClawd](https://github.com/OpenClawd) - The agent will be implemented as an OpenClawd Bridge Skill.
- **Communication:** Telegram, WhatsApp, and Discord (via OpenClawd).
