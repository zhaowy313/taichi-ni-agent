import { Env } from './types';
import * as jose from 'jose';

export async function handleUserRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Public Routes
  if (url.pathname === '/api/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }

  if (url.pathname === '/api/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }

  // Protected Routes (require JWT)
  const authCheck = await verifyUserToken(request, env);
  if (!authCheck.authorized || !authCheck.userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = authCheck.userId;

  if (url.pathname === '/api/me' && request.method === 'GET') {
    return handleGetMe(userId, env);
  }

  if (url.pathname === '/api/me/key' && request.method === 'POST') {
    return handleGenerateKey(userId, env);
  }

  return new Response('Not Found', { status: 404 });
}

async function hashPassword(password: string): Promise<string> {
  const myText = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    myText
  );
  return [...new Uint8Array(myDigest)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const { email, password } = await request.json() as any;
    if (!email || !password) {
      return new Response('Missing email or password', { status: 400 });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await env.DB.prepare('INSERT INTO users (id, email, password_hash, balance) VALUES (?, ?, ?, 0)')
      .bind(userId, email, passwordHash)
      .run();

    return new Response(JSON.stringify({ userId }), { status: 201 });
  } catch (e) {
    return new Response('Error registering user', { status: 500 });
  }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { email, password } = await request.json() as any;
    const passwordHash = await hashPassword(password);

    const user = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND password_hash = ?')
      .bind(email, passwordHash)
      .first<{ id: string }>();

    if (!user) {
      return new Response('Invalid credentials', { status: 401 });
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const jwt = await new jose.SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return new Response(JSON.stringify({ token: jwt }), { status: 200 });
  } catch (e) {
    return new Response('Error logging in', { status: 500 });
  }
}

async function verifyUserToken(request: Request, env: Env): Promise<{ authorized: boolean; userId?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return { authorized: true, userId: payload.sub };
  } catch (e) {
    return { authorized: false };
  }
}

async function handleGetMe(userId: string, env: Env): Promise<Response> {
  const user = await env.DB.prepare('SELECT email, balance FROM users WHERE id = ?')
    .bind(userId)
    .first();
  
  // Also get API Key if exists (masked)
  const keyRecord = await env.DB.prepare('SELECT hash FROM api_keys WHERE user_id = ? AND status = "active"')
    .bind(userId)
    .first<{ hash: string }>();

  // In MVP, hash is the raw key.
  const apiKey = keyRecord ? keyRecord.hash : null;

  return new Response(JSON.stringify({ ...user, apiKey }), { status: 200 });
}

async function handleGenerateKey(userId: string, env: Env): Promise<Response> {
  const rawKey = `sk-taichi-${crypto.randomUUID().replace(/-/g, '')}`;
  
  // Deactivate old keys
  await env.DB.prepare('UPDATE api_keys SET status = "revoked" WHERE user_id = ?')
    .bind(userId)
    .run();

  await env.DB.prepare('INSERT INTO api_keys (hash, user_id, status) VALUES (?, ?, "active")')
    .bind(rawKey, userId)
    .run();
  
  // Cache in KV
  await env.KV.put(rawKey, JSON.stringify({ user_id: userId, status: 'active' }), { expirationTtl: 3600 });
  
  return new Response(JSON.stringify({ key: rawKey }), { status: 201 });
}