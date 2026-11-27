import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CHILDREN } from './data';
import type { ChildId, Tab } from './data';
import { familyToday, getMedia, nativeChristmas, requestApi } from './api';
import type { DiaryEntry, Wish } from './api';

type SpeechResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechEngine = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechCtor = new () => SpeechEngine;
function speechConstructor(): SpeechCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export function SantaWishlist({ child, wishes, onAdd, onFavorite, onRemove }: {
  child: string;
  wishes: Wish[];
  onAdd: (name: string, icon: string) => Promise<void>;
  onFavorite: (wish: Wish) => Promise<void>;
  onRemove: (wish: Wish) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [entryMode, setEntryMode] = useState<'keyboard' | 'microphone' | null>(null);
  const [listening, setListening] = useState(false);
  const [review, setReview] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const recognition = useRef<SpeechEngine | null>(null);
  const keyboardInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { recognition.current?.stop(); }, []);
  useEffect(() => {
    if (entryMode === 'keyboard') keyboardInput.current?.focus();
  }, [entryMode]);
  useEffect(() => {
    function onNativeDictation(event: Event) {
      const result = (event as CustomEvent<{ text?: string; error?: string }>).detail;
      setListening(false);
      if (result?.text) {
        setEntryMode('microphone');
        setName(result.text.slice(0, 100));
        setReview(true);
        setError('');
      } else {
        setError(result?.error || 'Speech recognition was cancelled. You can use the keyboard instead.');
      }
    }
    window.addEventListener('christmas-native-dictation', onNativeDictation);
    return () => window.removeEventListener('christmas-native-dictation', onNativeDictation);
  }, []);

  function chooseKeyboard() {
    if (!nativeChristmas()) recognition.current?.stop();
    setListening(false);
    setReview(false);
    setEntryMode('keyboard');
    setError('');
  }
  function startMic() {
    if (saving) return;
    setEntryMode('microphone');
    setName('');
    setReview(false);
    setError('');
    const native = nativeChristmas();
    if (native) {
      try { setListening(true); native.dictateWish(); }
      catch { setListening(false); setError('Unable to start voice input. Tap Keyboard instead.'); }
      return;
    }
    const Ctor = speechConstructor();
    if (!Ctor) {
      setListening(false);
      setError('Microphone input is unavailable in this browser. Tap Keyboard instead.');
      return;
    }
    try {
      const mic = new Ctor();
      recognition.current = mic;
      mic.lang = 'en-US';
      mic.interimResults = false;
      mic.onresult = event => {
        const heard = Array.from(event.results).map(x => x[0]?.transcript || '').join(' ').trim();
        if (heard) { setName(heard.slice(0, 100)); setReview(true); setError(''); }
      };
      mic.onerror = event => { setError('Microphone: ' + event.error + '. Try Keyboard instead.'); setListening(false); };
      mic.onend = () => setListening(false);
      mic.start();
      setListening(true);
    } catch {
      setListening(false);
      setError('The microphone could not be started. Tap Keyboard instead.');
    }
  }
  function cancelEntry() {
    if (!nativeChristmas()) recognition.current?.stop();
    setListening(false);
    setEntryMode(null);
    setName('');
    setReview(false);
    setError('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Tell Santa what you wish for!'); return; }
    setSaving(true); setError('');
    try {
      await onAdd(name.trim(), '🎁');
      setName('');
      setReview(false);
      setEntryMode(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save wish.'); }
    finally { setSaving(false); }
  }

  return (
    <section className="wishlist-simplified">
      <div className="content-heading">
        <span className="eyebrow">LETTERS TO THE NORTH POLE</span>
        <h2>Santa’s Wish List</h2>
        <p>How would you like to tell Santa what you want?</p>
      </div>
      <div className="wishlist-entry-card">
        <div className="wishlist-methods" role="group" aria-label="Choose how to add a wish">
          <button type="button" className={'wishlist-method keyboard' + (entryMode === 'keyboard' ? ' selected' : '')}
            aria-pressed={entryMode === 'keyboard'} onClick={chooseKeyboard} disabled={saving}>
            <span className="wishlist-method-icon" aria-hidden="true">⌨️</span>
            <strong>Keyboard</strong><small>Type a wish</small>
          </button>
          <button type="button" className={'wishlist-method microphone' + (entryMode === 'microphone' ? ' selected' : '') + (listening ? ' recording' : '')}
            aria-pressed={entryMode === 'microphone'} onClick={startMic} disabled={saving}>
            <span className="wishlist-method-icon" aria-hidden="true">🎤</span>
            <strong>Microphone</strong><small>{listening ? 'Listening…' : 'Say a wish'}</small>
          </button>
        </div>
        {listening && <p className="inline-feedback" role="status">
          Listening… say your wish! {nativeChristmas() ? 'Finish speaking in the microphone prompt.' : ''}
        </p>}
        {entryMode === 'microphone' && review && <p className="inline-feedback" role="status">
          I heard: “{name}”. Check it before saving!
        </p>}
        {(entryMode === 'keyboard' || review) && <form className="wishlist-draft" onSubmit={submit}>
          <label htmlFor="wish-name">{review ? 'Check your wish' : 'Type your Christmas wish'}</label>
          <input ref={keyboardInput} id="wish-name" value={name} maxLength={100}
            placeholder="I would love…" autoComplete="off"
            onChange={e => { setName(e.target.value); setError(''); }} />
          <div className="wishlist-draft-actions">
            <button className="action" type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : '🎁 Add to my list'}
            </button>
            <button className="action secondary" type="button" onClick={cancelEntry} disabled={saving}>Cancel</button>
          </div>
        </form>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>

      <div className="wish-list-card wishlist-current-list">
        <div className="section-row"><div><h3>🎄 {child}’s wishes</h3><p>{wishes.length} wishes so far</p></div></div>
        {wishes.length === 0 ? <div className="empty-wishes"><div>🎅</div>
          <strong>No wishes yet!</strong><p>Tap Keyboard or Microphone to add your first wish.</p></div> :
          <div className="wish-items">{wishes.map(wish =>
            <div className="wish-item" key={wish.id}>
              <span className="wish-emoji">{wish.icon}</span>
              <span className="wish-name">{wish.name}{wish.favorite && <small>⭐ Top wish</small>}</span>
              <button type="button" className={'small-icon ' + (wish.favorite ? 'hearted' : '')}
                aria-label={'Favorite ' + wish.name} aria-pressed={wish.favorite}
                onClick={() => onFavorite(wish).catch(e => setError(String(e)))}>★</button>
              <button type="button" className="small-icon remove" aria-label={'Remove ' + wish.name}
                onClick={() => { if (confirm('Remove ' + wish.name + '?')) onRemove(wish).catch(e => setError(String(e))); }}>×</button>
            </div>)}</div>}
        <p className="storage-note">☁️ Saved to the family’s shared Christmas list. Grown-up gift purchases are kept private.</p>
      </div>
    </section>
  );
}

const SURPRISES: { type: 'Joke' | 'Game' | 'Activity' | 'Story'; icon: string; title: string; detail: string; go?: Tab }[] = [
  { type:'Joke',icon:'☃️',title:'Snow joke',detail:'What do snowmen eat for breakfast? Frosted Flakes!' },
  { type:'Activity',icon:'✂️',title:'Paper snowflakes',detail:'Fold a piece of paper and ask a grown-up to help cut a beautiful snowflake.',go:'activities' },
  { type:'Story',icon:'🦌',title:'The little reindeer',detail:'A young reindeer practiced every evening. One snowy night, her careful steps helped guide her friends home.' },
  { type:'Game',icon:'🎄',title:'Picture Match',detail:'Can you find all the matching Christmas pictures?',go:'games' },
  { type:'Joke',icon:'🍪',title:'Cookie joke',detail:'Why did the gingerbread man go to the doctor? He was feeling crummy!' },
  { type:'Activity',icon:'💌',title:'Kindness delivery',detail:'Make a little card for someone and surprise them with it.',go:'activities' },
  { type:'Story',icon:'⭐',title:'The lost star',detail:'A tiny star slipped from a garland. The children hung it back up, where it made the whole room sparkle.' },
  { type:'Game',icon:'🎁',title:'Count presents',detail:'Try the counting game and see how many presents you can spot.',go:'games' },
  { type:'Joke',icon:'🦌',title:'Reindeer joke',detail:'What do reindeer say before telling a joke? This one will sleigh you!' },
  { type:'Activity',icon:'🔗',title:'Make a paper chain',detail:'Connect colorful paper loops to decorate a doorway.',go:'activities' },
  { type:'Story',icon:'🧤',title:'The mitten mystery',detail:'One mitten went missing. A friendly puppy led the children to its hiding place beneath the couch.' },
  { type:'Game',icon:'🔔',title:'Christmas Quiz',detail:'Test your Christmas knowledge with a quick quiz.',go:'games' },
  { type:'Joke',icon:'🎄',title:'Tree joke',detail:'Why was the Christmas tree so bad at sewing? It kept dropping its needles!' },
  { type:'Activity',icon:'🍪',title:'Cookie art',detail:'Decorate a cookie with a grown-up or draw your dream cookie.',go:'activities' },
  { type:'Story',icon:'🕯️',title:'The cozy night',detail:'The wind whistled outside. Inside, everyone shared stories under a warm blanket and listened to the twinkling lights.' },
  { type:'Game',icon:'🧩',title:'Match challenge',detail:'Try the tricky six-pair Christmas memory game!',go:'games' },
  { type:'Joke',icon:'🎅',title:'Santa joke',detail:'What is Santa’s favorite kind of music? Wrap music!' },
  { type:'Activity',icon:'🎵',title:'Holiday dance',detail:'Make up your own holiday dance and teach it to someone.',go:'activities' },
  { type:'Story',icon:'🎀',title:'The red ribbon',detail:'A ribbon kept escaping its gift. Finally, a tiny bow held fast, and the present was ready for its surprise.' },
  { type:'Game',icon:'⛄',title:'Counting adventure',detail:'Count the snowmen and stars in the Christmas games!',go:'games' },
  { type:'Joke',icon:'❄️',title:'Snowflake joke',detail:'What is a snowflake’s favorite snack? Ice crispies!' },
  { type:'Activity',icon:'❤️',title:'A secret kindness',detail:'Do something helpful for someone without being asked.',go:'activities' },
  { type:'Story',icon:'🧸',title:'The toy workshop',detail:'The toys were almost ready. Every little helper put one final ribbon in place and cheered together.' },
  { type:'Activity',icon:'🕯️',title:'Christmas Eve',detail:'Choose a special tradition to do with your family tonight.',go:'activities' },
];

export function AdventCalendar({ child, opened, onOpen, goTo, enabled }: {
  child: ChildId; opened: number[]; onOpen: (day: number) => Promise<void>;
  goTo: (tab: Tab) => void; enabled: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const today = familyToday();
  const [year, month, day] = today.split('-').map(Number);
  const activeSeason = month === 12 && day <= 25;
  const unlocked = (d: number) => activeSeason && d <= day;
  const daysLeft = activeSeason ? Math.max(0, 25 - day) :
    month < 12 ? Math.ceil((Date.UTC(year, 11, 25) - Date.UTC(year, month - 1, day)) / 86400000) :
    Math.ceil((Date.UTC(year + 1, 11, 25) - Date.UTC(year, month - 1, day)) / 86400000);
  return (
    <section className="advent-section" aria-label="Christmas countdown and daily surprises">
      <div className="section-row"><div><span className="eyebrow">THE COUNTDOWN</span>
        <h2>{daysLeft === 0 ? 'Merry Christmas!' : daysLeft + ' days until Christmas!'}</h2>
        <p>Open one new surprise every day from December 1 through 24.</p></div><span className="advent-bell">🔔</span></div>
      <div className="advent-grid">
        {SURPRISES.map((s, i) => {
          const n = i + 1, ready = unlocked(n), seen = opened.includes(n);
          return <button key={n} disabled={!ready || !enabled} className={'advent-door ' + (seen ? 'opened' : '')}
            aria-label={'December ' + n + (ready ? ', ' + (seen ? 'revisit surprise' : 'open surprise') : ', locked')}
            onClick={async () => { setError(''); try { await onOpen(n); setSelected(n); } catch (e) { setError(e instanceof Error ? e.message : 'Could not open door.'); } }}>
            <span className="door-number">{n}</span><span className="door-icon">{seen ? s.icon : ready ? '🎁' : '🔒'}</span>
          </button>;
        })}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!enabled && <p className="storage-note">Connect your family storage to track the surprises you’ve opened.</p>}
      {selected !== null && <div className="surprise-overlay" role="dialog" aria-modal="true" aria-label="Daily Christmas surprise">
        <div className="surprise-panel">
          <button className="close-surprise" onClick={() => setSelected(null)} aria-label="Close surprise">×</button>
          <div className="surprise-emoji">{SURPRISES[selected - 1].icon}</div>
          <span className="eyebrow">DECEMBER {selected} · {SURPRISES[selected - 1].type.toUpperCase()}</span>
          <h3>{SURPRISES[selected - 1].title}</h3><p>{SURPRISES[selected - 1].detail}</p>
          {SURPRISES[selected - 1].go && <button className="action" onClick={() => { goTo(SURPRISES[selected - 1].go!); setSelected(null); }}>Let’s go →</button>}
          <button className="pill" onClick={() => setSelected(null)}>Close</button>
        </div>
      </div>}
    </section>
  );
}

function MediaPreview({ id, kind }: { id: string; kind: 'photo' | 'audio' }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    let current = '';
    getMedia(id, kind).then(url => {
      if (active) { current = url; setSrc(url); } else URL.revokeObjectURL(url);
    }).catch(() => { if (active) setSrc(''); });
    return () => { active = false; if (current) URL.revokeObjectURL(current); };
  }, [id, kind]);
  if (!src) return <span className="media-loading">Loading {kind}…</span>;
  return kind === 'photo' ? <img className="diary-photo" src={src} alt="Glitter’s hiding place" /> :
    <audio controls preload="none" src={src} aria-label="Child’s Glitter voice message" />;
}

