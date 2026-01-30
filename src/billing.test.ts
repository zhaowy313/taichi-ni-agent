import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCost, deductBalance } from './billing';

describe('Billing', () => {
  const mockDB = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate cost correctly based on tokens', () => {
    // Pricing: $1.2 / 1M tokens input, $4.8 / 1M tokens output
    // cost = (input * 1.2 + output * 4.8) / 1,000,000
    const cost = calculateCost(1000, 2000);
    const expected = (1000 * 1.2 + 2000 * 4.8) / 1000000;
    expect(cost).toBe(expected);
  });

  it('should deduct balance from the database', async () => {
    mockDB.run.mockResolvedValue({ success: true });
    
    await deductBalance('user_1', 0.05, mockDB);
    
    expect(mockDB.prepare).toHaveBeenCalledWith('UPDATE users SET balance = balance - ? WHERE id = ?');
    expect(mockDB.bind).toHaveBeenCalledWith(0.05, 'user_1');
    expect(mockDB.run).toHaveBeenCalled();
  });
});
