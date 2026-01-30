import { Env } from './types';
import { verifyApiKey } from './auth';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/v1/chat/completions') {
      return new Response('Not Found', { status: 404 });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const user = await verifyApiKey(apiKey, env.KV, env.DB);

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Proxy to Workers AI or AI Gateway
    // For now, we'll return a placeholder success response
    return new Response(JSON.stringify({
      id: 'chatcmpl-placeholder',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'llama-3.3-70b-instruct',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a placeholder response from the TaiChi-NiHaixia Agent proxy.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};