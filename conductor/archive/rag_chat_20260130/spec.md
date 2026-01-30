# Specification: RAG Retrieval & Chat Generation

## Overview
This track implements the core Retrieval-Augmented Generation (RAG) logic within the main chat endpoint. It connects the user's query to the vector database and generates a response using a selected frontier model (OpenAI, Gemini, or DeepSeek) routed via Cloudflare AI Gateway.

## Functional Requirements
- **Query Embedding:** Generate vector embeddings for the user's incoming chat message using `@cf/baai/bge-m3`.
- **Vector Search:** Query the `taichi-knowledge-base` index for the top relevant documents.
- **Context Construction:** detailed system prompt that incorporates the retrieved knowledge.
- **Multi-Provider Inference:**
    - Support routing to OpenAI (`gpt-4o`), Google (`gemini-1.5-pro`), and DeepSeek (`deepseek-chat`).
    - Use Cloudflare AI Gateway as the unified proxy for all outbound calls.
    - Select provider based on the `model` parameter in the request body (mapping model names to providers).
- **Response Handling:** Return the AI's response in the standard OpenAI format.

## Tech Stack
- **Runtime:** Cloudflare Workers
- **Vector DB:** Cloudflare Vectorize (`taichi-knowledge-base`)
- **Proxy:** Cloudflare AI Gateway
- **Embedding Model:** `@cf/baai/bge-m3`

## Prompt Engineering
- The system prompt must strictly instruct the agent to:
    - Act as a Tai Chi master and Ni Haixia lifestyle expert.
    - Use *only* the provided context to answer questions if possible.
    - Admit ignorance if the context doesn't contain the answer.
    - Maintain the "Sage & Encouraging" tone defined in Product Guidelines.