import { Env } from './types';

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

async function handleLogin(request: Request, env: Env): Promise<Response> {
  return new Response('Not Implemented', { status: 501 });
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  return new Response('Not Implemented', { status: 501 });
}

async function verifyUserToken(request: Request, env: Env): Promise<{ authorized: boolean; userId?: string }> {
  return { authorized: false };
}

async function handleGetMe(userId: string, env: Env): Promise<Response> {
  return new Response('Not Implemented', { status: 501 });
}

async function handleGenerateKey(userId: string, env: Env): Promise<Response> {
  return new Response('Not Implemented', { status: 501 });
}
