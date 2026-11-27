import { useEffect, useState } from 'react';

export type NewGameStamp = 'present-bounce' | 'delivery-run' | 'elf-coding';
type Award = (stamp: NewGameStamp) => void;

type BounceTool = 'up' | 'down' | 'spring' | 'clear';
type Position = { x: number; y: number };
const LEVELS = [
  { goal: 1, blocks: ['3:2'], label: 'The snowy shortcut' },
  { goal: 3, blocks: ['3:2', '5:1'], label: 'Around the snowbanks' },
  { goal: 0, blocks: ['2:2', '4:3', '5:2'], label: 'The rooftop challenge' },
];
const key = (x: number, y: number) => x + ':' + y;

export function PresentBounce({ onComplete }: { onComplete: Award }) {
  const [level, setLevel] = useState(0);
  const [tiles, setTiles] = useState<Record<string, Exclude<BounceTool, 'clear'>>>({});
  const [tool, setTool] = useState<BounceTool>('up');
  const [route, setRoute] = useState<Position[]>([{ x: 0, y: 2 }]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState('');
  const puzzle = LEVELS[level];
  const running = result === 'running';
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setStep(i => Math.min(i + 1, route.length - 1)), 270);
    return () => window.clearInterval(timer);
  }, [running, route]);
  useEffect(() => {
    if (!running || step < route.length - 1) return;
    const last = route[route.length - 1];
    const success = last.x === 7 && last.y === puzzle.goal;
    setResult(success ? 'Delivered! You guided the present to the sack!' : 'Not quite! Try moving the arrows.');
    if (success) onComplete('present-bounce');
  }, [step, running, route, puzzle.goal, onComplete]);
  function edit(x: number, y: number) {
    if (x === 0 || x === 7 || puzzle.blocks.includes(key(x, y))) return;
    setTiles(old => {
      const next = { ...old };
      if (tool === 'clear') delete next[key(x, y)];
      else next[key(x, y)] = tool;
      return next;
    });
    setResult('');
    setRoute([{ x: 0, y: 2 }]);
    setStep(0);
  }
  function launch() {
    const steps: Position[] = [{ x: 0, y: 2 }];
    let y = 2;
    for (let x = 1; x < 8; x++) {
      if (puzzle.blocks.includes(key(x, y))) break;
      steps.push({ x, y });
      const tile = tiles[key(x, y)];
      if (tile === 'up') y = Math.max(0, y - 1);
      if (tile === 'down') y = Math.min(4, y + 1);
      if (tile === 'spring') y = Math.max(0, y - 2);
    }
    // The target is evaluated on arrival, not after the final (unplaceable) tile.
    setRoute(steps);
    setStep(0);
    setResult('running');
  }
  function next() {
    setLevel(i => (i + 1) % LEVELS.length);
    setTiles({});
    setRoute([{ x: 0, y: 2 }]);
    setStep(0);
    setResult('');
  }
  const present = route[Math.min(step, route.length - 1)];
  const win = result.startsWith('Delivered');
  return <section className="game-panel holiday-panel" aria-label="Present Bounce">
    <h3>🎁 Present Bounce</h3>
    <p>Place ramps and springs along the path. Help the present reach Santa’s sack!</p>
    <div className="holiday-stats"><span>Level {level + 1} of {LEVELS.length}: {puzzle.label}</span><span>Start 🎁 → Finish 🎅</span></div>
    <div className="holiday-tools" role="group" aria-label="Choose a ramp">
      {([['up','↗ Up ramp'],['down','↘ Down ramp'],['spring','⬆ Spring'],['clear','✕ Erase']] as const).map(([id,name]) =>
        <button type="button" className={tool === id ? 'selected' : ''} aria-pressed={tool === id} onClick={() => setTool(id)} key={id}>{name}</button>)}
    </div>
    <div className="bounce-board" role="group" aria-label="Present ramp puzzle">
      {Array.from({ length: 5 }, (_, y) => Array.from({ length: 8 }, (_, x) => {
        const blocked = puzzle.blocks.includes(key(x, y));
        const isStart = x === 0 && y === 2;
        const isGoal = x === 7 && y === puzzle.goal;
        const isPresent = present.x === x && present.y === y;
        const tile = tiles[key(x,y)];
        const label = isPresent ? '🎁' : isGoal ? '🎅' : blocked ? '🧊' : tile === 'up' ? '↗' : tile === 'down' ? '↘' : tile === 'spring' ? '⬆' : isStart ? '📦' : '·';
        return <button type="button" key={key(x,y)} disabled={blocked || x === 0 || x === 7 || running}
          aria-label={'Column '+(x+1)+', row '+(y+1)+': '+(blocked?'snowbank':isGoal?'Santa sack':tile || 'empty')}
          className={'bounce-cell'+(blocked?' blocked':'')+(isPresent?' present':'')+(isGoal?' goal':'')}
          onClick={() => edit(x,y)}>{label}</button>;
      }))}
    </div>
    <div className="holiday-actions"><button type="button" className="action" disabled={running} onClick={launch}>▶ Send the present</button>
      <button type="button" className="action secondary" onClick={() => { setTiles({}); setResult(''); setStep(0); setRoute([{x:0,y:2}]); }}>Clear board</button>
      {win && <button type="button" className="action" onClick={next}>Next puzzle →</button>}
    </div>
    <p className="holiday-feedback" role="status">{running ? 'Watch the present travel…' : result || 'Try an upward ramp, then send the present.'}</p>
  </section>;
}

