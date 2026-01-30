import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAdminRequest } from './admin';
import * as ai from './ai';

vi.mock('./ai');

describe('Admin Middleware', () => {
  const mockEnv = {
    ADMIN_SECRET: 'super-secret-key',
    DB: {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      run: vi.fn(),
      first: vi.fn(),
    },
    KV: {
      put: vi.fn(),
    },
    VECTORIZE_INDEX: {
      insert: vi.fn(),
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if ADMIN_SECRET header is missing', async () => {
    const request = new Request('http://localhost/admin/users', {
      method: 'POST',
    });
    const response = await handleAdminRequest(request, mockEnv);
    expect(response.status).toBe(401);
  });

  it('should return 401 if ADMIN_SECRET header is incorrect', async () => {
    const request = new Request('http://localhost/admin/users', {
      method: 'POST',
      headers: { 'X-Admin-Key': 'wrong-key' },
    });
    const response = await handleAdminRequest(request, mockEnv);
    expect(response.status).toBe(401);
  });

  it('should return 404 for unknown admin routes', async () => {
    const request = new Request('http://localhost/admin/unknown', {
      method: 'POST',
      headers: { 'X-Admin-Key': 'super-secret-key' },
    });
    const response = await handleAdminRequest(request, mockEnv);
    expect(response.status).toBe(404);
  });

  describe('Management Logic', () => {
    it('should create a user and return user_id', async () => {
      mockEnv.DB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/users', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user' }),
      });
      const response = await handleAdminRequest(request, mockEnv);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user_id).toBe('test-user');
    });

    it('should generate a key and return raw key', async () => {
      mockEnv.DB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/keys', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user' }),
      });
      const response = await handleAdminRequest(request, mockEnv);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.key).toContain('sk-taichi-');
    });

    it('should update user balance', async () => {
      mockEnv.DB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/credit', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user', amount: 10.0 }),
      });
      const response = await handleAdminRequest(request, mockEnv);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should ingest documents into Vectorize', async () => {
      vi.mocked(ai.generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
      mockEnv.VECTORIZE_INDEX.insert.mockResolvedValue({ count: 1 });

      const request = new Request('http://localhost/admin/ingest', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({
          text: 'Tai Chi involves slow movements.',
          metadata: { title: 'Intro to Tai Chi', category: 'training' }
        }),
      });

      const response = await handleAdminRequest(request, mockEnv);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(ai.generateEmbedding).toHaveBeenCalledWith('Tai Chi involves slow movements.', mockEnv);
      expect(mockEnv.VECTORIZE_INDEX.insert).toHaveBeenCalled();
    });
  });
});
