# Initial Concept
The project goal is to build a "TaiChi-NiHaixia Agent", a companion-style TaiChi training and Ni Haixia lifestyle advice bot. The MVP involves creating a proxy shell using Cloudflare AI Gateway to expose an OpenAI-compatible API, managing API keys, implementing token-based billing (using Cloudflare D1/KV), and integrating with OpenClawd Skills. The core principles are user data sovereignty, server-side charging, and low-latency edge deployment.

# Product Definition: TaiChi-NiHaixia Agent

## Vision
To build a companion-style TaiChi training and Ni Haixia lifestyle advice agent that provides high-quality, personalized health guidance through popular social media platforms. The system prioritizes user data sovereignty, server-side monetization, and high-performance edge deployment.

## Target Users
- **Martial arts enthusiasts and TaiChi practitioners** seeking guided, interactive training sessions.
- **Traditional Chinese Medicine (TCM) followers** interested in the Ni Haixia lifestyle and wellness philosophy.
- **Social media users (Telegram, WhatsApp, Discord)** via OpenClawd seeking a health-focused AI companion.

## MVP Goals
- **API Proxy Shell:** Establish a functional OpenAI-compatible proxy shell using Cloudflare AI Gateway to route requests to backend models.
- **Billing & Management:** Implement a robust API key management (`sk-taichi-`) and token-based billing system using Cloudflare D1 and KV.
- **Ecosystem Integration:** Successfully integrate the agent as a functional "Skill" within the OpenClawd ecosystem.

## Core Features
- **Key & Balance Management:** Automated API key generation and real-time balance tracking stored in Cloudflare D1.
- **Edge Billing Logic:** Real-time token counting and balance deduction implemented within a Cloudflare Worker for minimal latency.
- **OpenClawd Bridge:** A specialized skill for OpenClawd to handle message routing, user state, and payment/recharge prompts.

## Success Metrics
- **User Engagement:** High retention rates driven by the value of personalized, companion-style health advice.
- **Sustainability:** Achieving profitability through a scalable token-based and subscription-based revenue model.
- **Performance:** Global edge deployment maintaining latency under 500ms for a seamless user experience.
