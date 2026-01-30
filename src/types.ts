export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Ai;
  ADMIN_SECRET: string;
  JWT_SECRET: string;
}
