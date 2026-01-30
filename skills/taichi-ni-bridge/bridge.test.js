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
});
