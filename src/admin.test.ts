import { describe, it, expect, vi } from 'vitest';
import { handleAdminRequest } from './admin';

describe('Admin Middleware', () => {
  const mockEnv = {
    ADMIN_SECRET: 'super-secret-key',
  } as any;

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
    const mockDB = {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      run: vi.fn(),
      first: vi.fn(),
    } as any;

    const mockKV = {
      put: vi.fn(),
    } as any;

    it('should create a user and return user_id', async () => {
      mockDB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/users', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user' }),
      });
      const response = await handleAdminRequest(request, { ...mockEnv, DB: mockDB });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user_id).toBe('test-user');
    });

    it('should generate a key and return raw key', async () => {
      mockDB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/keys', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user' }),
      });
      const response = await handleAdminRequest(request, { ...mockEnv, DB: mockDB, KV: mockKV });
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.key).toContain('sk-taichi-');
    });

    it('should update user balance', async () => {
      mockDB.run.mockResolvedValue({ success: true });
      const request = new Request('http://localhost/admin/credit', {
        method: 'POST',
        headers: { 'X-Admin-Key': 'super-secret-key' },
        body: JSON.stringify({ user_id: 'test-user', amount: 10.0 }),
      });
      const response = await handleAdminRequest(request, { ...mockEnv, DB: mockDB });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
