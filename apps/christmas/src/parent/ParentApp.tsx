import { useEffect, useState } from 'react';

type Child = 'emma' | 'sophie' | 'adam';
type Wish = { id: string; child: Child; icon: string; name: string; favorite: boolean; purchased: boolean };
type DiaryEntry = { id: string; child: Child; day: string; note: string; hasPhoto: boolean; hasAudio: boolean };
type View = 'wishes' | 'diary';

const CHILDREN: { id: Child; name: string; icon: string }[] = [
  { id: 'emma', name: 'Emma', icon: '🦌' },
  { id: 'sophie', name: 'Sophie', icon: '🧝' },
  { id: 'adam', name: 'Adam', icon: '☃️' },
];

const currentYear = Number(Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', year: 'numeric' }).format(new Date()));

async function parentRequest<T>(path: string, options: { method?: string; data?: unknown } = {}): Promise<T> {
  const response = await fetch('/christmas/api/parent/' + path, {
    method: options.method || 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.data !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.data === undefined ? undefined : JSON.stringify(options.data),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || (response.status === 401
      ? 'Your Google session expired. Refresh the page to sign in again.'
      : 'Could not load family data (' + response.status + ').'));
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Your Google session expired. Refresh the page to sign in again.');
  }
  return response.json() as Promise<T>;
}

function DiaryMedia({ entry, kind }: { entry: DiaryEntry; kind: 'photo' | 'audio' }) {
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let open = true;
    let objectUrl = '';
    setSource('');
    setError('');
    fetch('/christmas/api/parent/media/' + encodeURIComponent(entry.id) + '/' + kind, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
      cache: 'no-store',
    }).then(async response => {
      if (!response.ok) throw new Error('Unable to load ' + kind + '.');
      return response.blob();
    }).then(blob => {
      objectUrl = URL.createObjectURL(blob);
      if (open) setSource(objectUrl);
      else URL.revokeObjectURL(objectUrl);
    }).catch(err => { if (open) setError(err instanceof Error ? err.message : 'Media unavailable.'); });
    return () => {
      open = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [entry.id, kind]);
  if (error) return <p className="pd-media-error" role="status">{error}</p>;
  if (!source) return <p className="pd-media-loading">Loading {kind}…</p>;
  if (kind === 'photo') return <img src={source} loading="lazy" className="pd-photo" alt={'Glitter discovered by ' + entry.child} />;
  return <audio className="pd-audio" controls preload="none" src={source} aria-label={entry.child + ' voice recording'} />;
}

