import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function getTargetBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE as string | undefined;
  if (base) return `${base.replace(/\/$/, '')}/api/vehicles`;
  const direct = process.env.NEXT_PUBLIC_API_BASE_VEHICLE as string | undefined;
  return `${(direct || 'http://localhost:8083').replace(/\/$/, '')}/api/vehicles`;
}

async function proxy(req: NextRequest, params: { path?: string[] }) {
  const base = getTargetBase();
  const suffix = (params.path || []).join('/');
  const url = `${base}${suffix ? '/' + suffix : ''}`;

  const headers = new Headers();
  const ct = req.headers.get('content-type');
  if (ct) headers.set('content-type', ct);
  const accept = req.headers.get('accept');
  if (accept) headers.set('accept', accept);
  const auth = req.headers.get('authorization');
  if (auth) headers.set('authorization', auth);
  const xUser = req.headers.get('x-user-id');
  if (xUser) headers.set('x-user-id', xUser);

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'follow',
    cache: 'no-store',
    next: { revalidate: 0 },
  };

  const resp = await fetch(url, init);
  const body = await resp.arrayBuffer();
  const outHeaders = new Headers();
  const respCT = resp.headers.get('content-type');
  if (respCT) outHeaders.set('content-type', respCT);
  return new Response(body, { status: resp.status, headers: outHeaders });
}

export async function GET(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx.params);
}
export async function POST(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx.params);
}
export async function PUT(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx.params);
}
export async function PATCH(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx.params);
}
export async function DELETE(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx.params);
}
