# Specification: API Key Management & Admin Tools

## Overview
This track focuses on building administrative tools to manage users, API keys, and balances. Since we lack a web dashboard for the MVP, we will expose secured API endpoints (`/admin/*`) that can be consumed via `curl` or simple scripts to perform these operations.

## Functional Requirements
- **Admin Authentication:** Secure all admin routes with a shared `ADMIN_SECRET` header (e.g., `X-Admin-Key`).
- **User Management:**
    -   `POST /admin/users`: Create a new user record.
- **Key Management:**
    -   `POST /admin/keys`: Generate a new `sk-taichi-` key for a specific user.
    -   Store the key hash in D1 and the raw key (temporarily) in the response.
- **Balance Management:**
    -   `POST /admin/credit`: Top up a user's balance.

## Tech Stack
- **Runtime:** Existing Cloudflare Worker (`src/index.ts`).
- **Storage:** Existing D1 and KV.
- **Security:** Environment variable `ADMIN_SECRET` for authorization.

## Integration Points
- **Input:** Admin HTTP requests (via `curl`).
- **Output:** JSON responses with created resource details (e.g., the raw API key).
