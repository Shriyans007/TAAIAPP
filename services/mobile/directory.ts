import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import type { DirectoryResponse } from '@/types/directory';

export function getMemberDirectory(token: string, signal?: AbortSignal) {
  return requestJson<DirectoryResponse>(
    `${urls.mobile}/directory`,
    { headers: { Authorization: `Bearer ${token}` } },
    signal,
  );
}
