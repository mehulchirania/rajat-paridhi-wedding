import type { Content } from '../lib/data';
import type { Issue } from '../../shared/validate';
import { store } from '../lib/storage';

const TK = 'admin-token';
export const getToken = () => store.get(TK);
export const setToken = (t: string) => store.set(TK, t);
export const clearToken = () => store.set(TK, '');

export interface HistoryItem { rev: number; at: string; note: string; kind: 'save' | 'reset' | 'restore' }
export interface AdminState { rev: number; at: string | null; content: Content | null; history: HistoryItem[] }

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: { issues?: Issue[]; rev?: number }) { super(message); }
}

async function call<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch { throw new ApiError(0, 'No connection. Check your internet and try again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error || `Something went wrong (${res.status}).`, data);
  return data as T;
}

export const api = {
  login: (username: string, password: string) => call<{ token: string }>('POST', '/api/admin/login', { username, password }, false),
  state: () => call<AdminState>('GET', '/api/admin/content'),
  publish: (baseRev: number, content: Content, note: string) => call<{ rev: number; content: Content }>('PUT', '/api/admin/content', { baseRev, content, note }),
  reset: (baseRev: number) => call<{ rev: number }>('DELETE', '/api/admin/content', { baseRev }),
  restore: (rev: number) => call<{ rev: number }>('POST', '/api/admin/restore', { rev }),
};
