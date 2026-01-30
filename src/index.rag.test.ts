import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index'; // Default export is the worker object
import { Env } from './types';
import * as auth from './auth';
import * as ai from './ai';
import * as billing from './billing';

// Mock dependencies
vi.mock('./auth');
vi.mock('./ai');
vi.mock('./billing');

describe('Worker Fetch Handler (Chat RAG)', () => {
  const mockEnv = {
    DB: {
      prepare: vi.fn(),
    },
    KV: {},
    AI: {},
    VECTORIZE_INDEX: {},
  } as unknown as Env;

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve context and log it (for now) when handling chat request', async () => {
    // Setup Request
    const request = new Request('http://localhost/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Tell me about Tai Chi' }],
      }),
    });

    // Mock Auth
    vi.mocked(auth.verifyApiKey).mockResolvedValue({ user_id: 'user1', status: 'active' });

    // Mock DB Balance Check
    const mockStmt = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ balance: 10 }),
    };
    (mockEnv.DB.prepare as any).mockReturnValue(mockStmt);

    // Mock Retrieval
    const mockContext = ['Tai Chi is a martial art.'];
    vi.mocked(ai.retrieveContext).mockResolvedValue(mockContext);

    // Mock Billing (Cost Calculation)
    vi.mocked(billing.calculateCost).mockReturnValue(0.01);
    vi.mocked(billing.deductBalance).mockResolvedValue();

    // Mock Console to verify logging (or just check that retrieveContext was called)
    const consoleSpy = vi.spyOn(console, 'log');

    // Execute
    await worker.fetch(request, mockEnv, mockCtx);

    // Verify
    expect(ai.retrieveContext).toHaveBeenCalledWith('Tell me about Tai Chi', mockEnv);
    expect(consoleSpy).toHaveBeenCalledWith('Retrieved Context:', mockContext);
  });
});
