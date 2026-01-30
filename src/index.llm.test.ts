import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index';
import { Env } from './types';
import * as auth from './auth';
import * as ai from './ai';
import * as billing from './billing';

vi.mock('./auth');
vi.mock('./ai');
vi.mock('./billing');

describe('Worker Fetch Handler (Full Integration)', () => {
  const mockEnv = {
    DB: {
      prepare: vi.fn(),
    },
    KV: {},
    AI: {
      run: vi.fn(),
    },
    VECTORIZE_INDEX: {},
  } as unknown as Env;

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate response using Workers AI', async () => {
     // Setup
     const request = new Request('http://localhost/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Tell me about Tai Chi' }],
      }),
    });

    vi.mocked(auth.verifyApiKey).mockResolvedValue({ user_id: 'user1', status: 'active' });

    const mockStmt = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ balance: 10 }),
    };
    (mockEnv.DB.prepare as any).mockReturnValue(mockStmt);

    vi.mocked(ai.retrieveContext).mockResolvedValue(['Tai Chi is good.']);
    vi.mocked(ai.constructSystemPrompt).mockReturnValue('System Prompt');

    // Mock Workers AI Response
    (mockEnv.AI.run as any).mockResolvedValue({
        response: 'Tai Chi is an internal martial art.',
    });

    // Execute
    const response = await worker.fetch(request, mockEnv, mockCtx);
    const body = await response.json();

    // Verify
    expect(mockEnv.AI.run).toHaveBeenCalledWith('@cf/qwen/qwen1.5-72b-chat', expect.objectContaining({
        messages: [
            { role: 'system', content: 'System Prompt' },
            { role: 'user', content: 'Tell me about Tai Chi' },
        ],
    }));

    // Verify Response Format
    expect(body).toMatchObject({
        object: 'chat.completion',
        model: '@cf/qwen/qwen1.5-72b-chat',
        choices: [
            {
                message: {
                    role: 'assistant',
                    content: 'Tai Chi is an internal martial art.',
                },
            },
        ],
    });
  });
});
