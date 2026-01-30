import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import { ingestDocument } from './ingest_docs';

vi.mock('fs/promises');

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('ingestDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read file and post to ingestion endpoint', async () => {
    // Setup
    const filePath = 'test.txt';
    const title = 'Test Doc';
    const category = 'Test Category';
    const token = 'secret-token';
    const content = 'This is a test document content.';
    
    vi.mocked(fs.readFile).mockResolvedValue(content);
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    // Execute
    await ingestDocument(filePath, title, category, token, 'http://localhost:8787');

    // Verify
    expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
    expect(globalFetch).toHaveBeenCalledWith('http://localhost:8787/admin/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: content,
        metadata: {
          title,
          category,
        },
      }),
    });
  });

  it('should throw error if fetch fails', async () => {
      // Setup
      const filePath = 'test.txt';
      vi.mocked(fs.readFile).mockResolvedValue('content');
      globalFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Error message'
      } as Response);
  
      // Execute & Verify
      await expect(ingestDocument(filePath, 'Title', 'Cat', 'token', 'http://localhost:8787'))
        .rejects.toThrow('Ingestion failed: 500 Internal Server Error - Error message');
  });
});
