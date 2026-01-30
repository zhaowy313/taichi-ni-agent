import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index';
import { Env } from './types';
import * as auth from './auth';
import * as ai from './ai';
import * as billing from './billing';
import * as llm_gateway from './llm_gateway';

vi.mock('./auth');
vi.mock('./ai');
vi.mock('./billing');
vi.mock('./llm_gateway');

describe('Worker Fetch Handler (Multi-Provider RAG)', () => {
  const mockEnv = {
    DB: {
      prepare: vi.fn(),
    },
    KV: {},
    AI: {},
    VECTORIZE_INDEX: {},
    CF_AIGATEWAY_ACCOUNT_ID: 'acc',
    CF_AIGATEWAY_SLUG: 'slug',
  } as unknown as Env;

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should route to correct provider and return response', async () => {
     // Setup
     const request = new Request('http://localhost/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Tell me about Tai Chi' }],
      }),
    });

    vi.mocked(auth.verifyApiKey).mockResolvedValue({ user_id: 'user1', status: 'active' });

    const mockStmt = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ balance: 10 }),
    };
    (mockEnv.DB.prepare as any).mockReturnValue(mockStmt);

    vi.mocked(ai.retrieveContext).mockResolvedValue([{ text: 'Tai Chi is good.', metadata: { title: 'Book' } }]);
    vi.mocked(ai.constructSystemPrompt).mockReturnValue('System Prompt');

    // Mock Gateway Call
    const mockResponse = {
        choices: [{ message: { content: 'GPT-4o Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    };
    vi.mocked(llm_gateway.callAI).mockResolvedValue(mockResponse);

    // Execute
    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body = await response.json();

    // Verify
    expect(llm_gateway.callAI).toHaveBeenCalledWith('gpt-4o', expect.objectContaining([
        { role: 'system', content: 'System Prompt' },
        { role: 'user', content: 'Tell me about Tai Chi' },
    ]), mockEnv);

    expect(body).toEqual(mockResponse);
  });
});