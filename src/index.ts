import { Env } from './types';
import { verifyApiKey } from './auth';
import { calculateCost, deductBalance } from './billing';
import { handleAdminRequest } from './admin';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Admin Routes
    if (url.pathname.startsWith('/admin/')) {
      return handleAdminRequest(request, env);
    }

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

    // Check balance
    const userRecord = await env.DB.prepare('SELECT balance FROM users WHERE id = ?')
      .bind(user.user_id)
      .first<{ balance: number }>();

    if (!userRecord || userRecord.balance < 0.05) {
      return new Response('Payment Required', { status: 402 });
    }

    // Proxy to Workers AI or AI Gateway
    // For now, we'll return a placeholder success response
    const placeholderResponse = {
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
    };

    // Deduct balance (background task)
    const cost = calculateCost(placeholderResponse.usage.prompt_tokens, placeholderResponse.usage.completion_tokens);
    ctx.waitUntil(deductBalance(user.user_id, cost, env.DB));

    return new Response(JSON.stringify(placeholderResponse), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};