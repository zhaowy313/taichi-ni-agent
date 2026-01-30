# Implementation Plan: OpenClawd Bridge Skill

This plan outlines the steps to build and verify the OpenClawd integration.

## Phase 1: Skill Structure & Key Management
- [x] Task: Create Skill Directory Structure. bd4ae10
    - [ ] Create `skills/taichi-ni-bridge/` directory.
    - [ ] Create `SKILL.md` with metadata (name, description, triggers).
- [ ] Task: Implement Command Handling & Key Storage.
    - [ ] Create `bridge.js` skeleton.
    - [ ] Implement logic to detect `/setkey` command.
    - [ ] Store API key in user context/state.
    - [ ] Add unit tests for key storage logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Skill Structure & Key Management' (Protocol in workflow.md)

## Phase 2: Message Bridging & Proxy Integration
- [ ] Task: Implement Proxy Request Logic.
    - [ ] In `bridge.js`, implement `fetch` call to the Cloudflare Proxy.
    - [ ] Construct the request payload (model, messages).
    - [ ] Handle 401/402 responses with specific user prompts.
- [ ] Task: Implement Main `onMessage` Handler.
    - [ ] Wire up key check -> proxy call -> response reply.
    - [ ] Add unit tests for the full flow (mocking `fetch`).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Message Bridging & Proxy Integration' (Protocol in workflow.md)
