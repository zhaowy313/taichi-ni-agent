# Implementation Plan: RAG Infrastructure Setup (Vectorize)

This plan outlines the steps to build the RAG foundation.

## Phase 1: Infrastructure Configuration
- [x] Task: Configure Wrangler for Vectorize. 5f6a075
    - [ ] Add `[[vectorize]]` binding to `wrangler.toml`.
    - [ ] Update `src/types.ts` with `VectorizeIndex` binding.
    - [ ] Document the `wrangler vectorize create` command in `DEPLOY.md`.
- [ ] Task: Implement Embedding Helper.
    - [ ] Create `src/ai.ts`.
    - [ ] Implement `generateEmbedding(text, env)` using `env.AI.run('@cf/baai/bge-m3', ...)`.
    - [ ] Add unit tests for the embedding helper (mocking `env.AI`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Configuration' (Protocol in workflow.md)

## Phase 2: Ingestion Pipeline
- [ ] Task: Create Ingestion Endpoint (`POST /admin/ingest`).
    - [ ] Receive text content and metadata (title, category).
    - [ ] Generate embedding.
    - [ ] Insert vector + metadata into `env.VECTORIZE_INDEX`.
- [ ] Task: Create Ingestion Script.
    - [ ] Create `scripts/ingest_docs.ts` (or Python as per spec, but TS shares types better) to verify the endpoint.
    - [ ] *Self-correction:* The spec mentions Python CLI, but we are building a web-based agent. We'll build a TypeScript script that calls the Worker's admin endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Ingestion Pipeline' (Protocol in workflow.md)
