# Implementation Plan: RAG Infrastructure Setup (Vectorize)

This plan outlines the steps to build the RAG foundation.

## Phase 1: Infrastructure Configuration [checkpoint: 9c49443]
- [x] Task: Configure Wrangler for Vectorize. 5f6a075
- [x] Task: Implement Embedding Helper. 6753fd5
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Configuration' (Protocol in workflow.md) 9c49443

## Phase 2: Ingestion Pipeline
- [x] Task: Create Ingestion Endpoint (`POST /admin/ingest`). 7bbf1be
    - [ ] Receive text content and metadata (title, category).
    - [ ] Generate embedding.
    - [ ] Insert vector + metadata into `env.VECTORIZE_INDEX`.
- [x] Task: Create Ingestion Script. 91e81cc
    - [ ] Create `scripts/ingest_docs.ts` (or Python as per spec, but TS shares types better) to verify the endpoint.
    - [ ] *Self-correction:* The spec mentions Python CLI, but we are building a web-based agent. We'll build a TypeScript script that calls the Worker's admin endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Ingestion Pipeline' (Protocol in workflow.md)
