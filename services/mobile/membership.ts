import { urls } from '@/services/config';
import { requestJson } from '@/services/http';

export type Membership = {
  status: string;
  membershipType: string | null;
  startDate?: string;
  nextPayment?: string;
  endDate?: string;
  manageUrl?: string;
};

export function getMembership(token: string): Promise<Membership> {
  return requestJson<Membership>(`${urls.mobile}/membership`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
