import { describe, it, expect, vi } from 'vitest';
import { generateEmbedding } from './ai';

describe('AI Helper', () => {
  const mockEnv = {
    AI: {
      run: vi.fn(),
    },
  } as any;

  it('should generate embeddings for text', async () => {
    mockEnv.AI.run.mockResolvedValue({
      data: [[0.1, 0.2, 0.3]],
    });

    const embedding = await generateEmbedding('test text', mockEnv);
    expect(embedding).toEqual([0.1, 0.2, 0.3]);
    expect(mockEnv.AI.run).toHaveBeenCalledWith('@cf/baai/bge-m3', { text: 'test text' });
  });

  it('should handle AI errors', async () => {
    mockEnv.AI.run.mockRejectedValue(new Error('AI Error'));
    await expect(generateEmbedding('test', mockEnv)).rejects.toThrow('AI Error');
  });
});
