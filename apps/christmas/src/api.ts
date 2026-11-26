import type { ChildId } from './data';

export type Wish = { id: string; name: string; icon: string; favorite: boolean };
export type VillageState = { wishes: Wish[]; completed: number[]; opened: number[] };
export type DiaryEntry = { id: string; child: ChildId; day: string; note: string; hasPhoto: boolean; hasAudio: boolean };
export type ParentWish = Wish & { child: ChildId; purchased: boolean };

export function familyToday() {
  const parts = Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const data = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return data.year + '-' + data.month + '-' + data.day;
}

export async function requestApi<T>(path: string, options: {
  method?: string;
  body?: unknown;
  form?: FormData;
  parentKey?: string;
} = {}): Promise<T> {
  const base = window.location.pathname.endsWith('/') ? window.location.href : new URL('./', window.location.href).href;
  const uri = new URL('api/' + path.replace(/^\/+/, ''), base);
  const headers: Record<string, string> = {};
  if (options.parentKey) headers['X-Parent-Key'] = options.parentKey;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(uri.toString(), {
    method: options.method || 'GET', headers,
    body: options.form || (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const info = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(info?.error || 'Request failed (' + res.status + ').');
  }
  return await res.json() as T;
}
export async function getMedia(id: string, kind: 'photo' | 'audio'): Promise<string> {
  const base = window.location.pathname.endsWith('/') ? window.location.href : new URL('./', window.location.href).href;
  const url = new URL('api/media/' + id + '/' + kind, base);
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
  if (!res.ok) throw new Error('Unable to load the recording.');
  return URL.createObjectURL(await res.blob());
}
