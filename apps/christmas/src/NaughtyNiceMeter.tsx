import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { familyToday, requestApi } from './api';
import type { ChildId } from './data';

type NiceAnswer = { year: number; value: number | null };
const CURRENT_YEAR = () => Number(familyToday().slice(0, 4));
function note(value: number) {
  if (value < 20) return 'Feeling a little mischievous!';
  if (value < 40) return 'A little silly, a little sweet!';
  if (value < 60) return 'A mix of mischief and kindness!';
  if (value < 80) return 'Lots of kindness this year!';
  return 'Feeling extra nice this year!';
}

export function NaughtyNiceMeter({ child, name }: { child: ChildId; name: string }) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [value, setValue] = useState(50);
  const [saved, setSaved] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError('');
    setMessage('');
    void requestApi<NiceAnswer>('nice-meter?child=' + encodeURIComponent(child))
      .then(answer => {
        if (!active) return;
        setYear(answer.year);
        setValue(answer.value ?? 50);
        setSaved(answer.value);
      })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load your answer.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [child]);
  async function save() {
    if (busy || saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const answer = await requestApi<NiceAnswer>('nice-meter', {
        method: 'POST', body: { child, year, value }
      });
      setYear(answer.year);
      setValue(answer.value ?? value);
      setSaved(answer.value);
      setMessage('🌟 Saved! You can move the slider and update your answer any time.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally { setSaving(false); }
  }
  const changed = saved === null || saved !== value;
  const style = { '--nice-value': value + '%' } as CSSProperties;
  return <section className="nice-meter-page" aria-label="Naughty or Nice yearly check-in">
    <div className="nice-meter-sky" aria-hidden="true">✦ ❄ ✧ ✨ ❄ ✦</div>
    <div className="nice-meter-card">
      <div className="nice-meter-header">
        <span className="eyebrow">🎅 SANTA'S LITTLE QUESTION · {year}</span>
        <h1>Naughty or Nice?</h1>
        <p>Hey, {name}! Where do <strong>you</strong> think you are on the list this year?</p>
      </div>
      <div className="nice-meter-character" aria-hidden="true">
        <span>😈</span><span className="nice-meter-current">{note(value)}</span><span>😇</span>
      </div>
      <div className="nice-meter-slider-card">
        <div className="nice-meter-ends" aria-hidden="true">
          <div><span>😈</span><strong>Naughty</strong></div>
          <div><span>😇</span><strong>Nice</strong></div>
        </div>
        <div className="nice-meter-slider-wrap" style={style}>
          <input id="nice-meter-slider" type="range" min="0" max="100" step="1" value={value}
            disabled={busy || saving}
            onChange={event => { setValue(Number(event.target.value)); setMessage(''); }}
            aria-label="How naughty or nice do you think you have been this year?"
            aria-valuetext={value + ' percent toward nice'} />
        </div>
        <div className="nice-meter-value" aria-live="off">
          <strong>{value}%</strong><span>toward Nice</span>
        </div>
        <p className="nice-meter-prompt">👆 Slide the star to where you feel you belong.</p>
      </div>
      <div className="nice-meter-actions">
        <button type="button" className="action" disabled={busy || saving || !changed}
          onClick={() => void save()}>{saving ? 'Saving…' : busy ? 'Loading…' : saved === null ? '✨ Save my answer' : changed ? '✨ Update my answer' : '✓ Answer saved'}</button>
        {saved !== null && <p className="nice-meter-last">Your {year} answer: <strong>{saved}% toward Nice</strong></p>}
        {message && <p className="nice-meter-success" role="status">{message}</p>}
        {error && <p className="nice-meter-error" role="alert">{error}</p>}
      </div>
      <p className="nice-meter-kind-note">💚 This is just for fun! Everyone has silly days and kind days. Only you decide where your slider goes.</p>
    </div>
  </section>;
}