export function GlitterDiary({ child, ready }: { child: ChildId; ready: boolean }) {
  const today = familyToday();
  const currentYear = Number(today.slice(0, 4));
  const [year, setYear] = useState(currentYear);
  const [day, setDay] = useState(today.slice(0, 4) + '-' + today.slice(5));
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [audioPreview, setAudioPreview] = useState('');
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mediaRevision, setMediaRevision] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const saved = entries.find(item => item.day === day && item.child === child);
  const minDate = year + '-11-01', maxDate = year === currentYear ? (today < year + '-12-25' ? today : year + '-12-25') : year + '-12-25';

  async function refresh() {
    if (!ready) return;
    try {
      const data = await requestApi<{ entries: DiaryEntry[] }>('diary?year=' + year);
      setEntries(data.entries); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load diary.'); }
  }
  useEffect(() => { void refresh(); }, [year, ready]);
  useEffect(() => { setNote(saved?.note || ''); setPhoto(null); setAudio(null); setMessage(''); }, [child, day, saved?.id, saved?.note]);
  useEffect(() => {
    if (!photo) { setPhotoPreview(''); return; }
    const url = URL.createObjectURL(photo); setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!audio) { setAudioPreview(''); return; }
    const url = URL.createObjectURL(audio); setAudioPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  useEffect(() => () => { recorder.current?.stop(); stream.current?.getTracks().forEach(t => t.stop()); }, []);

  async function record() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not available on this device/browser. You can type instead.'); return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
      const r = new MediaRecorder(media, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        const type = (r.mimeType || 'audio/webm').split(';')[0];
        const file = new File(chunks, 'glitter-voice', { type });
        setAudio(file);
        setRecording(false);
        media.getTracks().forEach(t => t.stop());
        stream.current = null;
      };
      r.onerror = () => { setRecording(false); setError('Recording failed. Please try again.'); };
      recorder.current = r;
      setAudio(null); setError(''); r.start(); setRecording(true);
    } catch { setError('Microphone permission was denied or unavailable. You can type a message instead.'); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (recording) { setError('Stop recording before saving.'); return; }
    if (!photo && !audio && !note.trim() && !saved) { setError('Add a photo, a recording, or a note.'); return; }
    const form = new FormData();
    form.set('child', child); form.set('day', day); form.set('note', note);
    if (photo) form.set('photo', photo);
    if (audio) form.set('audio', audio);
    setSaving(true); setError(''); setMessage('');
    try {
      await requestApi('diary', { method: 'POST', form });
      await refresh(); setMediaRevision(x => x + 1); setPhoto(null); setAudio(null); setMessage('Saved to Glitter’s Diary!');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save diary entry.'); }
    finally { setSaving(false); }
  }
  function changeYear(next: number) {
    setYear(next);
    setDay(next === currentYear ? today : next + '-12-25');
  }
  return (
    <section className="diary-section">
      <div className="content-heading"><span className="eyebrow">GLITTER’S ADVENTURES</span><h2>Glitter’s Diary 🧝‍♀️</h2>
        <p>Emma, Sophie, and Adam each get their own photo, voice message, and note every day.</p></div>
      <div className="diary-layout">
        <div className="wishlist-form-card">
          <div className="section-row"><h3>📸 {CHILDREN.find(c => c.id === child)?.name}’s discovery</h3>
            <select aria-label="Diary year" value={year} onChange={e => changeYear(Number(e.target.value))}>
              {Array.from({ length: currentYear - 2025 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <label className="field-label" htmlFor="glitter-day">The day you found Glitter</label>
          <input className="diary-date" id="glitter-day" type="date" value={day} min={minDate} max={maxDate} onChange={e => setDay(e.target.value)} />
          <form onSubmit={save}>
            <label className="field-label" htmlFor="glitter-photo">Take a picture of Glitter</label>
            <input id="glitter-photo" type="file" accept="image/*" capture="environment"
              onChange={e => setPhoto(e.target.files?.[0] || null)} />
            {photoPreview && <img className="diary-photo" alt="New photo of Glitter" src={photoPreview} />}
            {saved?.hasPhoto && !photo && <p className="inline-feedback">Existing picture saved. A new one will replace it.</p>}
            <label className="field-label">Tell us where Glitter was hiding</label>
            <div className="record-controls"><button type="button" className={recording ? 'action recording' : 'action secondary'}
              onClick={recording ? () => recorder.current?.stop() : record}>
              {recording ? '⏹ Stop recording' : '🎤 Record my voice'}
            </button><small>{recording ? 'Recording now…' : 'Save your real voice for future Christmases'}</small></div>
            {audioPreview && <audio controls src={audioPreview} aria-label="Listen to your new voice recording" />}
            {saved?.hasAudio && !audio && <p className="inline-feedback">Existing voice recording saved. A new one will replace it.</p>}
            <label className="field-label" htmlFor="glitter-note">Add a message (optional)</label>
            <textarea id="glitter-note" value={note} maxLength={280} rows={3} placeholder="Today Glitter was…"
              onChange={e => setNote(e.target.value)} />
            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="inline-feedback" role="status">{message}</p>}
            <button type="submit" className="action full" disabled={!ready || saving || recording}>{saving ? 'Saving…' : 'Save my Glitter entry'}</button>
          </form>
        </div>
        <div className="wish-list-card">
          <h3>📖 Glitter’s scrapbook</h3>
          <p>Choose a day to see what everyone discovered. All three entries appear together.</p>
          <div className="diary-day-list">
            {Array.from(new Set(entries.map(e => e.day))).sort().reverse().map(value => (
              <button key={value} className={'pill ' + (value === day ? 'selected' : '')} onClick={() => setDay(value)}>{value.slice(5)}</button>
            ))}
          </div>
          <h3 className="diary-day-title">{day}</h3>
          <div className="diary-entries">{CHILDREN.map(profile => {
            const entry = entries.find(e => e.child === profile.id && e.day === day);
            return <article className="diary-entry" key={profile.id}>
              <h4>{profile.icon} {profile.name}</h4>
              {!entry ? <p>Nothing recorded yet for this day.</p> : <>
                {entry.hasPhoto && <MediaPreview key={entry.id + 'photo' + mediaRevision} id={entry.id} kind="photo" />}
                {entry.note && <p>{entry.note}</p>}
                {entry.hasAudio && <MediaPreview key={entry.id + 'audio' + mediaRevision} id={entry.id} kind="audio" />}
              </>}
            </article>;
          })}</div>
        </div>
      </div>
    </section>
  );
}

