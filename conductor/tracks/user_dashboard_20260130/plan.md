# Implementation Plan: User Dashboard (MVP)

This plan outlines the steps to build and deploy the user dashboard.

## Phase 1: API Extensions for User Access
- [x] Task: Design User API. fe979e4
    -   Define endpoints: `POST /login`, `GET /me` (balance, key), `POST /me/key` (generate).
- [ ] Task: Implement User Authentication Logic.
    -   Update `users` table to store password hash (or handle magic links).
    -   Create `src/user_api.ts` to handle user-facing routes.
    -   Implement JWT issuance for user sessions.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: API Extensions for User Access' (Protocol in workflow.md)

## Phase 2: Frontend Implementation
- [ ] Task: Initialize Next.js Project.
    -   Scaffold a new Next.js app in `dashboard/`.
    -   Configure Tailwind CSS.
- [ ] Task: Implement Login Page.
    -   Create form for email/password.
    -   Connect to `POST /login` API.
- [ ] Task: Implement Dashboard Home.
    -   Fetch user data from `GET /me`.
    -   Display balance and key.
    -   Implement "Generate Key" button.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md)

## Phase 3: Deployment
- [ ] Task: Deploy to Cloudflare Pages.
    -   Configure Wrangler for Pages deployment.
    -   Deploy and verify connection to the Worker API.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Deployment' (Protocol in workflow.md)
