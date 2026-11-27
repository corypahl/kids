import { useId, useState } from 'react';
import type { ChildId } from './data';
import { CharacterCreator } from './CreatorGames';
import { CookieBakery } from './Village';

type StudioMode = 'cookie' | 'snowman' | 'elf' | 'gingerbread';
type GingerPart = 'dough' | 'icing' | 'eyes' | 'mouth' | 'buttons' | 'outfit' | 'hat' | 'accessory' | 'scene';
type GingerLook = Record<GingerPart, number>;
type DesignChoice = { label: string; emoji: string; color?: string };
type DesignCategory = { id: GingerPart; label: string; icon: string; choices: DesignChoice[] };
type SavedGingerbread = { id: string; name: string; look: GingerLook };
const choices = (values: [string, string, string?][]): DesignChoice[] =>
  values.map(([label, emoji, color]) => ({ label, emoji, color }));

const GINGER_CATEGORIES: DesignCategory[] = [
  { id: 'dough', label: 'Cookie dough', icon: '🍪', choices: choices([
    ['Gingerbread','🍪','#BE8555'],['Honey','🍯','#E1AB70'],['Chocolate','🍫','#89573F'],['Pink sugar','🩷','#DF9FA2']
  ]) },
  { id: 'icing', label: 'Icing', icon: '🎨', choices: choices([
    ['Vanilla','🤍','#FFF7E8'],['Strawberry','🩷','#F0A1B3'],['Peppermint','❤️','#DF6771'],['Mint','💚','#8EDBC4'],['Blueberry','🩵','#90C6E7'],['Gold','💛','#F5DB8A']
  ]) },
  { id: 'eyes', label: 'Eyes', icon: '👀', choices: choices([
    ['Chocolate chips','🍫'],['Sprinkles','✨'],['Wink','😉'],['Stars','⭐']
  ]) },
  { id: 'mouth', label: 'Smile', icon: '😁', choices: choices([
    ['Sweet smile','😊'],['Big grin','😄'],['Surprised','😮'],['Silly','😋']
  ]) },
  { id: 'buttons', label: 'Buttons', icon: '🔘', choices: choices([
    ['Gumdrops','🍬'],['Candy hearts','💗'],['Stars','⭐'],['No buttons','➖']
  ]) },
  { id: 'outfit', label: 'Outfit', icon: '👗', choices: choices([
    ['Bow tie','🎀'],['Scarf','🧣'],['Apron','👩‍🍳'],['Vest','🦺'],['No outfit','✨']
  ]) },
  { id: 'hat', label: 'Headwear', icon: '🎩', choices: choices([
    ['Chef hat','👩‍🍳'],['Santa hat','🎅'],['Party bow','🎀'],['Crown','👑'],['No hat','➖']
  ]) },
  { id: 'accessory', label: 'Hold', icon: '🎁', choices: choices([
    ['Candy cane','🍬'],['Present','🎁'],['Cookie','🍪'],['Star wand','🪄'],['Nothing','🙌']
  ]) },
  { id: 'scene', label: 'Background', icon: '🏞️', choices: choices([
    ['Mrs. Claus’s kitchen','🍪'],['Snowy forest','❄️'],['Candy land','🍭'],['Starry night','🌙']
  ]) },
];
const STUDIO_MODES: { id: StudioMode; title: string; icon: string; description: string }[] = [
  { id:'cookie', title:'Cookies',icon:'🍪',description:'Decorate your own cookie' },
  { id:'snowman', title:'Snowmen',icon:'⛄',description:'Build a snow friend' },
  { id:'elf', title:'Elves',icon:'🧝',description:'Dress up a magical elf' },
  { id:'gingerbread', title:'Gingerbread',icon:'🎀',description:'Style a gingerbread friend' },
];
const defaultLook = (): GingerLook => ({
  dough:0,icing:0,eyes:0,mouth:0,buttons:0,outfit:0,hat:0,accessory:0,scene:0
});
function cleanLook(input: unknown): GingerLook {
  const saved = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string,unknown> : {};
  return Object.fromEntries(GINGER_CATEGORIES.map(cat => [
    cat.id, typeof saved[cat.id]==='number' && Number.isInteger(saved[cat.id]) &&
      (saved[cat.id] as number) >= 0 && (saved[cat.id] as number) < cat.choices.length
        ? saved[cat.id] : 0
  ])) as GingerLook;
}
const keyFor = (child: ChildId) => 'christmas-gingerbread-creations-v1:'+child;
function readSaved(child: ChildId): SavedGingerbread[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(keyFor(child)) || '[]');
    if (!Array.isArray(value)) return [];
    return value.slice(0,10).flatMap((item): SavedGingerbread[] => {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.name !== 'string') return [];
      return [{id:item.id.slice(0,100),name:item.name.slice(0,28),look:cleanLook(item.look)}];
    });
  } catch {return [];}
}
function GingerbreadPortrait({ look, name }: {look:GingerLook;name:string}) {
  const id = useId().replace(/:/g,'');
  const dough = GINGER_CATEGORIES[0].choices[look.dough].color!;
  const icing = GINGER_CATEGORIES[1].choices[look.icing].color!;
  const scenes = [
    {top:'#F8D9B0',bottom:'#FFF7DC'},
    {top:'#7EB8D5',bottom:'#E8FAF5'},
    {top:'#EEACC7',bottom:'#FFEBD4'},
    {top:'#324C79',bottom:'#9F86C1'}
  ];
  const scene = scenes[look.scene];
  const star=(cx:number,cy:number,color='#F5D278',size=13)=>
    <path d={'M'+cx+' '+(cy-size)+'L'+(cx+size*.33)+' '+(cy-size*.33)+'L'+(cx+size)+' '+cy+
      'L'+(cx+size*.33)+' '+(cy+size*.33)+'L'+cx+' '+(cy+size)+'L'+(cx-size*.33)+' '+(cy+size*.33)+
      'L'+(cx-size)+' '+cy+'L'+(cx-size*.33)+' '+(cy-size*.33)+'Z'} fill={color} stroke="#FFF8E7" strokeWidth="2" />;
  return <svg viewBox="0 0 440 500" className="gingerbread-svg" role="img" aria-label={'Your customized gingerbread character, '+name}>
    <defs>
      <linearGradient id={id+'sky'} x1="0" x2="0" y1="0" y2="1"><stop stopColor={scene.top}/><stop offset="1" stopColor={scene.bottom}/></linearGradient>
    </defs>
    <rect width="440" height="500" rx="22" fill={'url(#'+id+'sky)'}/>
    {look.scene===0 && <g opacity=".75"><path d="M0 110H440M0 200H440M0 290H440" stroke="#FFE5BC" strokeWidth="8"/>
      <text x="24" y="91" fontSize="45">🍰</text><text x="345" y="91" fontSize="43">🥣</text>
      <path d="M15 372H425" stroke="#BB8869" strokeWidth="20"/></g>}
    {look.scene===1 && <g><path d="M0 332Q90 285 200 341T440 320V500H0Z" fill="#F9FFFF"/>
      {[40,125,338,401].map((x,i)=><g key={x}><path d={'M'+x+' '+(270+i%2*37)+'l-36 62h72Z'} fill="#438F77"/><path d={'M'+x+' '+(299+i%2*37)+'l-42 65h84Z'} fill="#327963"/></g>)}</g>}
    {look.scene===2 && <g><path d="M0 344Q125 280 255 338T440 319V500H0Z" fill="#FFF3ED"/>
      {['🍭','🍬','🍭'].map((v,i)=><text key={i} x={25+i*159} y={318+i%2*37} fontSize="47">{v}</text>)}</g>}
    {look.scene===3 && <g><circle cx="345" cy="74" r="42" fill="#FFF2D2"/>
      {Array.from({length:16},(_,i)=>star((i*89+13)%410,(i*61+21)%312,'#FFF6C3',i%3===0?8:4))}</g>}
    <ellipse cx="220" cy="422" rx="121" ry="19" fill="#445A5B" opacity=".21"/>
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* Main cookie: arms, head, torso and legs form one silhouette. */}
      <path d="M173 203 Q156 180 154 147 Q152 87 218 78 Q288 79 288 145 Q291 181 270 203
        L314 225 Q340 234 353 261 Q362 285 344 304 Q329 318 305 306
        L277 286 L275 342 L299 389 Q312 414 296 429 Q277 448 256 428
        L220 385 L182 427 Q161 446 143 429 Q128 412 145 387
        L167 341 L164 285 L131 310 Q107 322 90 305 Q70 280 92 251
        Q104 233 144 215 Z"
        fill={dough} stroke="#8B5237" strokeWidth="9"/>
      <path d="M175 202 Q148 157 164 118 Q176 82 220 84 Q276 90 281 139 Q286 179 263 207"
        fill="none" stroke={icing} strokeWidth="10" opacity=".95"/>
      <path d="M126 246L106 265M313 245L331 264M169 359L156 390M270 361L283 391"
        stroke={icing} strokeWidth="10" opacity=".95"/>
      <path d="M123 288Q135 279 147 289M295 289Q311 278 322 290M160 416Q179 405 191 414M250 414Q266 406 285 416"
        stroke={icing} strokeWidth="9" fill="none"/>
      {/* Eyes and icing smiles */}
      {look.eyes===0 && <><circle cx="191" cy="149" r="9" fill="#533A35"/><circle cx="248" cy="149" r="9" fill="#533A35"/></>}
      {look.eyes===1 && <><circle cx="191" cy="149" r="11" fill={icing} stroke="#FFF5E4" strokeWidth="3"/><circle cx="248" cy="149" r="11" fill={icing} stroke="#FFF5E4" strokeWidth="3"/></>}
      {look.eyes===2 && <><path d="M179 151Q191 138 201 151" fill="none" stroke="#533A35" strokeWidth="6"/><circle cx="248" cy="149" r="9" fill="#533A35"/></>}
      {look.eyes===3 && <>{star(191,149)}{star(248,149)}</>}
      {look.mouth===0 && <path d="M197 184Q220 203 242 184" fill="none" stroke={icing} strokeWidth="7"/>}
      {look.mouth===1 && <><path d="M194 182Q220 213 244 182Z" fill="#723E39" stroke={icing} strokeWidth="5"/><path d="M201 184H238" stroke="#FFF6E8" strokeWidth="4"/></>}
      {look.mouth===2 && <ellipse cx="219" cy="187" rx="11" ry="13" fill="#713E3A" stroke={icing} strokeWidth="4"/>}
      {look.mouth===3 && <><path d="M197 184Q220 201 243 184" fill="none" stroke={icing} strokeWidth="6"/><ellipse cx="237" cy="201" rx="8" ry="11" fill="#E68696"/></>}
      <circle cx="168" cy="184" r="8" fill="#ED9CA7" opacity=".65"/><circle cx="273" cy="184" r="8" fill="#ED9CA7" opacity=".65"/>
      {look.buttons!==3 && [273,303,333].map((cy,i)=>look.buttons===0?<circle key={cy} cx="220" cy={cy} r="12" fill={['#E8AA7F','#A6C9B2','#F4C97D'][i]} stroke="#FFF1D6" strokeWidth="4"/>:
        look.buttons===1?<path key={cy} d={'M220 '+(cy+10)+'Q194 '+(cy-4)+' 208 '+(cy-14)+'Q220 '+(cy-19)+' 220 '+(cy-9)+'Q231 '+(cy-20)+' 243 '+(cy-13)+'Q255 '+(cy-1)+' 220 '+(cy+10)+'Z'} fill="#E994A4"/>:
        <g key={cy}>{star(220,cy,'#FFE294',12)}</g>)}
      {look.outfit===0 && <g><path d="M220 233Q187 211 186 239Q183 263 218 247Q249 265 256 239Q258 215 220 233Z" fill="#F090A7" stroke={icing} strokeWidth="3"/><circle cx="220" cy="240" r="9" fill="#FCE9A9"/></g>}
      {look.outfit===1 && <g><path d="M175 222Q220 244 265 222" fill="none" stroke={icing} strokeWidth="16"/><path d="M245 230Q262 258 258 306L239 311Q234 269 230 246" fill="#DA697F" stroke="#FFF1DA" strokeWidth="4"/></g>}
      {look.outfit===2 && <g><path d="M177 249L175 356Q221 372 264 356L261 249Z" fill="#FFF3CF" stroke="#DAAE91" strokeWidth="5"/><path d="M188 248Q219 267 248 248M185 291H257" stroke="#E4A27D" strokeWidth="5" fill="none"/>{star(220,327,'#E9AA60',14)}</g>}
      {look.outfit===3 && <g><path d="M172 242L202 232L218 340L189 344L178 302ZM269 242L238 232L220 340L252 344L264 300Z" fill="#63A48D" stroke="#FFF5DB" strokeWidth="5"/></g>}
      {look.hat===0 && <g><path d="M168 104Q151 79 172 63Q158 21 201 35Q219 3 244 32Q285 17 281 58Q303 81 274 103Z" fill="#FFFCED" stroke="#E0D0B8" strokeWidth="5"/><path d="M169 101Q220 91 276 101" stroke="#FFF8E6" strokeWidth="15"/></g>}
      {look.hat===1 && <g><path d="M164 112Q173 54 222 36Q275 33 287 111Z" fill="#D35C66" stroke="#FFF3D8" strokeWidth="5"/><path d="M165 112Q220 99 290 112" stroke="#FFF7ED" strokeWidth="16"/><circle cx="223" cy="37" r="17" fill="#FFF9EE"/></g>}
      {look.hat===2 && <g><path d="M221 101Q173 81 172 107Q172 132 216 116Q258 134 266 108Q266 82 221 101Z" fill="#E894AA" stroke="#FFF1D7" strokeWidth="4"/><circle cx="220" cy="109" r="10" fill="#FFE4A0"/></g>}
      {look.hat===3 && <g><path d="M175 116L169 64L192 80L219 52L247 80L273 64L270 116Z" fill="#FBE19B" stroke="#CEAD66" strokeWidth="5"/>{star(219,90,'#D87BA0',10)}</g>}
      {look.accessory===0 && <g><path d="M334 285V208Q334 186 353 186Q371 186 372 208" fill="none" stroke="#FFF6E6" strokeWidth="15"/><path d="M334 261L343 270M334 224L346 236M350 187L360 204" stroke="#D66776" strokeWidth="8"/></g>}
      {look.accessory===1 && <g><rect x="320" y="246" width="59" height="60" rx="5" fill="#D57991" stroke="#FFF4DB" strokeWidth="4"/><path d="M350 246V303M323 275H375" stroke="#FDE6AB" strokeWidth="8"/></g>}
      {look.accessory===2 && <g><circle cx="347" cy="267" r="34" fill="#DAAC7A" stroke="#A56B48" strokeWidth="5"/><circle cx="335" cy="259" r="5" fill="#644739"/><circle cx="360" cy="268" r="5" fill="#644739"/><circle cx="349" cy="280" r="5" fill="#644739"/></g>}
      {look.accessory===3 && <g><path d="M333 289L354 216" stroke="#8E654E" strokeWidth="8"/>{star(354,210,'#FFE08B',25)}</g>}
    </g>
    <rect x="100" y="446" width="240" height="43" rx="16" fill="#FFF9E8" stroke="#D7B681" strokeWidth="3"/>
    <text x="220" y="474" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="21" fill="#5C6651">{name.trim().slice(0,20)||'My Gingerbread'}</text>
  </svg>;
}
function GingerbreadDesigner({ child }: { child: ChildId }) {
  const [look, setLook] = useState<GingerLook>(defaultLook);
  const [category, setCategory] = useState<GingerPart>('dough');
  const [name, setName] = useState('Gingersnap');
  const [saved, setSaved] = useState<SavedGingerbread[]>(()=>readSaved(child));
  const [message, setMessage] = useState('');
  const active = GINGER_CATEGORIES.find(item=>item.id===category)!;
  function persist(items:SavedGingerbread[]) {
    try {localStorage.setItem(keyFor(child),JSON.stringify(items));setSaved(items);return true;}
    catch {setMessage('This tablet could not save right now. You can still design!');return false;}
  }
  function save() {
    const displayName=name.trim().slice(0,28)||'My Gingerbread';
    const entry:SavedGingerbread={id:String(Date.now())+'-'+Math.random().toString(36).slice(2,8),name:displayName,look:{...look}};
    if(persist([entry,...saved].slice(0,10))) setMessage('✨ '+displayName+' is saved on this tablet!');
  }
  return <section className="gingerbread-designer" aria-label="Design a gingerbread character">
    <header className="creator-heading">
      <span className="eyebrow">🍪 MRS. CLAUS’S KITCHEN</span>
      <h2>Make a Gingerbread Friend!</h2>
      <p>Choose icing, expressions, candy clothes and more. Every gingerbread friend is different!</p>
    </header>
    <div className="creator-layout">
      <div className="creator-preview-card gingerbread-preview-card">
        <div className="creator-preview-header">🍪 Your gingerbread friend <span aria-hidden="true">✦ ✧ ✦</span></div>
        <div className="creator-preview"><GingerbreadPortrait look={look} name={name}/></div>
        <label className="creator-name-label" htmlFor="gingerbread-name">Name your gingerbread friend</label>
        <input id="gingerbread-name" className="creator-name" value={name} maxLength={28}
          onChange={event=>setName(event.target.value)}/>
        <div className="creator-actions">
          <button type="button" className="action" onClick={save}>💖 Save character</button>
          <button type="button" className="pill" onClick={()=>{
            setLook(Object.fromEntries(GINGER_CATEGORIES.map(part=>[part.id,Math.floor(Math.random()*part.choices.length)])) as GingerLook);
            setMessage('✨ Surprise! A new look!');
          }}>🎲 Surprise me!</button>
          <button type="button" className="pill" onClick={()=>{setLook(defaultLook());setName('Gingersnap');setMessage('Ready to make a new friend!');}}>↻ Start over</button>
        </div>
        {message && <p className="creator-message" role="status">{message}</p>}
      </div>
      <div className="creator-customize">
        <h3>🎨 Dress your gingerbread</h3>
        <p>Pick something to change and try all the choices.</p>
        <div className="creator-category-list" role="group" aria-label="Gingerbread parts">
          {GINGER_CATEGORIES.map(part=><button type="button" key={part.id} aria-pressed={category===part.id}
            className={'creator-category'+(category===part.id?' selected':'')}
            onClick={()=>setCategory(part.id)}><span>{part.icon}</span><small>{part.label}</small></button>)}
        </div>
        <div className="creator-choices">
          <h4>{active.icon} Choose {active.label.toLowerCase()}</h4>
          <div className="creator-choice-grid" role="group" aria-label={active.label}>
            {active.choices.map((choice,i)=><button type="button" key={choice.label} aria-pressed={look[active.id]===i}
              className={'creator-choice'+(look[active.id]===i?' chosen':'')}
              onClick={()=>{setLook(value=>({...value,[active.id]:i}));setMessage('');}}>
              {choice.color?<span className="creator-swatch" style={{background:choice.color}} aria-hidden="true"/>:
                <span className="creator-choice-icon" aria-hidden="true">{choice.emoji}</span>}
              <strong>{choice.label}</strong>
              {look[active.id]===i && <span className="creator-check" aria-hidden="true">✓</span>}
            </button>)}
          </div>
        </div>
        <p className="creator-tip">🍭 Mix and match colors, clothes, candy and backgrounds!</p>
      </div>
    </div>
    <section className="creator-collection" aria-label="Saved gingerbread creations">
      <div className="creator-collection-heading">
        <div><span className="eyebrow">MY GINGERBREAD COLLECTION</span><h3>My saved characters <span>({saved.length}/10)</span></h3></div>
        <p>Saved for this child on this tablet. Tap to dress up again.</p>
      </div>
      {saved.length===0?<div className="creator-empty">Save your first gingerbread friend to start a collection!</div>:
        <div className="creator-saved-grid">{saved.map(entry=><article key={entry.id} className="creator-saved">
          <button type="button" className="creator-saved-open" aria-label={'Load '+entry.name} onClick={()=>{
            setLook(cleanLook(entry.look));setName(entry.name);setMessage('Welcome back, '+entry.name+'!');
          }}><span className="creator-saved-art"><GingerbreadPortrait look={entry.look} name={entry.name}/></span><strong>{entry.name}</strong><small>Tap to design again</small></button>
          <button type="button" className="creator-delete" aria-label={'Delete '+entry.name}
            onClick={()=>{if(persist(saved.filter(item=>item.id!==entry.id)))setMessage('Character removed.');}}>✕ Remove</button>
        </article>)}</div>}
    </section>
  </section>;
}
export function DesignStudio({ child }: { child: ChildId }) {
  const [mode, setMode] = useState<StudioMode>('cookie');
  return <section className="design-studio" aria-label="Mrs. Claus's Design Studio">
    <div className="studio-welcome">
      <span className="eyebrow">🎨 CHRISTMAS VILLAGE</span>
      <h1>Mrs. Claus’s Design Studio</h1>
      <p>What will you create today? Choose a project and make it your own!</p>
    </div>
    <nav className="studio-picker" aria-label="Choose a creative project">
      {STUDIO_MODES.map(project=><button type="button" key={project.id}
        aria-current={mode===project.id?'page':undefined}
        aria-pressed={mode===project.id}
        className={'studio-option'+(mode===project.id?' active':'')}
        onClick={()=>setMode(project.id)}>
        <span className="studio-option-icon" aria-hidden="true">{project.icon}</span>
        <strong>{project.title}</strong>
        <small>{project.description}</small>
      </button>)}
    </nav>
    <div className="studio-workspace">
      {/* Keep inactive editors mounted so a child can switch without losing an unfinished creation. */}
      <div className="studio-panel" hidden={mode!=='cookie'}><CookieBakery /></div>
      <div className="studio-panel" hidden={mode!=='snowman'}><CharacterCreator kind="snowman" child={child}/></div>
      <div className="studio-panel" hidden={mode!=='elf'}><CharacterCreator kind="elf" child={child}/></div>
      <div className="studio-panel" hidden={mode!=='gingerbread'}><GingerbreadDesigner child={child}/></div>
    </div>
  </section>;
}
