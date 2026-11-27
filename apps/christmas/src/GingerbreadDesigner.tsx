import { useId, useState } from 'react';
import type { ChildId } from './data';

type Piece = { label: string; icon: string; color?: string };
type Group = { id: string; label: string; icon: string; pieces: readonly Piece[] };
type Look = Record<string, number>;
type SavedDesign = { id: string; name: string; look: Look };

const P = (label:string, icon:string, color?:string):Piece => ({label,icon,color});
const OPTIONS: readonly Group[] = [
  {id:'dough',label:'Cookie',icon:'🍪',pieces:[P('Golden','🍪','#c98757'),P('Honey','🍯','#dfa76a'),P('Chocolate','🍫','#875139'),P('Cinnamon','🧡','#b16c42')]},
  {id:'shape',label:'Shape',icon:'🧸',pieces:[P('Classic','🧍'),P('Cookie dress','👗'),P('Snowflake','❄️')]},
  {id:'icing',label:'Icing',icon:'🎨',pieces:[P('Vanilla','🤍','#fff5e7'),P('Peppermint','❤️','#e56b77'),P('Mint','💚','#84d2b2'),P('Blueberry','🩵','#82bde8'),P('Lavender','💜','#bf9bd7')]},
  {id:'eyes',label:'Eyes',icon:'👀',pieces:[P('Chocolate','🍫'),P('Sparkly','✨'),P('Winking','😉'),P('Sleepy','😌')]},
  {id:'smile',label:'Smile',icon:'😄',pieces:[P('Happy','🙂'),P('Big grin','😁'),P('Surprised','😮'),P('Cheeky','😋')]},
  {id:'buttons',label:'Buttons',icon:'🔘',pieces:[P('Gumdrops','🍬'),P('Candy hearts','💗'),P('Stars','⭐'),P('Chocolate chips','🍫'),P('None','❌')]},
  {id:'hat',label:'Headwear',icon:'🎀',pieces:[P('Bow','🎀'),P('Santa hat','🎅'),P('Icing swirl','🍥'),P('Candy crown','👑'),P('None','➖')]},
  {id:'extra',label:'Hold',icon:'🎁',pieces:[P('Candy cane','🍬'),P('Present','🎁'),P('Magic star','⭐'),P('Nothing','🙌')]},
  {id:'scene',label:'Place',icon:'🏞️',pieces:[P('Sugar kitchen','🧁'),P('Candy town','🍭'),P('Snowy night','🌙'),P('Party lights','🎉')]},
];
const read = (look: Look, key:string) => look[key] ?? 0;
const initial = ():Look => Object.fromEntries(OPTIONS.map(o=>[o.id,0]));
const validated = (v:unknown):Look => {
  const source = v && typeof v==='object' && !Array.isArray(v) ? v as Record<string,unknown> : {};
  return Object.fromEntries(OPTIONS.map(o=>[o.id,typeof source[o.id]==='number' && Number.isInteger(source[o.id]) && (source[o.id] as number)>=0 && (source[o.id] as number)<o.pieces.length?source[o.id]:0])) as Look;
};
const savedKey = (child: ChildId) => 'christmas-gingerbread-designer-v1-'+child;
function savedFor(child:ChildId):SavedDesign[]{
  try{
    const value:unknown=JSON.parse(localStorage.getItem(savedKey(child))||'[]');
    if(!Array.isArray(value))return [];
    return value.slice(0,10).filter(v=>v&&typeof v==='object'&&typeof v.id==='string'&&typeof v.name==='string')
      .map(v=>({id:String(v.id).slice(0,90),name:String(v.name).slice(0,28),look:validated(v.look)}));
  }catch{return [];}
}
function GingerbreadArt({look}:{look:Look}) {
  const uid=useId().replace(/:/g,'');
  const dough=OPTIONS[0].pieces[read(look,'dough')].color||'#c98757';
  const icing=OPTIONS[2].pieces[read(look,'icing')].color||'#fff5e7';
  const scene=read(look,'scene'), shape=read(look,'shape');
  const sky=['#e9bca8','#f7c5db','#27446c','#8067af'][scene];
  const silhouette=shape===1
    ? 'M135 190C111 193 88 232 71 247Q51 266 72 284Q91 303 109 278L129 261L115 320Q107 336 91 373Q89 389 112 390H247Q268 387 262 373L233 319L232 260L254 282Q279 306 295 284Q314 260 288 244L244 191Q227 179 216 184L196 191L163 191Z'
    :shape===2
    ? 'M179 180Q222 192 253 227Q280 260 262 296L277 327Q284 340 268 349L224 360L205 388Q192 402 179 382Q165 403 152 387L133 359L90 346Q71 339 82 320L101 291Q80 259 105 230Q136 192 179 180Z'
    : 'M143 190Q113 181 90 226L70 258Q59 278 80 287Q102 295 112 273L132 252L137 301L112 362Q100 385 124 392Q144 398 158 371L179 339L202 371Q216 397 237 391Q260 382 246 358L222 301L225 252L249 277Q265 302 287 285Q308 269 286 245L253 205Q236 182 216 185L196 191L163 191Z';
  return <svg className="creator-svg" viewBox="0 0 360 420" role="img" aria-label="A gingerbread cookie decorated with your chosen icing, face, candy and clothes">
    <defs><linearGradient id={uid+'sky'} x1="0" x2="0" y1="0" y2="1"><stop stopColor={sky}/><stop offset="1" stopColor={scene===2?'#8eacc6':'#f7e9cc'}/></linearGradient></defs>
    <rect width="360" height="420" rx="25" fill={'url(#'+uid+'sky)'}/>
    {scene===0&&<><rect x="13" y="56" width="334" height="194" rx="11" fill="#f8e0c2" opacity=".43"/><path d="M15 143H345M15 218H345" fill="none" stroke="#b87e60" strokeWidth="10" opacity=".55"/><text x="45" y="198" fontSize="52">🧁</text><text x="264" y="195" fontSize="55">🍬</text></>}
    {scene===1&&Array.from({length:5},(_,i)=><g key={i} transform={'translate('+(i*74+32)+' '+(255+i%2*35)+')'}><rect x="-6" width="12" height="66" rx="5" fill="#f8e9df"/><circle r="21" fill={i%2===0?'#e77796':'#a1e2b4'} stroke="#fff2e1" strokeWidth="4"/></g>)}
    {scene===2&&<><circle cx="287" cy="74" r="30" fill="#fff1cb"/>{Array.from({length:18},(_,i)=><circle key={i} cx={(i*79+15)%355} cy={(i*51+19)%300} r={i%3+2} fill="#fff9d7"/>)}</>}
    {scene===3&&<path d="M0 60Q180 105 360 57" fill="none" stroke="#fff8d3" strokeWidth="5" strokeDasharray="9 8"/>}
    <path d="M0 335Q117 293 204 333Q300 300 360 332V420H0Z" fill="#fcf7e7" opacity=".82"/>
    <ellipse cx="181" cy="379" rx="123" ry="19" fill="#765b59" opacity=".24"/>
    <path d={silhouette} fill={dough} stroke="#a36641" strokeWidth="10" strokeLinejoin="round"/>
    <path d={silhouette} fill="none" stroke="#f6d8a0" strokeWidth="4" strokeLinejoin="round" transform="translate(0,-4)"/>
    <circle cx="180" cy="143" r="64" fill={dough} stroke="#a36641" strokeWidth="8"/>
    <path d="M142 117Q180 92 220 117" fill="none" stroke={icing} strokeWidth="8" strokeLinecap="round"/>
    {read(look,'eyes')===2?<><circle cx="159" cy="151" r="7" fill="#4d3633"/><path d="M196 150q12 -8 24 0" stroke="#4d3633" strokeWidth="5" fill="none" strokeLinecap="round"/></>:
      read(look,'eyes')===3?<><path d="M144 154q14 9 27 0M194 154q14 9 27 0" stroke="#4d3633" strokeWidth="5" fill="none" strokeLinecap="round"/></>:
      <><circle cx="158" cy="150" r="8" fill={read(look,'eyes')===1?'#f6df94':'#4d3633'}/><circle cx="208" cy="150" r="8" fill={read(look,'eyes')===1?'#f6df94':'#4d3633'}/>{read(look,'eyes')===1&&<><circle cx="158" cy="150" r="4" fill="#5b4038"/><circle cx="208" cy="150" r="4" fill="#5b4038"/></>}</>}
    <circle cx="144" cy="174" r="9" fill="#df8290" opacity=".58"/><circle cx="216" cy="174" r="9" fill="#df8290" opacity=".58"/>
    {read(look,'smile')===2?<ellipse cx="182" cy="186" rx="10" ry="12" fill="#7c494b"/>:
      read(look,'smile')===1?<path d="M161 185Q182 216 202 185Z" fill="#8b4c51" stroke={icing} strokeWidth="3"/>:
      <path d={read(look,'smile')===3?'M161 185Q177 195 199 181':'M161 183Q181 203 201 183'} fill="none" stroke={icing} strokeWidth="6" strokeLinecap="round"/>}
    <path d="M127 239Q129 258 144 264M218 260Q230 254 232 238" stroke={icing} strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M124 357Q140 349 154 355M208 355Q223 348 241 354" stroke={icing} strokeWidth="9" fill="none" strokeLinecap="round"/>
    {shape===1&&<path d="M132 289Q182 306 226 289L251 372Q181 389 105 373Z" fill="#e8799c" stroke={icing} strokeWidth="6"/>}
    {read(look,'buttons')!==4&&[248,283,318].map((y,i)=>read(look,'buttons')===0?<circle key={y} cx="179" cy={y} r="11" fill={['#e48195','#8fbf9e','#efd276'][i]} stroke={icing} strokeWidth="3"/>:
      read(look,'buttons')===1?<path key={y} d={'M179 '+(y+11)+'Q155 '+(y-4)+' 169 '+(y-12)+'Q176 '+(y-16)+' 179 '+(y-8)+'Q189 '+(y-19)+' 195 '+(y-10)+'Q206 '+(y+1)+' 179 '+(y+11)+'Z'} fill="#ed899b"/>:
      read(look,'buttons')===2?<text key={y} x="163" y={y+10} fontSize="30">⭐</text>:<g key={y}><circle cx="179" cy={y} r="11" fill="#5d3a36"/><circle cx="176" cy={y-3} r="2.5" fill="#fff4e5"/></g>)}
    {read(look,'hat')===0&&<g><path d="M154 99Q129 79 138 68Q150 61 179 99Q213 61 224 70Q239 82 202 104Z" fill="#e889a2" stroke={icing} strokeWidth="5"/><circle cx="180" cy="100" r="10" fill="#f5df8d"/></g>}
    {read(look,'hat')===1&&<><path d="M121 120Q124 41 192 32Q240 32 244 102L276 97" fill="#d96172" stroke="#fff6e5" strokeWidth="5"/><path d="M126 112Q182 102 235 114" fill="none" stroke="#fff7eb" strokeWidth="17"/><circle cx="277" cy="98" r="20" fill="#fff7ed"/></>}
    {read(look,'hat')===2&&<path d="M139 112Q128 92 147 87Q141 66 161 68Q171 45 186 68Q212 52 215 83Q235 95 219 115" fill="none" stroke={icing} strokeWidth="14" strokeLinecap="round"/>}
    {read(look,'hat')===3&&<path d="M132 114L126 72L149 88L172 58L196 89L228 65L232 113Z" fill="#f4d47d" stroke={icing} strokeWidth="5"/>}
    {read(look,'extra')===0&&<g transform="translate(283 280) rotate(18)"><path d="M0 70V-28Q0 -50 20 -50Q37 -50 37 -31" fill="none" stroke="#fff7e3" strokeWidth="13" strokeLinecap="round"/><path d="M0 41L13 53M0 10L13 23M0 -22L12 -10M20 -50L31 -34" fill="none" stroke="#d86578" strokeWidth="7"/></g>}
    {read(look,'extra')===1&&<g><rect x="255" y="270" width="59" height="57" rx="6" fill="#e88695" stroke="#fff3da" strokeWidth="3"/><path d="M285 270V327M256 299H314" stroke="#fff2bf" strokeWidth="8"/></g>}
    {read(look,'extra')===2&&<text x="251" y="303" fontSize="54">⭐</text>}
    {scene===3&&Array.from({length:7},(_,i)=><circle key={i} cx={i*51+26} cy={71+(i%2)*8} r="6" fill={['#f9e3a5','#c1ffd6','#f69cb4'][i%3]}/>)}
  </svg>;
}

