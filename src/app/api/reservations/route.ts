import { checkReservation, submitReservation } from '@/server/hospitality';
import { handleRequest, requestBody } from '@/server/http';

export const runtime = 'nodejs';

export function POST(request: Request) {
  return handleRequest(async () => submitReservation(await requestBody(request)), 201);
}

export function GET(request: Request) {
  return handleRequest(() => checkReservation(new URL(request.url).searchParams.get('id')));
}
