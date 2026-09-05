export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const data = body as { message?: string; code?: string } | null;
    throw new ApiError(
      data?.message ?? 'TAAI is temporarily unavailable. Please try again.',
      response.status,
      data?.code,
    );
  }
  return body as T;
}
