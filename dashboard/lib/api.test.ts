import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, getUser, generateApiKey } from './api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should login successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'fake-token' }),
    });

    const result = await login('test@example.com', 'password');
    expect(result).toEqual({ token: 'fake-token' });
    expect(mockFetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    }));
  });

  it('should throw error on login failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    await expect(login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('should register successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
    });

    await expect(register('test@example.com', 'password')).resolves.not.toThrow();
  });

  it('should fetch user data', async () => {
    const mockUser = { email: 'test@example.com', balance: 10, apiKey: null };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const result = await getUser('fake-token');
    expect(result).toEqual(mockUser);
    expect(mockFetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({
      headers: { 'Authorization': 'Bearer fake-token' },
    }));
  });

  it('should generate api key', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ key: 'sk-taichi-new' }),
    });

    const result = await generateApiKey('fake-token');
    expect(result).toEqual({ key: 'sk-taichi-new' });
  });
});