export function GingerbreadDesigner({child}:{child:ChildId}){
  const [look,setLook]=useState<Look>(initial);
  const [groupId,setGroupId]=useState(OPTIONS[0].id);
  const [name,setName]=useState('Gumdrop');
  const [saved,setSaved]=useState<SavedDesign[]>(()=>savedFor(child));
  const [message,setMessage]=useState('');
  const group=OPTIONS.find(g=>g.id===groupId)||OPTIONS[0];
  const update=(id:string,n:number)=>{setLook(prev=>({...prev,[id]:n}));setMessage('');};
  function persist(next:SavedDesign[]){
    try { localStorage.setItem(savedKey(child),JSON.stringify(next));setSaved(next);return true; }
    catch {setMessage('This tablet cannot save right now. You can still decorate!');return false;}
  }
  function save() {
    const clean=name.trim().slice(0,28)||'My Gingerbread';
    const next={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),name:clean,look:{...look}};
    if(persist([next,...saved].slice(0,10)))setMessage('💖 '+clean+' was added to your collection!');
  }
  function surprise(){
    setLook(Object.fromEntries(OPTIONS.map(g=>[g.id,Math.floor(Math.random()*g.pieces.length)])));
    setMessage('✨ Surprise! What a sweet new look!');
  }
  function clear(){setLook(initial());setName('Gumdrop');setMessage('A fresh cookie friend is ready!');}
  return <section className="character-creator creator-gingerbread">
    <div className="creator-heading"><span className="eyebrow">🍪 GINGERBREAD DECORATING</span>
      <h2>Make a gingerbread friend!</h2>
      <p>Choose icing, candy, funny faces, and accessories. Each cookie can be different!</p>
    </div>
    <div className="creator-layout">
      <div className="creator-preview-card">
        <div className="creator-preview-header"><span>🍬 Your gingerbread friend</span><span className="creator-sparkle" aria-hidden="true">✦ ✧ ✦</span></div>
        <div className="creator-preview"><GingerbreadArt look={look}/></div>
        <label className="creator-name-label" htmlFor="gingerbread-name">Give your gingerbread a name</label>
        <input id="gingerbread-name" maxLength={28} className="creator-name" value={name} onChange={e=>setName(e.target.value)} />
        <div className="creator-actions">
          <button type="button" className="action" onClick={save}>💖 Save gingerbread</button>
          <button type="button" className="pill" onClick={surprise}>🎲 Surprise me!</button>
          <button type="button" className="pill" onClick={clear}>↻ New gingerbread</button>
        </div>
        {message&&<p className="creator-message" role="status">{message}</p>}
      </div>
      <div className="creator-customize">
        <h3>🎨 Make it yours</h3><p>Choose a part, then pick your favorite style.</p>
        <div className="creator-category-list" role="group" aria-label="Gingerbread customization">
          {OPTIONS.map(item=><button key={item.id} type="button" className={'creator-category'+(group.id===item.id?' selected':'')}
            aria-pressed={group.id===item.id} onClick={()=>setGroupId(item.id)}>
            <span>{item.icon}</span><small>{item.label}</small>
          </button>)}
        </div>
        <div className="creator-choices">
          <h4>{group.icon} Choose {group.label.toLowerCase()}</h4>
          <div className="creator-choice-grid">
            {group.pieces.map((piece,i)=><button key={piece.label} type="button"
              className={'creator-choice'+(read(look,group.id)===i?' chosen':'')} aria-pressed={read(look,group.id)===i}
              onClick={()=>update(group.id,i)}>
              {piece.color?<span className="creator-swatch" style={{backgroundColor:piece.color}} aria-hidden="true"/>:
                <span className="creator-choice-icon" aria-hidden="true">{piece.icon}</span>}
              <strong>{piece.label}</strong>
              {read(look,group.id)===i&&<span className="creator-check" aria-hidden="true">✓</span>}
            </button>)}
          </div>
        </div>
        <p className="creator-tip">🍬 Try different icing colors and candy combinations!</p>
      </div>
    </div>
    <section className="creator-collection" aria-label="Saved gingerbread designs">
      <div className="creator-collection-heading"><div><span className="eyebrow">💖 MY SWEET COLLECTION</span>
        <h3>My saved gingerbread <span>({saved.length}/10)</span></h3></div>
        <p>Saved on this tablet for this child's profile. Tap to decorate again!</p>
      </div>
      {!saved.length?<div className="creator-empty">✨ Your collection is waiting! Save your first gingerbread friend.</div>:
      <div className="creator-saved-grid">{saved.map(item=><article key={item.id} className="creator-saved">
        <button type="button" className="creator-saved-open" onClick={()=>{setLook(validated(item.look));setName(item.name);setMessage('Welcome back, '+item.name+'!');}}>
          <span className="creator-saved-art"><GingerbreadArt look={item.look}/></span>
          <strong>{item.name}</strong><small>Dress me up!</small>
        </button>
        <button type="button" className="creator-delete" onClick={()=>{if(persist(saved.filter(v=>v.id!==item.id)))setMessage(item.name+' removed.');}}>✕ Remove</button>
      </article>)}</div>}
    </section>
  </section>;
}
