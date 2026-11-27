import { useState } from 'react';
import type { ChildId } from './data';
import { CharacterCreator } from './CreatorGames';
import { CookieBakery } from './Village';
import { GingerbreadDesigner } from './GingerbreadDesigner';
import { FidgetMaker } from './FidgetMaker';
import { CreativeStation } from './HolidayActivities';

type DesignMode = 'cookies' | 'snowmen' | 'elves' | 'gingerbread' | 'fidgets' | 'snow-globe' | 'cursive';
const STATIONS: { id: DesignMode; icon: string; label: string; detail: string }[] = [
  { id: 'cookies', icon: '🍪', label: 'Cookies', detail: 'Icing and candy toppings' },
  { id: 'snowmen', icon: '⛄', label: 'Snowmen', detail: 'Hats, faces and scarves' },
  { id: 'elves', icon: '🧝', label: 'Elves', detail: 'Outfits and hairstyles' },
  { id: 'gingerbread', icon: '🎀', label: 'Gingerbread', detail: 'Create a cookie friend' },
  { id: 'fidgets', icon: '🫧', label: 'Fidget Maker', detail: 'Stretch, squeeze and shake a squishy' },
  { id: 'snow-globe', icon: '❄️', label: 'Snow Globe', detail: 'Build a snowy world' },
  { id: 'cursive', icon: '✍️', label: 'Cursive Writing', detail: 'Finger-trace Christmas words' },
];

export function ElfDesignSchool({ child, onComplete }: { child: ChildId; onComplete: (stamp:'snow-globe'|'cursive')=>void }) {
  const [station, setStation] = useState<DesignMode>('cookies');
  return <section className="elf-design-school">
    <header className="studio-heading">
      <div className="studio-heading-art" aria-hidden="true">🧝🎨</div>
      <div>
        <span className="eyebrow">WELCOME TO THE NORTH POLE ART CLASS</span>
        <h1>Elf Design School</h1>
        <p>The elves are ready to teach you! Design characters, build a snow globe, and practice Christmas cursive.</p>
      </div>
    </header>
    <nav className="studio-stations" aria-label="Choose a design activity">
      {STATIONS.map(item => <button type="button" key={item.id} aria-current={station === item.id ? 'page' : undefined}
        className={'studio-station' + (station === item.id ? ' selected' : '')}
        onClick={() => setStation(item.id)}>
        <span className="studio-station-icon" aria-hidden="true">{item.icon}</span>
        <strong>{item.label}</strong>
        <small>{item.detail}</small>
      </button>)}
    </nav>
    <div className="studio-workspace" aria-live="off">
      {/* Keep every editor mounted but hide the inactive ones so switching projects
          doesn't throw away an unfinished cookie, character or gingerbread look. */}
      <div className="studio-panel" hidden={station !== 'cookies'}><CookieBakery /></div>
      <div className="studio-panel" hidden={station !== 'snowmen'}><CharacterCreator key={child + '-snowman'} kind="snowman" child={child}/></div>
      <div className="studio-panel" hidden={station !== 'elves'}><CharacterCreator key={child + '-elf'} kind="elf" child={child}/></div>
      <div className="studio-panel" hidden={station !== 'gingerbread'}><GingerbreadDesigner child={child}/></div>
      <div className="studio-panel" hidden={station !== 'fidgets'}><FidgetMaker child={child} active={station === 'fidgets'}/></div>
      <div className="studio-panel" hidden={station !== 'snow-globe'}><CreativeStation mode="snow-globe" child={child} onComplete={onComplete}/></div>
      <div className="studio-panel" hidden={station !== 'cursive'}><CreativeStation mode="cursive" child={child} onComplete={onComplete}/></div>
    </div>
  </section>;
}

const STREAM_ID = 'KIc_EKADsOI';
const VIDEO_URL = 'https://www.youtube.com/live/KIc_EKADsOI?is=1RUUTcqSgk2KZIS8';

export function SantaWorkshop() {
  const [playing, setPlaying] = useState(false);
  return <section className="santa-workshop" aria-label="Santa's Workshop live video">
    <header className="workshop-heading">
      <span className="eyebrow">🎅 SANTA’S WORKSHOP</span>
      <h1>Watch Santa’s Workshop</h1>
      <p>Take a peek into the North Pole! Tap below when you're ready to watch.</p>
    </header>
    <div className="santa-player-shell">
      {!playing ? <div className="santa-player-poster">
        <div className="santa-player-art" aria-hidden="true">🎅🏻 🧸 🎁</div>
        <strong>Ready for a visit to Santa’s Workshop?</strong>
        <p>The YouTube livestream will load only when you press Play.</p>
        <button className="action" type="button" onClick={() => setPlaying(true)}>▶ Watch the livestream</button>
      </div> :
      <iframe className="santa-video" title="Santa's Workshop YouTube livestream"
        src={'https://www.youtube-nocookie.com/embed/' + STREAM_ID + '?playsinline=1&rel=0'}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen />}
    </div>
    <div className="workshop-bottom">
      {playing && <button className="pill" type="button" onClick={() => setPlaying(false)}>◼ Stop video</button>}
      <p>This is a YouTube video. Playback depends on the livestream being active and the channel allowing embedding. YouTube controls are provided by YouTube.</p>
      <a href={VIDEO_URL} rel="noopener noreferrer">Having trouble? Watch on YouTube ↗</a>
    </div>
  </section>;
}
