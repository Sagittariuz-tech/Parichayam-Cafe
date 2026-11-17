import { submitOrder } from '@/server/hospitality';
import { retryOrderWrite } from '@/server/database';
import { handleRequest, requestBody } from '@/server/http';

export const runtime = 'nodejs';

export function POST(request: Request) {
  return handleRequest(async () => {
    const input = await requestBody(request);
    return retryOrderWrite(() => submitOrder(input));
  }, 201);
}
