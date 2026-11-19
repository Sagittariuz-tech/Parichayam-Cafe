import { NextResponse } from 'next/server';
import { validCredentials, setOwnerSession, clearOwnerSession } from '@/server/owner-session';
import { requestBody } from '@/server/http';
export const runtime = 'nodejs';
function sameOrigin(request: Request) { const origin = request.headers.get('origin'); if (!origin) return false; try { return new URL(origin).host === request.headers.get('host'); } catch { return false; } }
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin not allowed.' }, { status: 403 });
  try {
    const input = await requestBody(request);
    const role = typeof input.role === 'string' ? input.role : 'owner'; if (!['owner','staff','developer'].includes(role) || !validCredentials(input.email, input.password, role)) return NextResponse.json({ error: 'The email or password is incorrect.' }, { status: 401 });
    await clearOwnerSession(); await setOwnerSession(new URL(request.url).protocol === 'https:', role);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Please enter your login details.' }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin not allowed.' }, { status: 403 });
  await clearOwnerSession();
  return NextResponse.json({ ok: true });
}

