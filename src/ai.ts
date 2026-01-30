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

export function constructSystemPrompt(context: string[]): string {
  const MAX_CONTEXT_LENGTH = 4000;
  let combinedContext = '';
  let currentLength = 0;

  for (const text of context) {
    if (currentLength + text.length > MAX_CONTEXT_LENGTH) {
      const remainingSpace = MAX_CONTEXT_LENGTH - currentLength;
      if (remainingSpace > 50) { // Only add partial if enough space
        combinedContext += `- ${text.substring(0, remainingSpace)}... [truncated]\n`;
      }
      break;
    }
    combinedContext += `- ${text}\n`;
    currentLength += text.length;
  }

  const contextText = combinedContext.trim() || '(No relevant context found)';

  return `
You are a Tai Chi master and expert in Ni Haixia's TCM philosophy.
Your goal is to provide sage, encouraging, and authoritative advice on Tai Chi training and wellness.

Context:
${contextText}

Instructions:
1. Use the provided context to answer the user's question.
2. If the answer is not in the context, politely admit you do not know, but you can offer general encouragement based on Tai Chi principles if appropriate. Do not make up medical advice.
3. Keep your tone calm, wise, and supportive.
`.trim();
}