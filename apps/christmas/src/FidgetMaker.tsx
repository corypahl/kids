import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { nativeChristmas } from './api';
import type { ChildId } from './data';

type FidgetShape = 'blob'|'heart'|'star'|'cat'|'square';
type FidgetFilling = 'jelly'|'glitter'|'beads'|'snow'|'foam';
type FidgetLook = { shape:FidgetShape; color:string; filling:FidgetFilling; firmness:number };
type SavedFidget = { id:string; name:string; look:FidgetLook };
type MotionMode = 'off'|'web'|'native'|'unavailable';
const SHAPES:{value:FidgetShape;icon:string;label:string}[]=[
  {value:'blob',icon:'🫧',label:'Jelly blob'},
  {value:'heart',icon:'💗',label:'Heart'},
  {value:'star',icon:'⭐',label:'Star'},
  {value:'cat',icon:'🐱',label:'Kitty'},
  {value:'square',icon:'🧊',label:'Squishy cube'},
];
const COLORS = [
  {name:'Bubblegum',value:'#f2a1cb'},{name:'Grape',value:'#b5a0ef'},
  {name:'Ocean',value:'#72d0e5'},{name:'Mint',value:'#8bd8bd'},
  {name:'Sunshine',value:'#f7d47b'},{name:'Peach',value:'#f4a88b'},
];
const FILLINGS:{value:FidgetFilling;label:string;icon:string;hint:string}[]=[
  {value:'jelly',label:'Jelly',icon:'💧',hint:'Smooth and wobbly'},
  {value:'glitter',label:'Glitter',icon:'✨',hint:'Sparkly swirls'},
  {value:'beads',label:'Water beads',icon:'🫧',hint:'Bouncy little beads'},
  {value:'snow',label:'Snowflakes',icon:'❄️',hint:'Snow globe magic'},
  {value:'foam',label:'Foam bubbles',icon:'☁️',hint:'Cloud-soft filling'},
];
const DEFAULT:FidgetLook={shape:'blob',color:'#f2a1cb',filling:'glitter',firmness:35};
const PATHS:Record<FidgetShape,string>={
  blob:'M179 53C234 36 277 75 298 116C336 190 295 292 211 304C118 322 49 265 56 183C60 105 106 63 179 53Z',
  heart:'M180 307C150 279 63 218 50 149C38 88 79 58 123 66C149 70 171 89 180 112C190 85 220 63 251 66C307 68 327 115 307 162C284 221 212 285 180 307Z',
  star:'M180 44L218 121L305 132L242 193L257 288L180 245L100 288L117 193L55 131L141 119Z',
  cat:'M76 140L62 53L132 87Q178 71 225 87L299 53L282 143C320 191 293 275 221 297C173 309 113 294 83 259C49 223 47 179 76 140Z',
  square:'M105 67H257Q300 67 300 112V253Q300 299 256 299H104Q59 299 59 254V110Q59 67 105 67Z',
};
function readSaved(child:ChildId):SavedFidget[]{
  try {
    const items:unknown=JSON.parse(localStorage.getItem('christmas-fidgets-v1-'+child)||'[]');
    if(!Array.isArray(items))return [];
    return items.slice(0,10).flatMap((entry):SavedFidget[]=>{
      if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||typeof entry.name!=='string')return [];
      const look=entry.look as Partial<FidgetLook>|undefined;
      if(!look||!SHAPES.some(s=>s.value===look.shape)||!COLORS.some(c=>c.value===look.color)||
        !FILLINGS.some(f=>f.value===look.filling)||typeof look.firmness!=='number'||!Number.isFinite(look.firmness))return [];
      return [{id:entry.id.slice(0,80),name:entry.name.slice(0,24),look:{
        shape:look.shape!,color:look.color!,filling:look.filling!,firmness:Math.max(0,Math.min(100,look.firmness))
      }}];
    });
  }catch{return [];}
}
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

