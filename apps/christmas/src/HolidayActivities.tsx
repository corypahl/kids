import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { ChildId } from './data';
import { CursiveTracing } from './CursiveTracing';

type Place = { x:number; y:number; icon:string };
const PIECES = [
  {icon:'🎄',name:'Tree'}, {icon:'🏠',name:'Cottage'}, {icon:'⛄',name:'Snowman'},
  {icon:'🦌',name:'Reindeer'}, {icon:'🎁',name:'Gift'}, {icon:'⭐',name:'Star'},
];
const THEMES = ['Snowy night','Northern lights','Pink twilight'] as const;
type SnowTheme = typeof THEMES[number];
function readSaved(child: ChildId): { theme: SnowTheme; pieces: Place[] } | null {
  try {
    const data = JSON.parse(localStorage.getItem('christmas-snow-globe:'+child) || 'null');
    if(data&&THEMES.includes(data.theme)&&Array.isArray(data.pieces)){
      return {theme:data.theme,pieces:data.pieces.slice(0,25).filter((p:Place)=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&typeof p.icon==='string'&&PIECES.some(q=>q.icon===p.icon))};
    }
  } catch {/* Storage unavailable or invalid. */}
  return null;
}
export function SnowGlobeMaker({ child,onComplete }: {child:ChildId;onComplete:(stamp:'snow-globe')=>void}) {
  const [initial]=useState(()=>readSaved(child));
  const [theme,setTheme]=useState<SnowTheme>(initial?.theme||'Snowy night');
  const [pieces,setPieces]=useState<Place[]>(initial?.pieces||[{x:50,y:72,icon:'🏠'}]);
  const [selected,setSelected]=useState(PIECES[0].icon);
  const [shaking,setShaking]=useState(false);
  const [message,setMessage]=useState('Tap inside the globe to decorate your world.');
  const background=theme==='Northern lights'?'#5f9da2':theme==='Pink twilight'?'#cd9ecb':'#6b8da7';
  function place(event:MouseEvent<SVGSVGElement>) {
    const rect=event.currentTarget.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width*300,y=(event.clientY-rect.top)/rect.height*280;
    if(Math.hypot(x-150,y-130)>109||y<34||pieces.length>=25)return;
    setPieces(a=>[...a,{x:Math.round(x/3),y:Math.round(y/2.8),icon:selected}]);
    setMessage('Looking festive! Tap Save to keep your snow globe.');
  }
  function save() {
    try { localStorage.setItem('christmas-snow-globe:'+child,JSON.stringify({theme,pieces}));setMessage('Snow globe saved on this tablet!');}
    catch {setMessage('Storage is unavailable, but you can keep creating.');}
    if(pieces.length>=2)onComplete('snow-globe');
  }
  return <section className="snow-globe-maker">
    <div className="section-row"><div><h3>❄️ Snow Globe Maker</h3><p>Build a tiny North Pole world. Tap to place decorations!</p></div><span className="stat-chip">{pieces.length}/25 pieces</span></div>
    <div className="globe-layout"><div className={'globe-preview'+(shaking?' shaking':'')}>
      <svg viewBox="0 0 300 280" role="img" aria-label="Decorate your snow globe by tapping inside it" onClick={place}>
        <defs><clipPath id="globe-glass"><circle cx="150" cy="130" r="111"/></clipPath></defs>
        <circle cx="150" cy="130" r="113" fill={background} stroke="#b8f3ea" strokeWidth="6"/>
        <g clipPath="url(#globe-glass)">
          <path d="M0 191 Q150 129 300 193 V280 H0Z" fill="#e9f8f5"/>
          {Array.from({length:33},(_,i)=><circle key={i} cx={(i*73+37)%300} cy={(i*47+19)%210} r={i%3+1} fill="#fff" opacity=".8"/>)}
          {pieces.map((p,i)=><text key={i} x={p.x*3} y={p.y*2.8} fontSize="29" textAnchor="middle" dominantBaseline="middle">{p.icon}</text>)}
        </g>
        <ellipse cx="150" cy="249" rx="99" ry="16" fill="#e0d8b7"/>
        <path d="M77 232 H223 L238 269 H62Z" fill="#a83c56" stroke="#ffe9ac" strokeWidth="5"/>
        <text x="150" y="259" textAnchor="middle" fill="#fff4d2" fontSize="13" fontWeight="bold">NORTH POLE</text>
      </svg></div>
      <div className="globe-controls">
        <label>Sky color<select value={theme} onChange={e=>setTheme(e.target.value as SnowTheme)}>{THEMES.map(t=><option key={t}>{t}</option>)}</select></label>
        <div className="globe-pieces" role="group" aria-label="Choose a snow globe decoration">
          {PIECES.map(p=><button type="button" key={p.name} aria-pressed={selected===p.icon}
            className={selected===p.icon?'selected':''} onClick={()=>setSelected(p.icon)}><span>{p.icon}</span>{p.name}</button>)}
        </div>
        <div className="holiday-actions"><button className="action" type="button" onClick={save}>💾 Save globe</button>
          <button className="action secondary" type="button" onClick={()=>{setShaking(true);window.setTimeout(()=>setShaking(false),850);}}>❄ Shake</button>
          <button className="action secondary" type="button" onClick={()=>setPieces(a=>a.slice(0,-1))}>↶ Undo</button>
          <button className="action secondary" type="button" onClick={()=>{setPieces([]);setMessage('Blank snow globe ready!');}}>Clear</button>
        </div>
        <p className="holiday-feedback" role="status">{message}</p>
      </div>
    </div>
    <p className="arcade-hint">Your snow globe stays on this tablet. A saved globe with two decorations earns a passport stamp.</p>
  </section>;
}

