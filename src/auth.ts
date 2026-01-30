export async function verifyApiKey(
  key: string,
  KV: KVNamespace,
  DB: D1Database
): Promise<{ user_id: string; status: string } | null> {
  if (!key.startsWith('sk-taichi-')) {
    return null;
  }

  // Check KV first
  const cached = await KV.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Check DB
  // In a real app, we would hash the key before checking the DB.
  // For this MVP, we'll assume the 'hash' column stores the key or its hash.
  const result = await DB.prepare('SELECT user_id, status FROM api_keys WHERE hash = ? AND status = "active"')
    .bind(key)
    .first<{ user_id: string; status: string }>();

  if (result) {
    // Cache in KV for future requests (TTL 1 hour)
    await KV.put(key, JSON.stringify(result), { expirationTtl: 3600 });
    return result;
  }

  return null;
}