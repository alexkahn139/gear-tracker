import type { ApiError } from './types.js';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function query(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== '',
  );
  if (entries.length === 0) {
    return '';
  }
  const qs = new URLSearchParams(
    entries.map(([key, value]) => [key, String(value)]),
  ).toString();
  return `?${qs}`;
}

function toBody(value: unknown): BodyInit | undefined {
  return value == null ? undefined : JSON.stringify(value);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body != null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  let res: Response;
  try {
    res = await fetch(path, { credentials: 'same-origin', ...init, headers });
  } catch {
    throw new ApiRequestError(0, 'Network error: could not reach the server');
  }

  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    let details: unknown;
    try {
      const body = (await res.json()) as Partial<ApiError>;
      if (typeof body.error === 'string' && body.error.length > 0) {
        message = body.error;
      }
      details = body.details;
    } catch {
      // response body was not JSON; keep the fallback message.
    }
    throw new ApiRequestError(res.status, message, details);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (text.length === 0) {
    return undefined as T;
  }
  const parsed = JSON.parse(text) as { data?: T };
  return (parsed.data ?? (parsed as T)) as T;
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: toBody(body) }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: toBody(body) }),
  del: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
};
