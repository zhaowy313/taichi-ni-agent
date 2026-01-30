import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onMessage } from './bridge';

describe('Bridge Skill', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      user: { id: 'user_123' },
      state: {}, // Mock persistent state
      reply: vi.fn(),
    };
  });

  it('should handle /setkey command and store the key', async () => {
    const message = { text: '/setkey sk-taichi-testkey' };
    
    await onMessage(message, mockContext);
    
    expect(mockContext.state.apiKey).toBe('sk-taichi-testkey');
    expect(mockContext.reply).toHaveBeenCalledWith(expect.stringContaining('API key set successfully'));
  });

  it('should validate key format in /setkey', async () => {
    const message = { text: '/setkey invalid-key' };
    
    await onMessage(message, mockContext);
    
    expect(mockContext.state.apiKey).toBeUndefined();
    expect(mockContext.reply).toHaveBeenCalledWith(expect.stringContaining('Invalid key format'));
  });

  it('should prompt to set key if no key is present for non-command messages', async () => {
    const message = { text: 'Hello' };
    await onMessage(message, mockContext);
    expect(mockContext.reply).toHaveBeenCalledWith(expect.stringContaining('Please set your API key'));
  });

  it('should forward message to proxy if key is present', async () => {
    mockContext.state.apiKey = 'sk-taichi-valid';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'AI Advice' } }],
        usage: { total_tokens: 30 }
      })
    });
    vi.stubGlobal('fetch', mockFetch);

    const message = { text: 'How to practice TaiChi?' };
    await onMessage(message, mockContext);

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/chat/completions'), expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer sk-taichi-valid'
      })
    }));
    expect(mockContext.reply).toHaveBeenCalledWith(expect.stringContaining('AI Advice'));
  });

  it('should handle 402 Payment Required from proxy', async () => {
    mockContext.state.apiKey = 'sk-taichi-valid';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 402
    }));

    const message = { text: 'Hello' };
    await onMessage(message, mockContext);
    expect(mockContext.reply).toHaveBeenCalledWith(expect.stringContaining('insufficient balance'));
  });
});
