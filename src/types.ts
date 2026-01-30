export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ADMIN_SECRET: string;
  JWT_SECRET: string;
}
