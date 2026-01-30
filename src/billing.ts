export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Pricing from spec.md:
  // Input: $1.2 / 1M tokens
  // Output: $4.8 / 1M tokens
  const rateIn = 1.2;
  const rateOut = 4.8;
  return (inputTokens * rateIn + outputTokens * rateOut) / 1000000;
}

export async function deductBalance(userId: string, cost: number, DB: D1Database): Promise<void> {
  await DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
    .bind(cost, userId)
    .run();
}