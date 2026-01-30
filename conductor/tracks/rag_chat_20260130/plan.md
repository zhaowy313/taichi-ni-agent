# Implementation Plan: RAG Retrieval & Chat Generation

## Phase 1: Retrieval Logic
- [x] Task: Implement `retrieveContext` function. 63824d5
- [x] Task: Update `handleUserRequest` / `fetch` to use retrieval. a232617

## Phase 2: LLM Integration (Multi-Provider)
- [x] Task: Construct System Prompt. 19b8840
- [ ] Task: Implement Multi-Provider Routing Logic.
    - [ ] Create `src/llm_gateway.ts` to handle routing via CF AI Gateway.
    - [ ] Implement `callProvider(provider, model, messages)` function.
    - [ ] Support OpenAI, Gemini, and DeepSeek (via custom fetch or CF Gateway Universal Endpoint).
    - [ ] Update `src/index.ts` to use this new logic instead of `env.AI`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: LLM Integration' (Protocol in workflow.md)

## Phase 3: Refinement
- [ ] Task: Optimize context window usage (truncate if too long).
- [ ] Task: Add source citations (optional MVP feature: append "Source: [Title]" to response).