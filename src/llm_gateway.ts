import { Env } from './types';

export type Provider = 'openai' | 'google-ai-studio' | 'deepseek';

export function resolveProvider(model: string): Provider {
  if (model.startsWith('gpt')) {
    return 'openai';
  }
  if (model.startsWith('gemini')) {
    return 'google-ai-studio';
  }
  if (model.startsWith('deepseek')) {
    return 'deepseek';
  }
  return 'openai'; // Default
}

export function constructGatewayUrl(provider: Provider, env: Env): string {
  return `https://gateway.ai.cloudflare.com/v1/${env.CF_AIGATEWAY_ACCOUNT_ID}/${env.CF_AIGATEWAY_SLUG}/${provider}/chat/completions`;
}

export async function callAI(
  model: string, 
  messages: any[], 
  env: Env
): Promise<any> {
  const provider = resolveProvider(model);
  const url = constructGatewayUrl(provider, env);
  
  let apiKey = '';
  switch (provider) {
    case 'openai': apiKey = env.OPENAI_API_KEY; break;
    case 'google-ai-studio': apiKey = env.GEMINI_API_KEY; break;
    case 'deepseek': apiKey = env.DEEPSEEK_API_KEY; break;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Gateway Error (${provider}): ${response.status} - ${errorText}`);
  }

  return response.json();
}
