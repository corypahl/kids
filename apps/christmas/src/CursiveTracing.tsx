import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { ChildId } from './data';

const GLYPHS: Record<string,string> = {
  a:'M5 60 C7 43 19 36 29 44 C38 53 25 69 14 66 C5 62 12 46 29 44 C30 56 31 66 39 64 C45 63 48 57 52 54',
  b:'M5 64 C9 51 16 11 26 9 C38 7 25 38 13 51 C22 39 32 45 34 54 C35 68 20 73 15 61 C25 69 38 66 52 55',
  c:'M45 44 C29 35 14 44 12 55 C10 69 28 72 51 56',
  d:'M5 59 C7 43 20 36 29 46 C35 56 21 70 13 65 C5 60 16 42 29 46 C32 31 37 10 46 8 C53 11 42 46 35 62 C34 69 45 65 53 55',
  e:'M6 59 C21 59 34 45 30 40 C24 33 10 45 11 59 C11 73 34 71 52 56',
  f:'M5 64 C18 54 17 12 35 8 C46 5 44 23 22 44 M8 38 C20 35 32 35 48 34 M22 44 C17 65 23 74 50 56',
  g:'M5 59 C8 44 21 36 29 46 C35 56 21 69 13 64 C5 58 15 43 29 46 C31 59 30 80 18 90 C7 96 8 80 30 75 C41 72 47 61 52 56',
  h:'M5 63 C14 48 18 14 28 8 C41 4 28 41 15 52 C20 43 31 41 36 49 C41 57 30 71 43 64 L52 56',
  i:'M6 62 C17 58 24 43 28 43 C33 44 21 64 31 65 C39 67 47 59 52 55 M29 26 L30 25',
  j:'M7 61 C18 56 24 44 29 44 C31 46 31 72 21 84 C10 96 8 82 28 76 C40 70 45 60 52 55 M31 27 L32 26',
  l:'M5 64 C17 52 18 14 30 9 C43 4 34 31 15 53 C12 65 22 72 51 55',
  m:'M5 64 C14 57 17 45 24 44 C31 44 19 63 25 63 C33 63 33 44 41 44 C50 44 35 65 42 64 C48 64 49 59 53 55',
  n:'M5 64 C14 57 18 45 25 44 C33 44 19 64 29 64 C36 64 39 43 46 44 C53 45 41 67 54 57',
  o:'M7 56 C12 40 28 36 36 47 C42 57 30 69 18 65 C4 61 12 43 30 44 C37 54 44 62 53 55',
  p:'M5 62 C17 57 20 44 28 44 C34 44 20 77 17 91 M24 49 C37 39 46 48 43 57 C40 67 30 64 27 58 C36 70 46 64 53 56',
  r:'M5 64 C19 58 18 43 27 44 C34 44 25 57 30 60 C34 47 39 44 44 47 C49 51 40 60 53 55',
  s:'M44 44 C34 36 25 41 29 49 C31 55 41 57 35 64 C27 73 11 67 8 59 C7 51 17 52 19 59 C27 66 41 63 53 55',
  t:'M5 61 C16 59 27 26 34 18 M16 39 L49 38 M25 47 C20 63 28 69 40 62 L53 54',
  w:'M5 58 C9 48 15 42 19 44 C23 48 13 64 21 65 C29 66 29 46 36 44 C43 44 28 65 41 65 C46 65 49 59 53 54',
  y:'M5 60 C14 54 15 42 23 43 C31 43 21 66 29 63 C34 61 38 44 44 45 C49 46 37 81 25 89 C13 95 9 82 27 75 C41 68 48 59 53 55',
};
const WORDS = ['joy','snow','santa','merry','star','bell','noel','gift','peace','jolly'];
const STEP=57;

