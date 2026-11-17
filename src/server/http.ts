import { NextResponse } from 'next/server';

export class RequestError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export async function handleRequest<T>(action: () => T | Promise<T>, status = 200) {
  try {
    return NextResponse.json(await action(), { status, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Café service request failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'The café service is temporarily unavailable. Please try again.' }, { status: 500 });
  }
}

export async function requestBody(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new RequestError('Send the form as JSON.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError('The form is empty.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw new RequestError('This form is too large.', 413);
    }
    chunks.push(value);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new RequestError('This form could not be read.');
  }
}

export function reference(value: unknown) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new RequestError('Enter a valid reference.');
  }
  return value.toLowerCase();
}

export function count(value: unknown, limit: number, label: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > limit) {
    throw new RequestError(label + ' must be between 1 and ' + limit + '.');
  }
  return value;
}

export function textField(value: unknown, limit: number, label: string, required = false) {
  if (!required && value === undefined) return '';
  if (typeof value !== 'string' || value.trim().length > limit || (required && !value.trim())) {
    throw new RequestError(label + ' must be ' + (required ? 'between 1 and ' + limit : 'at most ' + limit) + ' characters.');
  }
  return value.trim();
}
