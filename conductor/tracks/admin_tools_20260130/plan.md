# Implementation Plan: API Key Management & Admin Tools

This plan outlines the steps to build the admin API.

## Phase 1: Admin Authentication & Routing
- [x] Task: Configure Admin Secret. 7f41620
    - [ ] Update `wrangler.toml` (vars) and create `.dev.vars` for local testing with an `ADMIN_SECRET`.
    - [ ] Update `src/types.ts` to include the new variable.
- [ ] Task: Implement Admin Middleware.
    - [ ] Create `src/admin.ts` to handle admin routing and auth checks.
    - [ ] Integrate admin router into `src/index.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Admin Authentication & Routing' (Protocol in workflow.md)

## Phase 2: Management Logic
- [ ] Task: Implement User Creation.
    - [ ] Add logic to insert new user into D1 `users` table.
    - [ ] Return the new `user_id`.
- [ ] Task: Implement Key Generation.
    - [ ] Create utility to generate secure random keys (`sk-taichi-...`).
    - [ ] Hash the key and store in D1 `api_keys`.
    - [ ] Cache active status in KV.
    - [ ] Return the *raw* key to the admin (one-time view).
- [ ] Task: Implement Balance Top-up.
    - [ ] Add logic to update user balance in D1.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Management Logic' (Protocol in workflow.md)
