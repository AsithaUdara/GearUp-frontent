import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function getGatewayBase(): string {
  const gw = (process.env.NEXT_PUBLIC_GATEWAY_BASE as string | undefined)?.trim();
  const alt = (process.env.NEXT_PUBLIC_API_BASE as string | undefined)?.trim();
  return (gw || alt || 'http://localhost:8080').replace(/\/$/, '');
}

function getDirectServiceBase(): string {
  const direct = (process.env.NEXT_PUBLIC_API_BASE_VEHICLE as string | undefined)?.trim() || 'http://localhost:8083';
  return direct.replace(/\/$/, '');
}

function getTargetBase(): { url: string; viaGateway: boolean; fallbackUrl: string } {
  const useGateway = (process.env.NEXT_PUBLIC_USE_GATEWAY as string | undefined) !== '0';
  const gw = `${getGatewayBase()}/api/vehicles`;
  const direct = `${getDirectServiceBase()}/api/vehicles`;
  if (useGateway) return { url: gw, viaGateway: true, fallbackUrl: direct };
  return { url: direct, viaGateway: false, fallbackUrl: gw };
}

async function proxy(req: NextRequest, params: { path?: string[] }) {
  const { url: base, viaGateway, fallbackUrl } = getTargetBase();
  const suffix = (params.path || []).join('/');
  const qs = req.nextUrl.search || '';
  const url = `${base}${suffix ? '/' + suffix : ''}${qs}`;

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

  try {
    console.log(`[vehicles-proxy] ${req.method} ${url}`);
    const resp = await fetch(url, init);
    console.log(`[vehicles-proxy] response status: ${resp.status}`);
    const body = await resp.arrayBuffer();
    const outHeaders = new Headers();
    const respCT = resp.headers.get('content-type');
    if (respCT) outHeaders.set('content-type', respCT);
    return new Response(body, { status: resp.status, headers: outHeaders });
  } catch (err) {
    // If gateway path failed and we intended to use gateway, try direct service as a soft fallback
    if (viaGateway) {
      const alt = `${fallbackUrl}${suffix ? '/' + suffix : ''}${qs}`;
      try {
        console.warn(`[vehicles-proxy] primary failed, retrying direct service: ${alt}`);
        const resp = await fetch(alt, init);
        const body = await resp.arrayBuffer();
        const outHeaders = new Headers();
        const respCT = resp.headers.get('content-type');
        if (respCT) outHeaders.set('content-type', respCT);
        return new Response(body, { status: resp.status, headers: outHeaders });
      } catch (e2) {
        console.error(`[vehicles-proxy] fallback fetch error for ${alt}:`, e2);
      }
    }
    console.error(`[vehicles-proxy] fetch error for ${url}:`, err);
    return new Response(JSON.stringify({ error: 'Backend service unavailable', details: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, params);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, params);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, params);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, params);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, params);
}
