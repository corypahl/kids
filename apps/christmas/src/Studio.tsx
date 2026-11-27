import { useState } from 'react';
import type { ChildId } from './data';
import { CharacterCreator } from './CreatorGames';
import { CookieBakery } from './Village';
import { GingerbreadDesigner } from './GingerbreadDesigner';

type DesignMode = 'cookies' | 'snowmen' | 'elves' | 'gingerbread';
const STATIONS: { id: DesignMode; icon: string; label: string; detail: string }[] = [
  { id: 'cookies', icon: '🍪', label: 'Cookies', detail: 'Icing and candy toppings' },
  { id: 'snowmen', icon: '⛄', label: 'Snowmen', detail: 'Hats, faces and scarves' },
  { id: 'elves', icon: '🧝', label: 'Elves', detail: 'Outfits and hairstyles' },
  { id: 'gingerbread', icon: '🎀', label: 'Gingerbread', detail: 'Create a cookie friend' },
];

export function MrsClausStudio({ child }: { child: ChildId }) {
  const [station, setStation] = useState<DesignMode>('cookies');
  return <section className="mrs-claus-studio">
    <header className="studio-heading">
      <div className="studio-heading-art" aria-hidden="true">👵🏻🎄</div>
      <div>
        <span className="eyebrow">WELCOME TO MRS. CLAUS’S WORKSHOP</span>
        <h1>Mrs. Claus’s Design Studio</h1>
        <p>Choose something magical to make. Mix, match, decorate, and save your favorite characters!</p>
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
      {station === 'cookies' && <CookieBakery />}
      {station === 'snowmen' && <CharacterCreator key={child + '-snowman'} kind="snowman" child={child}/>}
      {station === 'elves' && <CharacterCreator key={child + '-elf'} kind="elf" child={child}/>}
      {station === 'gingerbread' && <GingerbreadDesigner child={child}/>}
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
      <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer">Having trouble? Watch on YouTube ↗</a>
    </div>
  </section>;
}