function SquishyArt({look,stretch,shakes,id}:{
  look:FidgetLook;stretch:{x:number;y:number};shakes:number;id:string;
}){
  const path=PATHS[look.shape];
  const fill=look.color;
  const particles=Array.from({length:26},(_,i)=>({
    x:75+(i*61+((shakes%6)*17))%211,
    y:82+(i*43+((shakes%5)*23))%203,
    r:3+i%4*2,
  }));
  return <svg className="fidget-svg" viewBox="0 0 360 360" role="img"
    aria-label={look.color+' '+look.shape+' squishy fidget with '+look.filling+' filling'}>
    <defs>
      <radialGradient id={id+'body'} cx=".3" cy=".17" r=".95">
        <stop offset="0" stopColor="#ffffff" stopOpacity=".87"/>
        <stop offset=".23" stopColor={fill} stopOpacity=".83"/>
        <stop offset=".8" stopColor={fill}/>
        <stop offset="1" stopColor="#715d83" stopOpacity=".68"/>
      </radialGradient>
      <clipPath id={id+'clip'}><path d={path}/></clipPath>
      <linearGradient id={id+'gloss'} x1="0" x2="0" y1="0" y2="1">
        <stop stopColor="#ffffff" stopOpacity=".55"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="180" cy="316" rx="110" ry="18" fill="#355768" opacity=".18"/>
    <g transform={'translate(180 180) scale('+stretch.x+' '+stretch.y+') translate(-180 -180)'}>
      <path d={path} fill={'url(#'+id+'body)'} stroke="#fff9e9" strokeWidth="9" strokeLinejoin="round"/>
      <g clipPath={'url(#'+id+'clip)'}>
        <path d="M35 161Q96 129 162 158T333 137V332H35Z" fill="#fff" opacity=".1"/>
        {look.filling==='jelly' && <g opacity=".45">
          <path d="M45 209Q105 175 183 216T320 203" fill="none" stroke="#fffdf7" strokeWidth="20" strokeLinecap="round"/>
          <path d="M45 251Q119 223 202 253T328 245" fill="none" stroke="#fffdf7" strokeWidth="9"/>
        </g>}
        {look.filling==='foam' && particles.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={p.r*1.9}
          fill="#fffaf2" opacity={.25+i%3*.13} stroke="#fff" strokeWidth="2"/>)}
        {look.filling==='beads' && particles.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={p.r*1.25}
          fill={['#ffeae1','#b4e2e4','#fff1a3','#e9cfed'][i%4]} stroke="#ffffffb3" strokeWidth="2"/>)}
        {look.filling==='glitter' && particles.map((p,i)=><g key={i} transform={'translate('+p.x+' '+p.y+')'}>
          <path d={'M0 -'+(p.r+3)+'L2 -2L'+(p.r+3)+' 0L2 2L0 '+(p.r+3)+'L-2 2L-'+(p.r+3)+' 0L-2 -2Z'}
            fill={i%2?'#fffdeb':'#ffde85'} opacity=".92"/>
        </g>)}
        {look.filling==='snow' && particles.map((p,i)=><g key={i} transform={'translate('+p.x+' '+p.y+')'} opacity=".92">
          <path d={'M0 -'+(p.r+4)+'V'+(p.r+4)+'M-'+(p.r+4)+' 0H'+(p.r+4)+
            'M-'+(p.r+3)+' -'+(p.r+3)+'L'+(p.r+3)+' '+(p.r+3)+
            'M'+(p.r+3)+' -'+(p.r+3)+'L-'+(p.r+3)+' '+(p.r+3)}
            stroke="#fffefa" strokeWidth="1.5" strokeLinecap="round"/>
        </g>)}
        <path d="M69 156Q83 76 176 75Q134 112 108 157Z" fill={'url(#'+id+'gloss)'} opacity=".65"/>
      </g>
      <path d={path} fill="none" stroke="#ffffff" strokeOpacity=".62" strokeWidth="4"/>
      {look.shape==='cat' && <g>
        <circle cx="142" cy="170" r="6" fill="#6b5872"/><circle cx="220" cy="170" r="6" fill="#6b5872"/>
        <path d="M174 192L187 192L180 201Z" fill="#a66d85"/>
        <path d="M161 208Q180 223 199 208" stroke="#99647b" fill="none" strokeWidth="5" strokeLinecap="round"/>
      </g>}
    </g>
  </svg>;
}
export function FidgetMaker({child,active}:{child:ChildId;active:boolean}){
  const [look,setLook]=useState<FidgetLook>(DEFAULT);
  const [name,setName]=useState('My Squishy');
  const [saved,setSaved]=useState<SavedFidget[]>(()=>readSaved(child));
  const [message,setMessage]=useState('Drag to stretch your fidget. Give it a shake!');
  const [stretch,setStretch]=useState({x:1,y:1});
  const [shakes,setShakes]=useState(0);
  const [shaking,setShaking]=useState(false);
  const [motion,setMotion]=useState<MotionMode>('off');
  const id=useId().replace(/:/g,'');
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const start=useRef<{x:number;y:number;at:number}|null>(null);
  const pinch=useRef<number|null>(null);
  const wiggleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const motionTrigger=useRef<()=>void>(()=>{});
  function shake(){
    setShakes(count=>count+1);
    setShaking(false);
    if(wiggleTimer.current!==null) clearTimeout(wiggleTimer.current);
    requestAnimationFrame(()=>{
      setShaking(true);
      wiggleTimer.current=setTimeout(()=>setShaking(false),630);
    });
    setMessage('✨ Wiggle wiggle! Your fidget filling is swirling!');
  }
  motionTrigger.current=shake;
  useEffect(()=>()=>{if(wiggleTimer.current!==null)clearTimeout(wiggleTimer.current);},[]);
  useEffect(()=>{
    if(motion!=='native')return;
    const native=nativeChristmas();
    if(active)native?.startFidgetMotion?.();
    else native?.stopFidgetMotion?.();
    const handle=()=>{if(active)motionTrigger.current();};
    window.addEventListener('christmas-native-shake',handle);
    return ()=>{window.removeEventListener('christmas-native-shake',handle);native?.stopFidgetMotion?.();};
  },[active,motion]);
  useEffect(()=>{
    if(motion!=='web'||!active)return;
    let prev:{x:number;y:number;z:number}|null=null;
    let last=0;
    const move=(event:DeviceMotionEvent)=>{
      const a=event.accelerationIncludingGravity||event.acceleration;
      if(!a||a.x==null||a.y==null||a.z==null)return;
      const next={x:a.x,y:a.y,z:a.z};
      if(prev){
        const delta=Math.hypot(next.x-prev.x,next.y-prev.y,next.z-prev.z);
        const now=performance.now();
        if(delta>11.5&&now-last>750){last=now;motionTrigger.current();}
      }
      prev=next;
    };
    window.addEventListener('devicemotion',move);
    return ()=>window.removeEventListener('devicemotion',move);
  },[active,motion]);

  async function enableMotion(){
    const native=nativeChristmas();
    try{
      if(native?.startFidgetMotion&&native?.motionAvailable?.()){
        native.startFidgetMotion();setMotion('native');
        setMessage('📱 Shake your tablet to jiggle the fidget!');
        return;
      }
      if(typeof DeviceMotionEvent==='undefined'){setMotion('unavailable');setMessage('Motion sensors are unavailable here. Touch still works!');return;}
      const motionApi=DeviceMotionEvent as typeof DeviceMotionEvent & {requestPermission?:()=>Promise<'granted'|'denied'>};
      if(motionApi.requestPermission && await motionApi.requestPermission()!=='granted'){
        setMotion('unavailable');setMessage('Motion access was not allowed. Touch still works!');return;
      }
      setMotion('web');
      setMessage('📱 Try gently shaking your device! Touch shake also works.');
    }catch{
      setMotion('unavailable');
      setMessage('Motion sensors are unavailable. Try the touch shake button.');
    }
  }
  const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
  function pointerDown(event:PointerEvent<HTMLDivElement>){
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point={x:event.clientX,y:event.clientY};
    pointers.current.set(event.pointerId,point);
    if(pointers.current.size===1)start.current={...point,at:performance.now()};
    if(pointers.current.size===2){
      const two=[...pointers.current.values()];
      pinch.current=distance(two[0],two[1])||1;
    }
    setMessage('🫧 Stretch it, squeeze it, pull it!');
  }
  function pointerMove(event:PointerEvent<HTMLDivElement>){
    if(!pointers.current.has(event.pointerId))return;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const softness=1.15-look.firmness/250;
    if(pointers.current.size>=2){
      const two=[...pointers.current.values()];
      const ratio=distance(two[0],two[1])/(pinch.current||1);
      setStretch({x:clamp(ratio,0.68,1.65),y:clamp(ratio,0.68,1.65)});
    }else if(start.current){
      const dx=event.clientX-start.current.x,dy=event.clientY-start.current.y;
      setStretch({x:clamp(1+Math.abs(dx)*softness/210,1,1.77),y:clamp(1+Math.abs(dy)*softness/210,1,1.68)});
    }
  }
  function pointerUp(event:PointerEvent<HTMLDivElement>){
    const began=start.current;
    pointers.current.delete(event.pointerId);
    if(pointers.current.size===0){
      setStretch({x:1,y:1});pinch.current=null;start.current=null;
      if(began && Math.hypot(event.clientX-began.x,event.clientY-began.y)>90
        && performance.now()-began.at<550)shake();
      else setMessage('✨ Boing! Your fidget bounced back!');
    }else if(pointers.current.size===1){
      const point=[...pointers.current.values()][0];
      start.current={...point,at:performance.now()};
      pinch.current=null;
    }
  }
  function persist(items:SavedFidget[]){
    try{localStorage.setItem('christmas-fidgets-v1-'+child,JSON.stringify(items));setSaved(items);return true;}
    catch{setMessage('Saving is not available on this tablet. You can still play!');return false;}
  }
  function save(){
    const title=name.trim().slice(0,24)||'My Squishy';
    const entry={id:Date.now()+'-'+Math.random().toString(36).slice(2),name:title,look:{...look}};
    if(persist([entry,...saved].slice(0,10)))setMessage('💖 '+title+' is saved on this tablet!');
  }
  return <section className="fidget-maker" aria-label="Design and play with a squishy fidget">
    <div className="creator-heading">
      <span className="eyebrow">🫧 ELF DESIGN SCHOOL · FIDGET LAB</span>
      <h2>Make a Magical Fidget!</h2>
      <p>Pick your squishy shape, color and filling. Stretch it with your fingers and shake it to watch the filling move.</p>
    </div>
    <div className="fidget-layout">
      <div className="creator-preview-card fidget-preview-card">
        <div className="creator-preview-header"><span>✨ Your squishy creation</span><span>🫧</span></div>
        <div className={'fidget-play-area'+(shaking?' is-shaking':'')}
          onPointerDown={pointerDown} onPointerMove={pointerMove}
          onPointerUp={pointerUp} onPointerCancel={pointerUp}
          role="button" tabIndex={0}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();shake();}}}
          aria-label="Squishy fidget. Drag to stretch. Press Enter or Space to shake.">
          <div className="fidget-play-shape">
            <SquishyArt look={look} stretch={stretch} shakes={shakes} id={id}/>
          </div>
          <span className="fidget-touch-hint" aria-hidden="true">👆 Stretch • ✌️ Pinch • 📱 Shake</span>
        </div>
        <p className="fidget-feedback" role="status">{message}</p>
        <div className="fidget-play-buttons">
          <button className="action" type="button" onClick={shake}>✨ Shake the fidget!</button>
          <button className="pill" type="button" disabled={motion==='native'||motion==='web'}
            onClick={()=>void enableMotion()}>
            {motion==='native'||motion==='web'?'📱 Motion enabled':'📱 Enable device shake'}
          </button>
        </div>
        <label className="creator-name-label" htmlFor="fidget-name">Name your fidget</label>
        <input id="fidget-name" className="creator-name" maxLength={24} value={name}
          onChange={e=>setName(e.target.value)}/>
        <div className="creator-actions">
          <button className="action" type="button" onClick={save}>💖 Save fidget</button>
          <button className="pill" type="button" onClick={()=>{
            setLook(DEFAULT);setStretch({x:1,y:1});setMessage('Fresh fidget, ready to make!');
          }}>↻ Start over</button>
        </div>
      </div>
      <div className="creator-customize fidget-customize">
        <h3>🎨 Make it yours</h3>
        <p>Mix and match until your fidget is just right.</p>
        <div className="fidget-group"><h4>1. Pick a shape</h4>
          <div className="fidget-options">{SHAPES.map(item=><button type="button" key={item.value}
            className={look.shape===item.value?'selected':''} aria-pressed={look.shape===item.value}
            onClick={()=>setLook(v=>({...v,shape:item.value}))}>
            <span>{item.icon}</span><strong>{item.label}</strong></button>)}</div></div>
        <div className="fidget-group"><h4>2. Pick a color</h4>
          <div className="fidget-options">{COLORS.map(item=><button type="button" key={item.value}
            className={look.color===item.value?'selected':''} aria-pressed={look.color===item.value}
            onClick={()=>setLook(v=>({...v,color:item.value}))}>
            <span className="fidget-swatch" style={{background:item.value} as CSSProperties}/><strong>{item.name}</strong></button>)}</div></div>
        <div className="fidget-group"><h4>3. Pick a filling</h4>
          <div className="fidget-options">{FILLINGS.map(item=><button type="button" key={item.value}
            className={look.filling===item.value?'selected':''} aria-pressed={look.filling===item.value}
            onClick={()=>setLook(v=>({...v,filling:item.value}))}>
            <span>{item.icon}</span><strong>{item.label}</strong><small>{item.hint}</small></button>)}</div></div>
        <div className="fidget-group fidget-softness"><h4>4. How squishy?</h4>
          <label htmlFor="fidget-firmness">🤲 Squishy level: {look.firmness<34?'Super soft':look.firmness<67?'Stretchy':'Bouncy'}</label>
          <input type="range" id="fidget-firmness" min="0" max="100" step="1" value={look.firmness}
            onChange={e=>setLook(v=>({...v,firmness:Number(e.target.value)}))}/>
        </div>
      </div>
    </div>
    <section className="creator-collection fidget-collection" aria-label="Saved fidgets">
      <div className="creator-collection-heading"><div><span className="eyebrow">💗 MY FIDGET COLLECTION</span>
        <h3>Saved fidgets <span>({saved.length}/10)</span></h3></div>
        <p>Stored for this child on this tablet.</p></div>
      {saved.length===0?<div className="creator-empty">Save your first fidget to start a collection!</div>:
        <div className="fidget-saved-grid">{saved.map(item=><article className="fidget-saved-item" key={item.id}>
          <button type="button" onClick={()=>{setLook({...item.look});setName(item.name);setStretch({x:1,y:1});setMessage('✨ '+item.name+' is back!');}}>
            <span className="fidget-saved-icon">{SHAPES.find(s=>s.value===item.look.shape)?.icon||'🫧'}</span>
            <strong>{item.name}</strong><small>{FILLINGS.find(f=>f.value===item.look.filling)?.label}</small>
          </button>
          <button className="fidget-remove" type="button" aria-label={'Remove '+item.name} onClick={()=>{
            if(persist(saved.filter(v=>v.id!==item.id)))setMessage('Fidget removed.');
          }}>✕</button>
        </article>)}</div>}
    </section>
    <p className="fidget-safety">This is a pretend digital fidget. Motion access is optional and no motion readings are stored.</p>
  </section>;
}