export function CursiveTracing({ child, onComplete }: { child: ChildId; onComplete: (stamp:'cursive')=>void }) {
  const [index,setIndex] = useState(0);
  const [lines,setLines] = useState<{x:number;y:number}[][]>([]);
  const [drawing,setDrawing] = useState(false);
  const [progress,setProgress] = useState(0);
  const [completed,setCompleted] = useState(false);
  const svg=useRef<SVGSVGElement>(null);
  const visited=useRef(new Set<string>());
  const word=WORDS[index];
  const width=word.length*STEP+20;
  function reset(next=index) {
    setIndex(next);setLines([]);setDrawing(false);setProgress(0);setCompleted(false);visited.current.clear();
  }
  function handleMove(event:PointerEvent<SVGSVGElement>, down:boolean) {
    if(!svg.current||(!down&&!drawing)||completed)return;
    const box=svg.current.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width*width;
    const y=(event.clientY-box.top)/box.height*112;
    setLines(previous=> {
      if(!previous.length||(!drawing&&down))return [...previous,[{x,y}]];
      return [...previous.slice(0,-1),[...previous[previous.length-1],{x,y}]];
    });
    const paths=svg.current.querySelectorAll<SVGPathElement>('.trace-letter');
    let count=0, total=0;
    paths.forEach((path,letter)=>{
      const length=path.getTotalLength(), samples=Math.max(10,Math.ceil(length/8));
      for(let i=0;i<samples;i++){
        const p=path.getPointAtLength(i/samples*length), id=letter+':'+i;
        if(Math.hypot(p.x+letter*STEP+10-x,p.y-y)<12)visited.current.add(id);
        total++;
        if(visited.current.has(id))count++;
      }
    });
    setProgress(total?Math.round(100*count/total):0);
  }
  function finish() {
    setDrawing(false);
    // Recognition is encouraging rather than strict handwriting grading.
    if(progress>=62&&!completed){setCompleted(true);onComplete('cursive');}
  }
  return <section className="cursive-workshop" aria-label="Christmas cursive finger tracing">
    <div className="section-row"><div><h3>✍️ Christmas Cursive</h3><p>Follow the curly lines with your finger. Make each letter sparkle!</p></div>
      <span className="stat-chip">{index+1} / {WORDS.length} words</span></div>
    <div className="trace-word-picker" role="group" aria-label="Choose a Christmas word">
      {WORDS.map((w,i)=><button type="button" key={w} className={i===index?'selected':''} aria-pressed={i===index} onClick={()=>reset(i)}>{w}</button>)}
    </div>
    <div className="trace-scroll"><svg ref={svg} viewBox={'0 0 '+width+' 112'} className="trace-board" role="img"
        aria-label={'Trace the cursive word '+word}
        onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDrawing(true);handleMove(e,true);}}
        onPointerMove={e=>handleMove(e,false)} onPointerUp={finish} onPointerCancel={()=>setDrawing(false)}>
      <rect x="0" y="0" width={width} height="112" rx="14" fill="#fffdf4"/>
      <path d={'M0 34 H'+width+' M0 68 H'+width} fill="none" stroke="#d8ddd6" strokeDasharray="6 7" strokeWidth="1"/>
      {word.split('').map((letter,i)=><path key={i} className="trace-letter" d={GLYPHS[letter]}
         transform={'translate('+(i*STEP+10)+' 0)'} fill="none" stroke="#cad6d0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
      {lines.map((line,i)=><polyline key={i} points={line.map(p=>p.x+','+p.y).join(' ')}
        fill="none" stroke="#2aa4a0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" opacity=".85"/>)}
    </svg></div>
    <div className="trace-progress"><div style={{width:progress+'%'}}/><span>{progress}% traced</span></div>
    <p className="holiday-feedback" role="status">{completed?'✨ Beautiful cursive! You earned a passport stamp.':'Trace over most of the pale letters to complete the word.'}</p>
    <div className="holiday-actions">
      <button className="action secondary" type="button" onClick={()=>reset()}>↻ Erase</button>
      <button className="action" type="button" onClick={()=>reset((index+1)%WORDS.length)}>Next word →</button>
    </div>
    <p className="arcade-hint">Finger, stylus, or mouse works. This is creative tracing practice, not a handwriting assessment.</p>
  </section>;
}