const CHIMNEYS = [12, 29, 46, 63, 80];
export function SantaDeliveryRun({ onComplete }: { onComplete: Award }) {
  const [playing, setPlaying] = useState(false);
  const [x, setX] = useState(0);
  const [delivered, setDelivered] = useState<number[]>([]);
  const [message, setMessage] = useState('Tap Start, then drop a present when Santa is above a chimney.');
  const [drops, setDrops] = useState(0);
  useEffect(() => {
    if (!playing || delivered.length === CHIMNEYS.length) return;
    const timer = window.setInterval(() => setX(value => (value + 0.85) % 100), 42);
    return () => window.clearInterval(timer);
  }, [playing, delivered.length]);
  function drop() {
    if (!playing || delivered.length === CHIMNEYS.length) return;
    setDrops(n => n + 1);
    const hit = CHIMNEYS.findIndex((target, index) => !delivered.includes(index) && Math.abs(target - x) < 6);
    if (hit < 0) { setMessage('So close! Wait until the sleigh is over a chimney.'); return; }
    const next = [...delivered, hit];
    setDelivered(next);
    setMessage('Perfect delivery! ' + next.length + ' of 5 houses!');
    if (next.length === CHIMNEYS.length) { setPlaying(false); setMessage('Every chimney has a present! Fantastic flying!'); onComplete('delivery-run'); }
  }
  function reset() { setPlaying(true); setX(0); setDelivered([]); setDrops(0); setMessage('Deliver to all five chimneys!'); }
  return <section className="game-panel holiday-panel" aria-label="Santa's Delivery Run">
    <h3>🛷 Santa’s Delivery Run</h3><p>Time your drops as the sleigh passes over each chimney.</p>
    <div className="holiday-stats"><span>🎁 Delivered {delivered.length} / 5</span><span>{drops} drops</span></div>
    <button className="delivery-stage" type="button" onClick={drop} disabled={!playing} aria-label="Drop a present now">
      <span className="delivery-moon">🌕</span><span className="delivery-sleigh" style={{ left: x+'%' }}>🦌 🛷</span>
      {CHIMNEYS.map((position, index) => <span className={'delivery-house'+(delivered.includes(index)?' delivered':'')}
        key={index} style={{ left:position+'%' }}>🏠<span>{delivered.includes(index)?'🎁':'❄️'}</span></span>)}
    </button>
    <div className="holiday-actions">
      <button className="action" type="button" onClick={playing ? drop : reset}>{playing ? '🎁 Drop present!' : delivered.length === 5 ? '↻ Fly again' : '▶ Start flight'}</button>
    </div>
    <p className="holiday-feedback" role="status">{message}</p>
  </section>;
}

