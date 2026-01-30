import { Env } from './types';
import { verifyApiKey } from './auth';
import { calculateCost, deductBalance } from './billing';
import { handleAdminRequest } from './admin';
import { handleUserRequest } from './user_api';
import { retrieveContext, constructSystemPrompt } from './ai';
import { callAI } from './llm_gateway';

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
    const requestedModel = requestBody.model || 'gpt-4o'; // Default to GPT-4o

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
      ...requestBody.messages // Pass through original messages
        .filter((m: any) => m.role !== 'system') 
    ];
    
    // Run Inference via AI Gateway
    let response;
    try {
      response = await callAI(requestedModel, llmMessages, env);
    } catch (error: any) {
      console.error('AI Gateway Error:', error);
      return new Response(`AI Provider Error: ${error.message}`, { status: 502 });
    }

    // Determine usage
    // Standard OpenAI response includes 'usage'
    const usage = response.usage || {
      prompt_tokens: JSON.stringify(llmMessages).length / 4,
      completion_tokens: (response.choices?.[0]?.message?.content || '').length / 4,
      total_tokens: 0
    };
    usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

    // Deduct balance (background task)
    const cost = calculateCost(usage.prompt_tokens, usage.completion_tokens);
    ctx.waitUntil(deductBalance(user.user_id, cost, env.DB));

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};