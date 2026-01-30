# Implementation Plan: RAG Retrieval & Chat Generation

## Phase 1: Retrieval Logic
- [x] Task: Implement `retrieveContext` function. 63824d5
    - [ ] Generate embedding for query.
    - [ ] Query Vectorize index.
    - [ ] Filter/Sort results (if necessary) and extract text.
- [x] Task: Update `handleUserRequest` / `fetch` to use retrieval. a232617
    - [ ] Modify `src/index.ts` to call retrieval before generating response.
    - [ ] Log retrieved documents for debugging (temporarily).

## Phase 2: LLM Integration
- [x] Task: Construct System Prompt. 19b8840
    - [ ] Create a template function that combines system instructions, retrieved context, and user query.
- [ ] Task: Integrate Workers AI (Qwen 2.5).
    - [ ] Replace placeholder response with actual `env.AI.run` call.
    - [ ] Map AI response to OpenAI format.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: LLM Integration' (Protocol in workflow.md)

## Phase 3: Refinement
- [ ] Task: Optimize context window usage (truncate if too long).
- [ ] Task: Add source citations (optional MVP feature: append "Source: [Title]" to response).
