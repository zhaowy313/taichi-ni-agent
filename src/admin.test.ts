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

  it('should return 200 for known admin routes (placeholder)', async () => {
    const request = new Request('http://localhost/admin/users', {
      method: 'POST',
      headers: { 'X-Admin-Key': 'super-secret-key' },
    });
    const response = await handleAdminRequest(request, mockEnv);
    expect(response.status).toBe(200); // Or whatever success code we set initially
  });
});
