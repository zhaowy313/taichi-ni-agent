import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiKey } from './auth';

describe('Auth', () => {
  const mockKV = {
    get: vi.fn(),
    put: vi.fn(),
  } as any;

  const mockDB = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for invalid key format', async () => {
    const result = await verifyApiKey('invalid-key', mockKV, mockDB);
    expect(result).toBeNull();
  });

  it('should verify key from KV if present', async () => {
    mockKV.get.mockResolvedValue(JSON.stringify({ user_id: 'user_1', status: 'active' }));
    
    const result = await verifyApiKey('sk-taichi-testkey', mockKV, mockDB);
    
    expect(result).toEqual({ user_id: 'user_1', status: 'active' });
    expect(mockKV.get).toHaveBeenCalled();
    expect(mockDB.prepare).not.toHaveBeenCalled();
  });

  it('should verify key from DB and update KV if not in KV', async () => {
    mockKV.get.mockResolvedValue(null);
    mockDB.first.mockResolvedValue({ user_id: 'user_2', status: 'active' });
    
    const result = await verifyApiKey('sk-taichi-dbkey', mockKV, mockDB);
    
    expect(result).toEqual({ user_id: 'user_2', status: 'active' });
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockKV.put).toHaveBeenCalled();
  });

  it('should return null if key not found in both KV and DB', async () => {
    mockKV.get.mockResolvedValue(null);
    mockDB.first.mockResolvedValue(null);
    
    const result = await verifyApiKey('sk-taichi-missing', mockKV, mockDB);
    expect(result).toBeNull();
  });
});
