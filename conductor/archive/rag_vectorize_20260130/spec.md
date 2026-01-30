# Specification: RAG Infrastructure Setup (Vectorize)

## Overview
This track focuses on setting up the Retrieval-Augmented Generation (RAG) infrastructure using Cloudflare Vectorize. We will create a vector index to store Tai Chi and Ni Haixia knowledge and implementing the logic to generate embeddings using the BGE-M3 model.

## Functional Requirements
- **Vector Index:** Create a Cloudflare Vectorize index named `taichi-knowledge-base` with appropriate dimensions for BGE-M3.
- **Embedding Logic:** Implement a helper function in the Worker to generate embeddings for text using `@cf/baai/bge-m3`.
- **Ingestion Script:** Create a standalone script (or admin endpoint) to accept text documents, generate embeddings, and insert them into the Vectorize index.

## Tech Stack
- **Vector DB:** Cloudflare Vectorize.
- **Embedding Model:** `@cf/baai/bge-m3` (Dimension: 1024).
- **Runtime:** Cloudflare Workers.

## Integration Points
- **Input:** Raw text documents (Tai Chi manuals, Ni Haixia transcripts).
- **Output:** Vector embeddings stored in Cloudflare Vectorize.