type Direction = '↑' | '↓' | '←' | '→';
type Spot = { x:number; y:number };
type CodingLevel = { start: Spot; goal: Spot; blocks: Spot[]; hint:string };
const CODE_LEVELS: CodingLevel[] = [
  { start:{x:0,y:4}, goal:{x:3,y:4}, blocks:[], hint:'Move right three spaces.' },
  { start:{x:0,y:4}, goal:{x:4,y:2}, blocks:[{x:2,y:4}], hint:'Go around the snowbank. Try going up first.' },
  { start:{x:0,y:4}, goal:{x:4,y:0}, blocks:[{x:2,y:4},{x:3,y:2}], hint:'Find your own route through the snow.' },
];
const DIR: Record<Direction, Spot> = { '↑':{x:0,y:-1}, '↓':{x:0,y:1}, '←':{x:-1,y:0}, '→':{x:1,y:0} };
export function ElfCodingAcademy({ onComplete }: { onComplete: Award }) {
  const [level,setLevel] = useState(0);
  const [commands,setCommands] = useState<Direction[]>([]);
  const [trail,setTrail] = useState<Spot[]>([]);
  const [message,setMessage] = useState('Build a sequence using the arrow buttons.');
  const [won,setWon] = useState(false);
  const challenge=CODE_LEVELS[level];
  function add(command:Direction) { if(commands.length>=24)return; setCommands(a=>[...a,command]);setWon(false);setTrail([]); }
  function run() {
    let {x,y}=challenge.start;
    const route:Spot[]=[{x,y}];
    let hit=false;
    for(const command of commands) {
      x+=DIR[command].x;y+=DIR[command].y;
      if(x<0||x>4||y<0||y>4||challenge.blocks.some(p=>p.x===x&&p.y===y)) {hit=true;break;}
      route.push({x,y});
      if(x===challenge.goal.x&&y===challenge.goal.y) break;
    }
    setTrail(route);
    const success=x===challenge.goal.x&&y===challenge.goal.y&&!hit;
    setWon(success);
    setMessage(success?'You cracked the code!':hit?'Oops! Your elf ran into a snowbank or the edge.':'Your elf needs a few more commands.');
    if(success&&level===CODE_LEVELS.length-1) onComplete('elf-coding');
  }
  function next() {setLevel(i=>(i+1)%CODE_LEVELS.length);setCommands([]);setTrail([]);setWon(false);setMessage('New maze! Plan the elf’s route.');}
  const pos=trail[trail.length-1]||challenge.start;
  return <section className="game-panel holiday-panel" aria-label="Elf Coding Academy">
    <h3>🧩 Elf Coding Academy</h3><p>Tell the elf where to walk. Add commands, then press Run!</p>
    <div className="holiday-stats"><span>Maze {level+1} of 3</span><span>💡 {challenge.hint}</span></div>
    <div className="coding-grid">
      {Array.from({length:25},(_,i)=>{const x=i%5,y=Math.floor(i/5),blocked=challenge.blocks.some(p=>p.x===x&&p.y===y);
        return <div key={i} className={'coding-cell'+(blocked?' blocked':'')+(trail.some(p=>p.x===x&&p.y===y)?' visited':'')} aria-label={'Column '+(x+1)+' row '+(y+1)}>
          {blocked?'🧊':pos.x===x&&pos.y===y?'🧝':challenge.goal.x===x&&challenge.goal.y===y?'🎁':''}
        </div>;})}
    </div>
    <div className="coding-program" aria-label="Your commands">{commands.length?commands.join(' '):'Tap arrows to add instructions'}</div>
    <div className="holiday-tools">
      {(['↑','↓','←','→'] as const).map(direction=><button key={direction} type="button" aria-label={'Move '+direction} onClick={()=>add(direction)}>{direction}</button>)}
      <button type="button" onClick={()=>{if(commands.length>0)setCommands(a=>[...a,...a.slice(-2)].slice(0,24));}}>↻ Repeat last 2</button>
      <button type="button" onClick={()=>{setCommands(a=>a.slice(0,-1));setTrail([]);setWon(false);}}>⌫ Undo</button>
    </div>
    <div className="holiday-actions"><button className="action" onClick={run} type="button" disabled={!commands.length}>▶ Run code</button>
      <button className="action secondary" type="button" onClick={()=>{setCommands([]);setTrail([]);setWon(false);setMessage('Start a new sequence.');}}>Clear</button>
      {won&&<button className="action" type="button" onClick={next}>{level===2?'Try again ↻':'Next maze →'}</button>}
    </div>
    <p className="holiday-feedback" role="status">{message}</p>
  </section>;
}
