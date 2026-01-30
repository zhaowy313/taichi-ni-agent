# Specification: RAG Retrieval & Chat Generation

## Overview
This track implements the core Retrieval-Augmented Generation (RAG) logic within the main chat endpoint. It connects the user's query to the vector database and generating a response using the Qwen 2.5 70b LLM.

## Functional Requirements
- **Query Embedding:** Generate vector embeddings for the user's incoming chat message.
- **Vector Search:** Query the `taichi-knowledge-base` index for the top relevant documents.
- **Context Construction:** detailed system prompt that incorporates the retrieved knowledge.
- **LLM Inference:** Send the prompt and context to Cloudflare Workers AI using the **Qwen 2.5 70b** model.
- **Response Handling:** Return the AI's response in the standard OpenAI format.

## Tech Stack
- **Runtime:** Cloudflare Workers
- **Vector DB:** Cloudflare Vectorize (`taichi-knowledge-base`)
- **AI Model:** `@cf/qwen/qwen-2.5-72b-instruct` (or equivalent available Qwen 2.5 70b model on CF).
- **Embedding Model:** `@cf/baai/bge-m3`

## Prompt Engineering
- The system prompt must strictly instruct the agent to:
    - Act as a Tai Chi master and Ni Haixia lifestyle expert.
    - Use *only* the provided context to answer questions if possible.
    - Admit ignorance if the context doesn't contain the answer.
    - Maintain the "Sage & Encouraging" tone defined in Product Guidelines.