export default function ParentApp() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('wishes');
  const [filter, setFilter] = useState<'all' | Child>('all');
  const [year, setYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState('');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const days = Array.from(new Set(diary.filter(entry => filter === 'all' || entry.child === filter).map(entry => entry.day))).sort().reverse();
  const activeDay = days.includes(selectedDay) ? selectedDay : days[0];
  const visibleChildren = filter === 'all' ? CHILDREN : CHILDREN.filter(child => child.id === filter);

  // Cloudflare Access handles Google login before the page loads.
  // Every parent API request independently verifies its signed assertion.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await parentRequest<{ email: string }>('session');
        if (!active) return;
        setEmail(session.email);
        const [wishData, diaryData] = await Promise.all([
          parentRequest<{ wishes: Wish[] }>('wishes'),
          parentRequest<{ entries: DiaryEntry[] }>('diary?year=' + year),
        ]);
        if (!active) return;
        setWishes(wishData.wishes);
        setDiary(diaryData.entries);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to open the dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function refresh(selectedYear = year) {
    if (!email) return;
    setBusy(true); setError('');
    try {
      const [wishData, diaryData] = await Promise.all([
        parentRequest<{ wishes: Wish[] }>('wishes'),
        parentRequest<{ entries: DiaryEntry[] }>('diary?year=' + selectedYear),
      ]);
      setWishes(wishData.wishes);
      setDiary(diaryData.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh the dashboard.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!email) return;
    let active = true;
    parentRequest<{ entries: DiaryEntry[] }>('diary?year=' + year)
      .then(result => { if (active) { setDiary(result.entries); setError(''); } })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Unable to load the selected year.'); });
    return () => { active = false; };
  }, [year, email]);

  async function togglePurchased(wish: Wish) {
    setError('');
    try {
      await parentRequest('wishes/' + encodeURIComponent(wish.id), {
        method: 'PATCH', data: { purchased: !wish.purchased },
      });
      setWishes(current => current.map(item =>
        item.id === wish.id ? { ...item, purchased: !wish.purchased } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this purchase.');
    }
  }

  return <div className="pd-shell">
    <header className="pd-header">
      <div className="pd-brand"><span className="pd-brand-icon">🎄</span><div>
        <span className="pd-kicker">CHRISTMAS VILLAGE</span><h1>Parent Dashboard</h1>
      </div></div>
      {email && <a className="pd-text-button" href="/cdn-cgi/access/logout">🔒 Sign out</a>}
    </header>
    <main className="pd-main">
      {loading ? <section className="pd-login">
        <div className="pd-big-icon">🎄</div><h2>Signing in with Google…</h2>
        <p>Checking your family dashboard access.</p>
      </section> : !email ? <section className="pd-login">
        <div className="pd-big-icon">🔒</div><h2>Google sign-in required</h2>
        <p>The parent dashboard is private. Sign in using an approved family Google account.</p>
        {error && <p className="pd-error" role="alert">{error}</p>}
        <a className="pd-primary" href="/christmas/parent/">Try again</a>
      </section> : <>
        <p className="pd-signed-in">Signed in with Google: <strong>{email}</strong></p>
        <div className="pd-heading">
          <div><span className="pd-kicker">FAMILY CHRISTMAS MEMORIES</span>
            <h2>{view === 'wishes' ? 'Santa’s Wish Lists' : 'Glitter’s Diary'}</h2>
            <p>Everything the kids save is available here from your phone.</p>
          </div>
          <button className="pd-refresh" disabled={busy} onClick={() => void refresh()}>
            {busy ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
        <nav className="pd-tabs" aria-label="Parent dashboard views">
          <button className={view === 'wishes' ? 'selected' : ''} onClick={() => setView('wishes')}>🎁 Wish Lists</button>
          <button className={view === 'diary' ? 'selected' : ''} onClick={() => setView('diary')}>📖 Glitter’s Diary</button>
        </nav>
        <div className="pd-controls" role="group" aria-label="Filter by child">
          {([{ id: 'all', name: 'All kids', icon: '👨‍👩‍👧‍👦' }, ...CHILDREN] as const).map(child =>
            <button key={child.id} className={filter === child.id ? 'active' : ''}
              onClick={() => { setFilter(child.id); setSelectedDay(''); }}>
              {child.icon} {child.name}
            </button>)}
          {view === 'diary' && <label className="pd-year">Year
            <select value={year} onChange={event => { setYear(Number(event.target.value)); setSelectedDay(''); }}>
              {Array.from({ length: currentYear - 2025 }, (_, i) => currentYear - i)
                .map(value => <option value={value} key={value}>{value}</option>)}
            </select>
          </label>}
        </div>
        {error && <p className="pd-error" role="alert">{error}</p>}
        {view === 'wishes' ? <div className="pd-wish-grid">
          {visibleChildren.map(child => {
            const items = wishes.filter(wish => wish.child === child.id);
            return <section className="pd-card" key={child.id}>
              <div className="pd-card-title"><span>{child.icon}</span><div>
                <h3>{child.name}'s list</h3>
                <p>{items.length} {items.length === 1 ? 'wish' : 'wishes'} · {items.filter(w => w.purchased).length} purchased</p>
              </div></div>
              {items.length === 0 ? <p className="pd-empty">No wishes yet.</p> :
                <div className="pd-items">{items.map(wish => <label className="pd-wish" key={wish.id}>
                  <input type="checkbox" checked={wish.purchased}
                    onChange={() => void togglePurchased(wish)} aria-label={'Mark purchased: ' + wish.name} />
                  <span className="pd-wish-icon">{wish.icon}</span>
                  <span className="pd-wish-text"><strong>{wish.name}</strong>{wish.favorite && <small>⭐ Top wish</small>}</span>
                  <span className={wish.purchased ? 'pd-purchased' : 'pd-unpurchased'}>
                    {wish.purchased ? 'Purchased' : 'Not yet'}
                  </span>
                </label>)}</div>}
            </section>;
          })}
        </div> : <section className="pd-card pd-diary">
          <div className="pd-card-title"><span>📅</span><div>
            <h3>Glitter’s adventures · {year}</h3>
            <p>Choose a day to see everyone's pictures, notes, and actual voice recordings.</p>
          </div></div>
          {days.length === 0 ? <p className="pd-empty">No diary entries found for this year and profile.</p> : <>
            <div className="pd-day-picker" role="group" aria-label="Choose diary day">
              {days.map(day => <button key={day} className={activeDay === day ? 'selected' : ''}
                onClick={() => setSelectedDay(day)}>
                {new Date(day + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>)}
            </div>
            <h3 className="pd-day-heading">{new Date(activeDay + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}</h3>
            <div className="pd-diary-grid">{visibleChildren.map(child => {
              const entry = diary.find(item => item.child === child.id && item.day === activeDay);
              return <article className="pd-entry" key={child.id}>
                <h4>{child.icon} {child.name}</h4>
                {!entry ? <p className="pd-empty">No entry for this day.</p> : <>
                  {entry.hasPhoto && <DiaryMedia key={entry.id + '-photo'} entry={entry} kind="photo" />}
                  {entry.note && <p className="pd-note-text">{entry.note}</p>}
                  {entry.hasAudio && <DiaryMedia key={entry.id + '-audio'} entry={entry} kind="audio" />}
                </>}
              </article>;
            })}</div>
          </>}
        </section>}
        <p className="pd-footnote">Purchase status is private. Children never see it in Christmas Village.</p>
      </>}
    </main>
    <footer className="pd-footer">Christmas Village · Family Dashboard</footer>
  </div>;
}
