import { Env } from './types';

export async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  const secret = request.headers.get('X-Admin-Key');
  if (secret !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);

  if (url.pathname === '/admin/users' && request.method === 'POST') {
    return new Response('User Created', { status: 200 });
  }

  if (url.pathname === '/admin/keys' && request.method === 'POST') {
    return new Response('Key Generated', { status: 200 });
  }

  if (url.pathname === '/admin/credit' && request.method === 'POST') {
    return new Response('Balance Updated', { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
}