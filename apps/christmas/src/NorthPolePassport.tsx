import { useEffect, useState } from 'react';
import type { ChildId } from './data';
import { familyToday, requestApi } from './api';

export const PASSPORT_STAMPS = [
  { id:'present-bounce', icon:'🎁', name:'Present Pilot', detail:'Complete a Present Bounce puzzle' },
  { id:'delivery-run', icon:'🛷', name:'Delivery Helper', detail:'Deliver to five chimneys' },
  { id:'elf-coding', icon:'🧩', name:'Code Elf', detail:'Solve all coding mazes' },
  { id:'snow-globe', icon:'❄️', name:'Snow Globe Artist', detail:'Save a snow globe creation' },
  { id:'around-the-world', icon:'🌍', name:'World Explorer', detail:'Answer four country quizzes' },
  { id:'cursive', icon:'✍️', name:'Christmas Calligrapher', detail:'Trace a word in cursive' },
  { id:'advent', icon:'🎄', name:'Advent Adventurer', detail:'Open an Advent surprise' },
  { id:'kindness', icon:'💚', name:'Kindness Champion', detail:'Complete a kindness challenge' },
] as const;
export type PassportStampId = typeof PASSPORT_STAMPS[number]['id'];

export function NorthPolePassport({ child, name, onVisit }: {
  child:ChildId; name:string; onVisit:(tab:'games'|'studio'|'activities')=>void;
}) {
  const [stamps,setStamps]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const year=Number(familyToday().slice(0,4));
  const day=familyToday();
  const challenge=PASSPORT_STAMPS[(Number(day.slice(8))+Number(day.slice(5,7)))%6];
  const challengeTab: 'games' | 'studio' | 'activities' =
    ['present-bounce','delivery-run','elf-coding'].includes(challenge.id) ? 'games' :
    challenge.id === 'around-the-world' ? 'activities' : 'studio';
  useEffect(()=>{
    let live=true;
    requestApi<{year:number;stamps:string[]}>('passport?child='+child)
      .then(value=>{if(live){setStamps(value.stamps);setError('');}})
      .catch(e=>{if(live)setError(e instanceof Error?e.message:'Unable to load passport.');})
      .finally(()=>{if(live)setLoading(false);});
    return ()=>{live=false;};
  },[child]);
  return <section className="passport-page">
    <div className="passport-cover"><span aria-hidden="true">🎄</span><p>NORTH POLE EXPLORER</p>
      <h1>{name}’s Christmas Passport</h1><strong>CLASS OF {year}</strong><span aria-hidden="true">⭐ ❄️ ⭐</span></div>
    <div className="passport-progress" aria-live="polite">
      <strong>{loading?'Loading passport…':stamps.length+' / '+PASSPORT_STAMPS.length+' stamps earned'}</strong>
      <div className="progress-track"><div style={{width:(stamps.length/PASSPORT_STAMPS.length*100)+'%'}}/></div>
      <p>Every new activity is another stamp. Collect them all before the season ends!</p>
    </div>
    <div className="passport-daily">
      <div><span className="eyebrow">TODAY'S NORTH POLE MISSION</span>
        <h2>{challenge.icon} {challenge.name}</h2>
        <p>{challenge.detail}. {stamps.includes(challenge.id)?'You already earned this stamp—have fun doing it again!':'Complete it to collect your stamp.'}</p>
      </div>
      <button className="action" type="button" onClick={()=>onVisit(challengeTab)}>Go to activity →</button>
    </div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <div className="passport-stamps">
      {PASSPORT_STAMPS.map(stamp=><div key={stamp.id} className={'passport-stamp'+(stamps.includes(stamp.id)?' earned':'')}>
        <div className="passport-seal" aria-hidden="true">{stamps.includes(stamp.id)?stamp.icon:'🔒'}</div>
        <strong>{stamp.name}</strong><small>{stamp.detail}</small><span>{stamps.includes(stamp.id)?'✓ Earned!':'Keep exploring'}</span>
      </div>)}
    </div>
    <div className="holiday-actions">
      <button className="action" onClick={()=>onVisit('games')}>🎮 Reindeer Games</button>
      <button className="action secondary" onClick={()=>onVisit('studio')}>🎨 Elf Design School</button>
      <button className="action secondary" onClick={()=>onVisit('activities')}>🏠 Mrs. Claus’s Cabin</button>
    </div>
  </section>;
}
