import { useState } from 'react';
import type { FormEvent } from 'react';
import { CHILDREN } from './data';
import type { ChildId } from './data';
import { requestApi } from './api';

const DEVICE_CHILD_KEY = 'christmas-village-device-child-v1';

export function readDeviceChild(): ChildId | null {
  try {
    const value = window.localStorage.getItem(DEVICE_CHILD_KEY);
    return CHILDREN.some(item => item.id === value) ? value as ChildId : null;
  } catch { return null; }
}
export function storeDeviceChild(child: ChildId): boolean {
  if (!CHILDREN.some(item => item.id === child)) return false;
  try {
    window.localStorage.setItem(DEVICE_CHILD_KEY, child);
    return window.localStorage.getItem(DEVICE_CHILD_KEY) === child;
  } catch { return false; }
}

export function DeviceSettings({ assignedChild, onSave, onClose }: {
  assignedChild: ChildId | null;
  onSave: (child: ChildId) => void;
  onClose?: () => void;
}) {
  const [parentKey, setParentKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selected, setSelected] = useState<ChildId | null>(assignedChild);
  const [error, setError] = useState('');

  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (!parentKey.trim() || verifying) return;
    setVerifying(true);
    setError('');
    try {
      // Verify against the separate parent credential; do not persist it to the tablet.
      await requestApi<{ ok: boolean }>('parent/verify', { parentKey: parentKey.trim() });
      setUnlocked(true);
      setParentKey('');
    } catch {
      setError('That parent key was not accepted. Check it and try again.');
    } finally {
      setVerifying(false);
    }
  }

  function confirmChild() {
    if (!unlocked || !selected) return;
    if (!storeDeviceChild(selected)) {
      setError('This tablet could not save its profile. Check that browser storage is enabled.');
      return;
    }
    setError('');
    onSave(selected);
  }

  return (
    <div className="device-settings-overlay" role="dialog" aria-modal="true"
      aria-labelledby="device-settings-title">
      <div className="device-settings-panel">
        <div className="device-settings-heading">
          <div>
            <span className="eyebrow">⚙️ GROWN-UP SETTINGS</span>
            <h2 id="device-settings-title">{assignedChild ? 'Tablet settings' : 'Set up this tablet'}</h2>
            <p>{assignedChild ? 'This tablet stays on one child’s Christmas Village.' :
              'Choose whose Christmas Village this device should use. You only need to do this once.'}</p>
          </div>
          {onClose && <button type="button" className="device-settings-close" aria-label="Close settings"
            onClick={onClose}>✕</button>}
        </div>

        {!unlocked ? <form onSubmit={e => void unlock(e)} className="device-settings-unlock">
          <div className="device-settings-lock" aria-hidden="true">🔒</div>
          <label htmlFor="device-parent-key">Enter the parent key to {assignedChild ? 'change the profile' : 'set up this device'}</label>
          <input id="device-parent-key" type="password" value={parentKey} autoComplete="off"
            onChange={e => setParentKey(e.target.value)} placeholder="Parent access key"
            required />
          <button className="action" type="submit" disabled={verifying || !parentKey.trim()}>
            {verifying ? 'Checking…' : '🔓 Unlock settings'}
          </button>
          <small>Use the same key as the separate Christmas parent dashboard. It won’t be saved on this tablet.</small>
        </form> : <div className="device-settings-chooser">
          <h3>Whose tablet is this?</h3>
          <div className="device-settings-children" role="radiogroup" aria-label="Choose one child for this tablet">
            {CHILDREN.map(item => <button key={item.id} type="button"
              role="radio" aria-checked={selected === item.id}
              className={'device-settings-child ' + item.color + (selected === item.id ? ' selected' : '')}
              onClick={() => { setSelected(item.id); setError(''); }}>
              <span aria-hidden="true">{item.icon}</span>
              <strong>{item.name}</strong>
              {selected === item.id && <span className="device-settings-selected" aria-hidden="true">✓</span>}
            </button>)}
          </div>
          <p className="device-settings-help">Each tablet remembers its choice. Wishes, Advent progress, and Glitter’s Diary will open for that child automatically.</p>
          <button type="button" className="action" disabled={!selected} onClick={confirmChild}>
            💾 Save this tablet
          </button>
        </div>}
        {error && <p role="alert" className="device-settings-error">{error}</p>}
      </div>
    </div>
  );
}
