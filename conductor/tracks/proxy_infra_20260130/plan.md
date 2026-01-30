# Implementation Plan: Cloudflare Proxy & Billing Infrastructure

This plan outlines the steps to build the proxy shell and billing system using Cloudflare Workers.

## Phase 1: Environment & Schema Setup
- [ ] Task: Initialize Wrangler project and define D1 database schema.
    - [ ] Initialize a new Cloudflare Workers project with TypeScript.
    - [ ] Create D1 schema for `users` (id, balance) and `api_keys` (hash, user_id, status).
    - [ ] Configure `wrangler.toml` with D1 and KV bindings.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Environment & Schema Setup' (Protocol in workflow.md)

## Phase 2: Authentication & Proxy Core
- [ ] Task: Implement API Key verification logic.
    - [ ] Write utility to hash incoming keys and check against KV/D1.
    - [ ] Create middleware to intercept requests and validate the `Authorization` header.
- [ ] Task: Implement the OpenAI-compatible proxy shell.
    - [ ] Create the `/v1/chat/completions` route.
    - [ ] Implement request forwarding to Cloudflare Workers AI or AI Gateway.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Authentication & Proxy Core' (Protocol in workflow.md)

## Phase 3: Billing & Token Tracking
- [ ] Task: Implement token counting and balance deduction.
    - [ ] Extract `usage` data from the AI response.
    - [ ] Calculate cost based on predefined rates.
    - [ ] Update user balance in D1 transactionally.
- [ ] Task: Implement balance checks and error responses.
    - [ ] Add pre-request check to ensure user has minimum required balance.
    - [ ] Return 402 status code if balance is insufficient.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Billing & Token Tracking' (Protocol in workflow.md)
