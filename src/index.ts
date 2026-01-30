import { Env } from './types';
import { verifyApiKey } from './auth';
import { calculateCost, deductBalance } from './billing';
import { handleAdminRequest } from './admin';
import { handleUserRequest } from './user_api';
import { retrieveContext, constructSystemPrompt } from './ai';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Admin Routes
    if (url.pathname.startsWith('/admin/')) {
      return handleAdminRequest(request, env);
    }

    // User API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleUserRequest(request, env);
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

    // Parse Request Body
    const requestBody = await request.clone().json() as any;
    const messages = requestBody.messages || [];
    const lastUserMessage = messages.reverse().find((m: any) => m.role === 'user')?.content;

    // Retrieve Context and Construct Prompt
    let systemPrompt = 'You are a helpful assistant.';
    if (lastUserMessage) {
      const context = await retrieveContext(lastUserMessage, env);
      console.log('Retrieved Context:', context);
      systemPrompt = constructSystemPrompt(context);
    }

    // Construct Messages for LLM
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...requestBody.messages // Pass through original messages (careful with duplication if we extracted last message, but usually users send full history)
        .filter((m: any) => m.role !== 'system') // Filter out any user-provided system prompts to enforce ours
    ];
    
    // Note: If requestBody.messages contains the last user message, we are keeping it.

    // Run Inference
    const model = '@cf/qwen/qwen1.5-72b-chat';
    const response = await env.AI.run(model, {
      messages: llmMessages,
      stream: false, // MVP non-streaming
    }) as any;

    // Construct OpenAI-compatible Response
    const chatResponse = {
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.response,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        // Approximate token counting if not provided by CF AI
        prompt_tokens: JSON.stringify(llmMessages).length / 4, 
        completion_tokens: (response.response || '').length / 4,
        total_tokens: 0, // Sum above
      },
    };
    
    // Fix usage totals
    chatResponse.usage.total_tokens = chatResponse.usage.prompt_tokens + chatResponse.usage.completion_tokens;

    // Deduct balance (background task)
    const cost = calculateCost(chatResponse.usage.prompt_tokens, chatResponse.usage.completion_tokens);
    ctx.waitUntil(deductBalance(user.user_id, cost, env.DB));

    return new Response(JSON.stringify(chatResponse), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};