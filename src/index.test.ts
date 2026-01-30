import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index';
import * as auth from './auth';

vi.mock('./auth');

describe('Worker Proxy', () => {
  const mockEnv = {
    DB: {} as any,
    KV: {} as any,
  };
  const mockCtx = {
    waitUntil: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    const request = new Request('http://localhost/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await worker.fetch(request, mockEnv, mockCtx);
    expect(response.status).toBe(401);
  });

  it('should return 401 if API key is invalid', async () => {
    vi.mocked(auth.verifyApiKey).mockResolvedValue(null);
    const request = new Request('http://localhost/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer invalid' },
      body: JSON.stringify({}),
    });
    const response = await worker.fetch(request, mockEnv, mockCtx);
    expect(response.status).toBe(401);
  });

    it('should return 402 if user balance is insufficient', async () => {

      vi.mocked(auth.verifyApiKey).mockResolvedValue({ user_id: 'user_low_balance', status: 'active' });

      const mockDB = {

        prepare: vi.fn().mockReturnThis(),

        bind: vi.fn().mockReturnThis(),

        first: vi.fn().mockResolvedValue({ balance: 0.01 }), // Less than 0.05 minimum

      } as any;

      

      const request = new Request('http://localhost/v1/chat/completions', {

        method: 'POST',

        headers: { 'Authorization': 'Bearer sk-taichi-low' },

        body: JSON.stringify({}),

      });

      

      const response = await worker.fetch(request, { ...mockEnv, DB: mockDB }, mockCtx);

      expect(response.status).toBe(402);

    });

  });

  