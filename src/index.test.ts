import { describe, it, expect } from 'vitest';
import worker from './index';

describe('Worker', () => {
  it('should return Hello World', async () => {
    const request = new Request('http://example.com');
    const env = {} as any;
    const ctx = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    } as any;

    const response = await worker.fetch(request, env, ctx);
    const text = await response.text();
    expect(text).toBe('Hello World!');
  });
});
