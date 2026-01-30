import { Env } from './types';

export async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  const secret = request.headers.get('X-Admin-Key');
  if (secret !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);

  if (url.pathname === '/admin/users' && request.method === 'POST') {
    const { user_id } = await request.json() as { user_id: string };
    await env.DB.prepare('INSERT INTO users (id, balance) VALUES (?, 0)')
      .bind(user_id)
      .run();
    return new Response(JSON.stringify({ user_id }), { status: 201 });
  }

  if (url.pathname === '/admin/keys' && request.method === 'POST') {
    const { user_id } = await request.json() as { user_id: string };
    const rawKey = `sk-taichi-${crypto.randomUUID().replace(/-/g, '')}`;
    
    // In MVP, we store the raw key as the hash for simplicity
    await env.DB.prepare('INSERT INTO api_keys (hash, user_id, status) VALUES (?, ?, "active")')
      .bind(rawKey, user_id)
      .run();
    
    // Cache in KV
    await env.KV.put(rawKey, JSON.stringify({ user_id, status: 'active' }), { expirationTtl: 3600 });
    
    return new Response(JSON.stringify({ key: rawKey }), { status: 201 });
  }

  if (url.pathname === '/admin/credit' && request.method === 'POST') {
    const { user_id, amount } = await request.json() as { user_id: string; amount: number };
    await env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
      .bind(amount, user_id)
      .run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
}
