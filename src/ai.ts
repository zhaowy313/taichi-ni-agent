import { Env } from './types';

export async function generateEmbedding(text: string, env: Env): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-m3', { text });
  // Type assertion or check based on actual AI binding return type
  // Typically { data: number[][] } for embedding models
  const data = (response as any).data;
  if (!data || !data[0]) {
    throw new Error('Failed to generate embedding');
  }
  return data[0];
}