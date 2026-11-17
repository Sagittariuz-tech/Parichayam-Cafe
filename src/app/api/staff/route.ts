import { authorizeStaff, staffQueue, updateStaffQueue } from '@/server/hospitality';
import { handleRequest, requestBody } from '@/server/http';

export const runtime = 'nodejs';

export function GET(request: Request) {
  return handleRequest(() => {
    authorizeStaff(request);
    return staffQueue();
  });
}

export function PATCH(request: Request) {
  return handleRequest(async () => {
    authorizeStaff(request);
    return updateStaffQueue(await requestBody(request));
  });
}
