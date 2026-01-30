import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retrieveContext } from './ai';
import { Env } from './types';

describe('retrieveContext', () => {
  const mockEnv = {
    AI: {
      run: vi.fn(),
    },
    VECTORIZE_INDEX: {
      query: vi.fn(),
    },
  } as unknown as Env;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate embedding and query vector index', async () => {
    // Setup
    const query = 'Tai Chi basics';
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockMatches = {
      matches: [
        { id: '1', score: 0.9, metadata: { text: 'Document 1 content' } },
        { id: '2', score: 0.8, metadata: { text: 'Document 2 content' } },
      ],
    };

    // Mock Embedding generation (reusing existing logic or mocking the call)
    // Note: retrieveContext calls generateEmbedding internally. 
    // We need to ensure generateEmbedding is exported or we mock the AI call it makes.
    // Based on src/ai.ts, generateEmbedding calls env.AI.run('@cf/baai/bge-m3', ...)
    (mockEnv.AI.run as any).mockResolvedValue({ data: [mockEmbedding] });
    
    // Mock Vectorize query
    (mockEnv.VECTORIZE_INDEX.query as any).mockResolvedValue(mockMatches);

    // Execute
    const results = await retrieveContext(query, mockEnv);

    // Verify
    expect(mockEnv.AI.run).toHaveBeenCalledWith('@cf/baai/bge-m3', { text: query });
    expect(mockEnv.VECTORIZE_INDEX.query).toHaveBeenCalledWith(mockEmbedding, { topK: 5, returnMetadata: true });
    expect(results).toEqual([
      { text: 'Document 1 content', metadata: { text: 'Document 1 content' } },
      { text: 'Document 2 content', metadata: { text: 'Document 2 content' } },
    ]);
  });

  it('should return empty array if no matches found', async () => {
     // Setup
     (mockEnv.AI.run as any).mockResolvedValue({ data: [[0.1]] });
     (mockEnv.VECTORIZE_INDEX.query as any).mockResolvedValue({ matches: [] });
 
     // Execute
     const results = await retrieveContext('query', mockEnv);
 
     // Verify
     expect(results).toEqual([]);
  });
});