// Stylized map positions (not geographic boundaries); each marker matches a country card.
const WORLD_PINS = [
  {x:340,y:111}, {x:132,y:173}, {x:535,y:195}, {x:346,y:87},
  {x:560,y:269}, {x:288,y:68}, {x:566,y:137}, {x:393,y:198},
];
const COUNTRIES = [
  { name:'Germany', flag:'🇩🇪', icon:'🕯️', tradition:'Many families use Advent calendars to count down the days to Christmas.', question:'What helps count the days until Christmas?', answers:['Advent calendar','Beach umbrella','Kite'], correct:0 },
  { name:'Mexico', flag:'🇲🇽', icon:'🪅', tradition:'Las Posadas is celebrated in many communities with processions, songs, and gatherings.', question:'What often happens during Las Posadas?', answers:['Singing together','Building snow forts','Flying kites'], correct:0 },
  { name:'Philippines', flag:'🇵🇭', icon:'⭐', tradition:'Colorful star-shaped parol lanterns are a cherished Christmas decoration.', question:'What shape is a traditional parol lantern?', answers:['A shoe','A star','A train'], correct:1 },
  { name:'Sweden', flag:'🇸🇪', icon:'🕯️', tradition:'Many people celebrate St. Lucia Day in December with candlelight and songs.', question:'What brightens St. Lucia celebrations?', answers:['Candles','Flashlights on cars','Fireworks only'], correct:0 },
  { name:'Australia', flag:'🇦🇺', icon:'☀️', tradition:'December is summertime in Australia, so some families celebrate outdoors.', question:'What season is it in Australia at Christmas?', answers:['Winter','Summer','Autumn'], correct:1 },
  { name:'Iceland', flag:'🇮🇸', icon:'🥾', tradition:'Stories tell of 13 Yule Lads who visit children in the days before Christmas.', question:'How many Yule Lads are in the stories?', answers:['3','13','30'], correct:1 },
  { name:'Japan', flag:'🇯🇵', icon:'🍰', tradition:'Christmas cakes with strawberries and whipped cream are popular with some families.', question:'Which treat is a Christmas favorite?', answers:['Strawberry cake','Pumpkin soup','Rice crackers'], correct:0 },
  { name:'Ethiopia', flag:'🇪🇹', icon:'⛪', tradition:'Many Ethiopian Orthodox Christians celebrate Christmas, called Ganna, on January 7.', question:'When is Ganna commonly celebrated?', answers:['January 7','July 4','October 31'], correct:0 },
];
export function ChristmasAroundWorld({ onComplete }: {onComplete:(stamp:'around-the-world')=>void}) {
  const [selected,setSelected]=useState(0);
  const [visited,setVisited]=useState<number[]>([]);
  const [answer,setAnswer]=useState<number|null>(null);
  const [correct,setCorrect]=useState<number[]>([]);
  const country=COUNTRIES[selected];
  function choose(i:number){setSelected(i);setVisited(a=>a.includes(i)?a:[...a,i]);setAnswer(null);}
  function reply(i:number) {
    if(answer!==null)return;
    setAnswer(i);
    if(i===country.correct&&!correct.includes(selected)){
      const next=[...correct,selected];setCorrect(next);
      if(next.length>=4)onComplete('around-the-world');
    }
  }
  return <section className="around-world">
    <header className="content-heading"><span className="eyebrow">🌍 MRS. CLAUS'S CULTURE CORNER</span>
      <h2>Christmas Around the World</h2><p>Visit countries and discover how people celebrate differently.</p></header>
    <div className="world-progress">🌎 {visited.length} countries explored · ⭐ {correct.length} quizzes completed</div>
    <div className="world-map-wrap">
      <svg className="world-map" viewBox="0 0 660 320" role="group" aria-label="Stylized interactive world map with eight holiday destinations">
        <rect width="660" height="320" rx="20" fill="#cce8ec"/>
        <g fill="#94caa4" stroke="#e9f7e9" strokeWidth="3">
          <path d="M34 48 Q86 15 156 33 L201 74 L186 113 L155 140 L135 196 L104 188 L83 150 L50 126Z"/>
          <path d="M158 177 L220 174 L236 229 L209 284 L191 313 L173 293 L175 250 L151 221Z"/>
          <path d="M268 59 L330 37 L377 56 L397 92 L382 125 L338 136 L316 166 L290 143 L286 105 L258 89Z"/>
          <path d="M321 157 L382 144 L432 174 L440 216 L419 276 L391 294 L369 257 L343 221Z"/>
          <path d="M385 51 L465 36 L555 53 L610 93 L609 136 L564 172 L530 196 L487 168 L456 135 L421 119Z"/>
          <path d="M530 237 L589 235 L623 267 L596 294 L549 293 L514 271Z"/>
          <path d="M256 51 L283 42 L301 54 L295 72 L270 72Z"/>
        </g>
        {WORLD_PINS.map((pin,i)=><g key={i} className="world-map-pin" tabIndex={0} role="button"
          aria-label={'Explore '+COUNTRIES[i].name} aria-pressed={selected===i}
          onClick={()=>choose(i)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(i);}}}
          transform={'translate('+pin.x+' '+pin.y+')'}>
          <circle r={selected===i?24:19} fill={selected===i?'#ffdb81':'#fffef4'} stroke="#367565" strokeWidth="3"/>
          <text y="8" textAnchor="middle" fontSize="23">{COUNTRIES[i].flag}</text>
        </g>)}
      </svg>
      <small>Tap a flag to explore. Map illustrations are simplified.</small>
    </div>
    <div className="world-country-list" role="group" aria-label="Choose a country">
      {COUNTRIES.map((c,i)=><button key={c.name} type="button" className={i===selected?'selected':''}
        aria-pressed={i===selected} onClick={()=>choose(i)}>{c.flag}<span>{c.name}</span></button>)}
    </div>
    <article className="world-card"><div className="world-card-icon">{country.flag} {country.icon}</div>
      <h3>{country.name}</h3><p>{country.tradition}</p>
      <h4>{country.question}</h4>
      <div className="world-answers">{country.answers.map((option,i)=><button type="button" key={option}
        disabled={answer!==null} className={answer!==null&&i===country.correct?'correct':''} onClick={()=>reply(i)}>{option}</button>)}</div>
      {answer!==null&&<p className="holiday-feedback" role="status">{answer===country.correct?'⭐ That’s right!':'Good try! The answer is '+country.answers[country.correct]+'.'}</p>}
      <button className="action" type="button" onClick={()=>choose((selected+1)%COUNTRIES.length)}>Next country →</button>
    </article>
    <p className="arcade-hint">Traditions vary between families and regions. Answer four questions correctly to earn your explorer passport stamp.</p>
  </section>;
}

export function CreativeStation({ mode, child, onComplete }: {
  mode:'snow-globe'|'cursive';child:ChildId;onComplete:(stamp:'snow-globe'|'cursive')=>void;
}) { return mode==='cursive'?<CursiveTracing child={child} onComplete={onComplete}/>:<SnowGlobeMaker child={child} onComplete={onComplete}/>; }
