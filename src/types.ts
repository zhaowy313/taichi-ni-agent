export interface Document {
  text: string;
  metadata?: {
    title?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Ai;
  ADMIN_SECRET: string;
  JWT_SECRET: string;
  
  // AI Gateway Config
  CF_AIGATEWAY_ACCOUNT_ID: string;
  CF_AIGATEWAY_SLUG: string;
  
  // Provider Keys
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
}
