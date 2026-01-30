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

export async function retrieveContext(query: string, env: Env): Promise<string[]> {
  const embedding = await generateEmbedding(query, env);
  
  const results = await env.VECTORIZE_INDEX.query(embedding, {
    topK: 5,
    returnMetadata: true,
  });

  return results.matches
    .map(match => match.metadata?.text as string)
    .filter(text => !!text);
}