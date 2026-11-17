import { submitOrder } from '@/server/hospitality';
import { handleRequest, requestBody } from '@/server/http';

export const runtime = 'nodejs';

export function POST(request: Request) {
  return handleRequest(async () => submitOrder(await requestBody(request)), 201);
}
