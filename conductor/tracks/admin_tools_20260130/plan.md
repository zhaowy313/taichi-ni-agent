# Implementation Plan: API Key Management & Admin Tools

This plan outlines the steps to build the admin API.

## Phase 1: Admin Authentication & Routing [checkpoint: fdd09f5]
- [x] Task: Configure Admin Secret. 7f41620
- [x] Task: Implement Admin Middleware. a94388b
- [x] Task: Conductor - User Manual Verification 'Phase 1: Admin Authentication & Routing' (Protocol in workflow.md) fdd09f5

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
