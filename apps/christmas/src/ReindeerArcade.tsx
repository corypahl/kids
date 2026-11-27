import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';

/* Three original, self-contained games. Nothing is sent to the server. */

type Pin = { id: number; x: number; y: number };
const PINS: Pin[] = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 4 - row }, (_, column) => ({
    id: row * 4 + column,
    x: 230 + (column - (3 - row) / 2) * 37,
    y: 106 + row * 26,
  }))
).flat();
const ALL_PINS = PINS.map(pin => pin.id);

export function PenguinBowling() {
  const [aim, setAim] = useState(0);
  const [power, setPower] = useState(73);
  const [pins, setPins] = useState<number[]>(ALL_PINS);
  const [frame, setFrame] = useState(1);
  const [ballNo, setBallNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [travel, setTravel] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'rolling' | 'next' | 'finished'>('ready');
  const [message, setMessage] = useState('Aim at the penguin pins, then roll!');
  const animation = useRef<number | null>(null);
  const lane = useRef<SVGSVGElement>(null);

  useEffect(() => () => { if (animation.current !== null) cancelAnimationFrame(animation.current); }, []);

  function setAimFromPointer(event: PointerEvent<SVGSVGElement>) {
    if (phase !== 'ready') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 460;
    setAim(Math.round(Math.max(-90, Math.min(90, x - 230))));
  }

  function roll() {
    if (phase !== 'ready') return;
    setPhase('rolling');
    setTravel(0);
    setMessage('Here comes the snowball!');
    const launched = performance.now();
    const duration = 1300 - power * 5;
    const target = 230 + aim * 1.05;
    function step(now: number) {
      const progress = Math.min(1, (now - launched) / duration);
      setTravel(progress);
      if (progress < 1) {
        animation.current = requestAnimationFrame(step);
        return;
      }
      animation.current = null;
      const newlyDown = PINS.filter(pin => pins.includes(pin.id) &&
        Math.abs(pin.x - target) < (22 + power * .36) * (1 - (pin.y - 106) / 500) &&
        (power > 42 || pin.y >= 155)).map(pin => pin.id);
      const remaining = pins.filter(id => !newlyDown.includes(id));
      setPins(remaining);
      setTotal(score => score + newlyDown.length);
      const endFrame = ballNo === 2 || remaining.length === 0;
      setMessage(newlyDown.length === 10 ? '🎉 STRIKE! Every penguin toppled!' :
        newlyDown.length >= 6 ? '🌟 Amazing roll! ' + newlyDown.length + ' pins!' :
        newlyDown.length > 0 ? '🐧 You toppled ' + newlyDown.length + ' penguin pins!' :
        'So close! Try aiming a little differently.');
      setPhase(endFrame ? (frame === 5 ? 'finished' : 'next') : 'ready');
      if (!endFrame) setBallNo(2);
      setTravel(0);
    }
    animation.current = requestAnimationFrame(step);
  }

  function next() {
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    const again = phase === 'finished';
    setFrame(again ? 1 : frame + 1);
    setBallNo(1);
    setTotal(score => again ? 0 : score);
    setPins(ALL_PINS);
    setAim(0);
    setTravel(0);
    setPhase('ready');
    setMessage('Line up your snowball for the next roll!');
  }
  const targetX = 230 + aim * 1.05;
  return <section className="game-panel arcade-panel penguin-bowling" aria-label="Penguin Bowling game">
    <div className="section-row"><div><h3>🐧 Penguin Bowling</h3>
      <p>Roll snowballs to topple the penguin pins! Five rounds, two tries each.</p></div>
      <span className="stat-chip">⭐ {total} pins</span></div>
    <div className="arcade-stats"><span>Round {frame} / 5</span><span>Throw {ballNo} / 2</span><span>{pins.length} standing</span></div>
    <svg className="bowling-lane" ref={lane} viewBox="0 0 460 460" role="img"
      aria-label="Snow bowling lane with penguin pins. Move the aim control or tap the lane to aim."
      onPointerDown={setAimFromPointer} onPointerMove={event => { if (event.buttons) setAimFromPointer(event); }}>
      <defs><linearGradient id="penguin-lane" x1="0" x2="0" y1="0" y2="1">
        <stop stopColor="#b4e3ec"/><stop offset="1" stopColor="#f4fcf8"/></linearGradient></defs>
      <rect width="460" height="460" rx="24" fill="#7fb5cf"/>
      <path d="M146 72H314L435 448H25Z" fill="url(#penguin-lane)" stroke="#fff7e2" strokeWidth="9"/>
      <path d="M230 70V448" stroke="#cbe8e6" strokeWidth="5" strokeDasharray="13 15"/>
      {[85,160,235,310,390].map(y => <path key={y} d={'M'+(146-(y-72)*.33)+' '+y+'H'+(314+(y-72)*.33)}
        stroke="#fff" strokeOpacity=".32" strokeWidth="3"/>)}
      {PINS.map(pin => pins.includes(pin.id) ? <g key={pin.id} transform={'translate('+pin.x+' '+pin.y+')'}>
        <ellipse cy="16" rx="17" ry="6" fill="#8ab7c3" opacity=".4"/>
        <path d="M-12 -15Q-21 -5 -14 17Q0 24 14 17Q21 -5 12 -15Q0 -30 -12 -15Z"
          fill="#374c60" stroke="#ffffff" strokeWidth="2"/>
        <ellipse cy="7" rx="8" ry="13" fill="#fffdf2"/>
        <circle cx="-5" cy="-12" r="2.7" fill="#fffdf2"/><circle cx="5" cy="-12" r="2.7" fill="#fffdf2"/>
        <path d="M-5 -3L5 -3L0 4Z" fill="#f1ae5d"/>
        <path d="M-9 -21L0 -32L10 -21Z" fill={pin.id%2===0?'#d55f76':'#67ac91'}/>
      </g> : <g key={pin.id} opacity=".6"><text x={pin.x} y={pin.y+16} textAnchor="middle" fontSize="30">✨</text></g>)}
      <path d={'M230 426L'+targetX+' 155'} stroke="#cf6b74" strokeWidth="7" strokeDasharray="12 12" opacity=".55"
        strokeLinecap="round"/>
      <circle cx={targetX} cy="153" r="17" fill="none" stroke="#d76b76" strokeWidth="5" strokeDasharray="6 6"/>
      <g transform={'translate('+(230+(targetX-230)*travel)+' '+(418-267*travel)+')'}>
        <ellipse cy="16" rx={Math.max(9,23-13*travel)} ry="7" fill="#406681" opacity=".24"/>
        <circle r={Math.max(13,24-12*travel)} fill="#fffdf5" stroke="#d3eaf0" strokeWidth="4"/>
        <circle cx="-6" cy="-7" r="5" fill="#e9f8fa" opacity=".9"/>
        <circle cx="7" cy="3" r="4" fill="#cce5e8" opacity=".9"/>
      </g>
      <text x="230" y="44" textAnchor="middle" fill="#fff" fontWeight="900" fontSize="22">PENGUIN PINS</text>
    </svg>
    <div className="bowling-controls">
      <label>↔ Aim <input type="range" min="-90" max="90" value={aim} disabled={phase!=='ready'}
        onChange={event=>setAim(Number(event.target.value))} aria-label="Aim the snowball left or right"/></label>
      <label>💪 Power: {power}% <input type="range" min="30" max="100" step="5" value={power}
        disabled={phase!=='ready'} onChange={event=>setPower(Number(event.target.value))} aria-label="Choose snowball power"/></label>
    </div>
    <p className="arcade-feedback" role="status">{message}</p>
    {phase === 'ready' && <button className="action arcade-main-button" onClick={roll}>❄️ Roll snowball!</button>}
    {phase === 'rolling' && <button className="action arcade-main-button" disabled>❄️ Rolling…</button>}
    {phase === 'next' && <button className="action arcade-main-button" onClick={next}>Next round →</button>}
    {phase === 'finished' && <><p className="arcade-celebrate">🎉 You toppled {total} pins in five rounds!</p>
      <button className="action arcade-main-button" onClick={next}>↻ Bowl again</button></>}
  </section>;
}

/* Elf Dance: the arrow target is timed, not a decorative animation. */
const DANCE_DIRECTIONS = ['⬅️','⬇️','⬆️','➡️'] as const;
const NOTES = Array.from({length:30},(_,i)=>({
  id:i, lane:[0,2,1,3,0,3,2,1,0,1,3,2][i%12], at:2500+i*730
}));
type DanceMark = 'perfect'|'good'|'miss';
export function ElfDance() {
  const [phase,setPhase] = useState<'ready'|'playing'|'finished'>('ready');
  const [elapsed,setElapsed] = useState(0);
  const [marks,setMarks] = useState<Record<number,DanceMark>>({});
  const [score,setScore] = useState(0);
  const [combo,setCombo] = useState(0);
  const [message,setMessage] = useState('Tap the arrows when they land on the glowing row!');
  const marksRef = useRef<Record<number,DanceMark>>({});
  const phaseRef = useRef<'ready'|'playing'|'finished'>('ready');
  const started = useRef(0);
  const raf = useRef<number | null>(null);
  const lastNote = NOTES[NOTES.length-1].at;
  useEffect(() => {
    const key = (event:KeyboardEvent) => {
      const lane:Record<string,number>={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3};
      if (event.key in lane && phaseRef.current === 'playing') {
        event.preventDefault();
        press(lane[event.key]);
      }
    };
    window.addEventListener('keydown',key);
    return () => {
      window.removeEventListener('keydown',key);
      if (raf.current!==null) cancelAnimationFrame(raf.current);
    };
  }, []);

  function tick(now:number) {
    if (phaseRef.current!=='playing') return;
    const t=now-started.current;
    setElapsed(t);
    const late = NOTES.filter(n=>n.at<t-300 && !marksRef.current[n.id]);
    if (late.length) {
      const next={...marksRef.current};
      late.forEach(note=>{next[note.id]='miss';});
      marksRef.current=next;
      setMarks(next);setCombo(0);
    }
    if (t>lastNote+1300) {
      phaseRef.current='finished';
      setPhase('finished');
      setMessage('🎉 Dance complete! You put on a great show!');
      raf.current=null;
      return;
    }
    raf.current=requestAnimationFrame(tick);
  }
  function start() {
    if (raf.current!==null) cancelAnimationFrame(raf.current);
    marksRef.current={};
    setMarks({});setScore(0);setCombo(0);setElapsed(0);
    setMessage('🎶 Here come the arrows!');
    phaseRef.current='playing';setPhase('playing');
    started.current=performance.now();
    raf.current=requestAnimationFrame(tick);
  }
  function press(lane:number) {
    if (phaseRef.current!=='playing') return;
    const now=performance.now()-started.current;
    const nearest=NOTES.filter(n=>n.lane===lane && !marksRef.current[n.id])
      .sort((a,b)=>Math.abs(a.at-now)-Math.abs(b.at-now))[0];
    if (!nearest || Math.abs(nearest.at-now)>300) {
      setMessage('Almost! Wait for the arrow to reach the glowing row.');
      return;
    }
    const grade:DanceMark=Math.abs(nearest.at-now)<135?'perfect':'good';
    marksRef.current={...marksRef.current,[nearest.id]:grade};
    setMarks(marksRef.current);
    setCombo(c=>c+1);
    setScore(v=>v+(grade==='perfect'?100:60));
    setMessage(grade==='perfect'?'🌟 PERFECT!':'✨ Great move!');
  }
  return <section className="game-panel arcade-panel elf-dance" aria-label="Elf Dance rhythm game">
    <div className="section-row"><div><h3>🧝 Elf Dance</h3>
      <p>A holiday rhythm challenge! Tap the matching arrow as it reaches the glowing line.</p></div>
      <span className="stat-chip">⭐ {score} pts</span></div>
    <div className="arcade-stats"><span>🔥 Combo {combo}</span><span>✅ {Object.values(marks).filter(x=>x!=='miss').length} moves</span>
      <span>🎵 {Math.min(100,Math.floor(elapsed/(lastNote+1300)*100))}%</span></div>
    <div className="dance-scene">
      <div className="dance-elf" aria-hidden="true">🧝‍♀️ ✨</div>
      <div className="dance-lanes">
        {DANCE_DIRECTIONS.map((arrow,lane)=><div className="dance-lane" key={arrow}>
          {phase==='playing' && NOTES.filter(n=>n.lane===lane && !marks[n.id] && n.at-elapsed<=2100 && n.at-elapsed>=-295)
            .map(n=><span key={n.id} className="dance-note"
              style={{bottom:(30+(n.at-elapsed)/2100*184)+'px'}}>{arrow}</span>)}
          <span className="dance-target" aria-hidden="true">{arrow}</span>
        </div>)}
      </div>
      {phase!=='playing' && <div className="dance-standby">{phase==='ready'?'🎶 Ready to dance?':'🎉 Great dancing!'}</div>}
    </div>
    <div className="dance-buttons" aria-label="Dance arrows">
      {DANCE_DIRECTIONS.map((arrow,i)=><button key={i} type="button" disabled={phase!=='playing'}
        aria-label={['Left','Down','Up','Right'][i]+' dance arrow'} onClick={()=>press(i)}>{arrow}</button>)}
    </div>
    <p className="arcade-feedback" role="status">{message}</p>
    <div className="arcade-controls">
      {phase!=='playing'?<button className="action arcade-main-button" onClick={start}>
        {phase==='finished'?'↻ Dance again':'▶ Start dancing!'}</button>:
        <span className="arcade-hint">⌨️ Keyboard: ← ↓ ↑ → · On tablets: tap the big arrows</span>}
    </div>
  </section>;
}

/* A lightweight original flying game; animation runs only while this game is visible. */
type SnowCloud = { id:number; x:number; gap:number; passed:boolean };
type Flight = { phase:'ready'|'playing'|'over'; y:number; velocity:number; clouds:SnowCloud[]; score:number; last:number; spawn:number; nextId:number };
const freshFlight = ():Flight => ({phase:'ready',y:165,velocity:0,clouds:[],score:0,last:0,spawn:0,nextId:0});
export function RudolphMission() {
  const game=useRef<Flight>(freshFlight());
  const [scene,setScene]=useState<Flight>(freshFlight);
  const frame=useRef<number|null>(null);
  function paint(){setScene({...game.current,clouds:game.current.clouds.map(p=>({...p}))});}
  function step(now:number){
    const g=game.current;
    if(g.phase!=='playing')return;
    const dt=Math.min((now-g.last)/1000,.045);
    g.last=now;
    g.velocity=Math.min(330,g.velocity+550*dt);
    g.y+=g.velocity*dt;
    g.spawn+=dt;
    if(g.spawn>1.78){g.spawn=0;g.clouds.push({id:g.nextId++,x:465,gap:118+Math.random()*115,passed:false});}
    for(const c of g.clouds){
      c.x-=130*dt;
      if(!c.passed && c.x+58<96){c.passed=true;g.score++;}
      const near=96+15>c.x && 96-15<c.x+58;
      if(near && (g.y-16<c.gap-76 || g.y+16>c.gap+76))g.phase='over';
    }
    g.clouds=g.clouds.filter(c=>c.x>-75);
    if(g.y<16 || g.y>339)g.phase='over';
    paint();
    if(g.phase==='playing') frame.current=requestAnimationFrame(step);
    else frame.current=null;
  }
  function jump(){
    const g=game.current;
    if(g.phase!=='playing'){
      if(frame.current!==null)cancelAnimationFrame(frame.current);
      game.current={...freshFlight(),phase:'playing',velocity:-240,last:performance.now()};
      paint();
      frame.current=requestAnimationFrame(step);
      return;
    }
    g.velocity=-240;
  }
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.code==='Space'||event.code==='ArrowUp'){
        event.preventDefault();jump();
      }
    };
    window.addEventListener('keydown',key);
    return ()=>{window.removeEventListener('keydown',key);if(frame.current!==null)cancelAnimationFrame(frame.current);};
  },[]);
  const playing=scene.phase==='playing';
  return <section className="game-panel arcade-panel rudolph-mission" aria-label="Rudolph's Mission flying game">
    <div className="section-row"><div><h3>🦌 Rudolph’s Mission</h3>
      <p>Help Rudolph fly between the snow clouds. Tap to flap and stay in the sky!</p></div>
      <span className="stat-chip">⭐ {scene.score} clouds</span></div>
    <div className="rudolph-stage" role="button" tabIndex={0} onPointerDown={event=>{event.preventDefault();jump();}}
      onKeyDown={event=>{if(event.code==='Enter'){event.preventDefault();jump();}}}
      aria-label="Tap to flap Rudolph through the clouds. Spacebar and up arrow also work.">
      <svg viewBox="0 0 440 370" role="img" aria-label="Rudolph flying through the snowy North Pole sky">
        <defs><linearGradient id="rudolph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#5ba6ce"/><stop offset="1" stopColor="#d6f4ee"/></linearGradient></defs>
        <rect width="440" height="370" fill="url(#rudolph-sky)"/>
        {Array.from({length:18},(_,i)=><circle key={i} cx={(i*79+22)%430} cy={(i*51+19)%320}
          r={i%3+2} fill="#fffefa" opacity=".72"/>)}
        <circle cx="364" cy="58" r="31" fill="#fff5c8" opacity=".9"/>
        {scene.clouds.map(c=><g key={c.id}>
          <rect x={c.x} y="0" width="58" height={Math.max(0,c.gap-76)}
            fill="#f3fbfb" stroke="#c3e0e8" strokeWidth="5" rx="15"/>
          <rect x={c.x} y={c.gap+76} width="58" height={Math.max(0,354-(c.gap+76))}
            fill="#f3fbfb" stroke="#c3e0e8" strokeWidth="5" rx="15"/>
          <text x={c.x+29} y={c.gap-90} textAnchor="middle" fontSize="30">❄️</text>
          <text x={c.x+29} y={c.gap+107} textAnchor="middle" fontSize="29">🌨️</text>
        </g>)}
        <g transform={'translate(96 '+scene.y+') rotate('+Math.max(-24,Math.min(30,scene.velocity/11))+')'}>
          <ellipse rx="34" ry="20" cx="-5" cy="4" fill="#a96e4c" stroke="#865336" strokeWidth="3"/>
          <path d="M-12 -9Q-39 -35 -28 -51M7 -12Q27 -45 35 -46" stroke="#9d693f" strokeWidth="6" fill="none" strokeLinecap="round"/>
          <path d="M-30 -44L-45 -50M-24 -36L-9 -44M29 -39L46 -49" stroke="#9d693f" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="18" cy="-7" rx="18" ry="16" fill="#c58b5e"/>
          <circle cx="21" cy="-12" r="3.7" fill="#263a45"/>
          <circle cx="33" cy="-4" r="7" fill="#e84f68" stroke="#fff1dd" strokeWidth="2"/>
          <path d="M-28 12L-39 24M-1 19L-8 30M17 11L18 26" stroke="#82533a" strokeWidth="6" strokeLinecap="round"/>
          <path d="M-23 -2Q-57 -37 -53 -3Q-45 9 -23 7Z" fill="#f6e0aa" stroke="#a48056" strokeWidth="3"/>
          <text x="-10" y="-33" fontSize="20">✨</text>
        </g>
        <path d="M0 357Q105 338 205 359T440 351V370H0Z" fill="#fffdfa"/>
      </svg>
      {!playing&&<div className="rudolph-overlay"><strong>{scene.phase==='ready'?'🎁 Ready to take off?':'❄️ Snowy landing!'}</strong>
        <span>{scene.phase==='ready'?'Tap to help Rudolph fly!':'You made it through '+scene.score+' clouds. Try again!'}</span>
        <span className="rudolph-overlay-cta">{scene.phase==='ready'?'▶ Start flying':'↻ Fly again'}</span></div>}
    </div>
    <button type="button" className="action arcade-main-button rudolph-flap" onClick={jump}>
      {scene.phase==='playing'?'⬆️ Flap!':scene.phase==='ready'?'🦌 Start mission':'↻ Retry mission'}</button>
    <p className="arcade-hint">Tap the sky or Flap button. On a keyboard, press Space or ↑.</p>
  </section>;
}
