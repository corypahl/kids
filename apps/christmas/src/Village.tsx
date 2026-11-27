import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { Tab } from './data';

export type VillageDestination = { tab: Tab; category?: 'All' | 'Create' | 'Play' | 'Kindness' | 'Family'; game?: 'elf' | 'snowman' };

type VillageStop = {
  id: string;
  label: string;
  icon: string;
  description: string;
  x: number;
  y: number;
  destination?: VillageDestination;
  advent?: boolean;
};

export const VILLAGE_STOPS: VillageStop[] = [
  { id: 'santa', label: "Santa's Workshop", icon: '🎅', description: 'Tell Santa your wishes', x: 16, y: 57, destination: { tab: 'wishlist' } },
  { id: 'toys', label: 'Toy Factory', icon: '🎮', description: 'Play Christmas games', x: 38, y: 51, destination: { tab: 'games' } },
  { id: 'elf-studio', label: 'Elf Design Studio', icon: '🧝', description: 'Dress up your own elf', x: 36, y: 32, destination: { tab: 'games', game: 'elf' } },
  { id: 'snowman-garden', label: 'Snowman Garden', icon: '⛄', description: 'Build and style a snowman', x: 82, y: 31, destination: { tab: 'games', game: 'snowman' } },
  { id: 'advent', label: 'Advent Tree', icon: '🎄', description: 'Open a daily surprise', x: 58, y: 61, advent: true },
  { id: 'glitter', label: "Glitter's Cottage", icon: '📸', description: 'Discover Glitter’s diary', x: 78, y: 56, destination: { tab: 'diary' } },
  { id: 'bakery', label: 'Cookie Bakery', icon: '🍪', description: 'Decorate a cookie', x: 27, y: 87, destination: { tab: 'bakery' } },
  { id: 'reindeer', label: 'Reindeer Barn', icon: '🦌', description: 'Feed the reindeer', x: 65, y: 87, destination: { tab: 'reindeer' } },
  { id: 'crafts', label: 'Craft Cabin', icon: '🎨', description: 'Try a Christmas craft', x: 87, y: 87, destination: { tab: 'activities', category: 'Create' } },
  { id: 'post', label: 'Elf Post Office', icon: '💌', description: 'Spread some kindness', x: 94, y: 42, destination: { tab: 'activities', category: 'Kindness' } },
];

type HouseProps = { x: number; y: number; wall: string; roof: string; door: string; window: string; large?: boolean };
function House({ x, y, wall, roof, door, window, large = false }: HouseProps) {
  const scale = large ? 1.13 : 1;
  return <g transform={'translate(' + x + ' ' + y + ') scale(' + scale + ')'}>
    <ellipse cx="95" cy="155" rx="119" ry="27" fill="#d8eeed" opacity=".82" />
    <rect x="20" y="54" width="150" height="103" rx="12" fill={wall} stroke="#ffffffbb" strokeWidth="4" />
    <path d="M-1 67 L91 -7 L190 67 Q194 74 186 76 L-1 76 Q-9 75 -1 67Z" fill={roof} stroke="#fff" strokeWidth="5" />
    <path d="M-4 62 Q17 33 44 27 L91 -14 L139 29 Q169 37 195 63 L183 66 Q152 48 130 41 L92 4 L50 43 Q29 48 2 71Z" fill="#fffefd" />
    <rect x="123" y="-24" width="22" height="49" rx="3" fill={roof} />
    <path d="M118 -24 h30 q4 0 4 5 v5 h-37 q-4 0-4-5Z" fill="#ffffff" />
    <path className="village-chimney" d="M134 -39q-14-15 0-28q14-14 0-27" fill="none" stroke="#f7ffff" strokeWidth="10" strokeLinecap="round" opacity=".62" />
    <rect x="73" y="95" width="48" height="62" rx="8" fill={door} stroke="#fff4d9" strokeWidth="5" />
    <circle cx="111" cy="129" r="3" fill="#ffdf8a" />
    <rect x="35" y="98" width="29" height="32" rx="6" fill={window} stroke="#fffbea" strokeWidth="6" />
    <path d="M50 100 v28 M37 113 h25" stroke="#ffffff" strokeWidth="3" />
    <rect x="130" y="98" width="25" height="32" rx="6" fill={window} stroke="#fffbea" strokeWidth="6" />
    <path d="M143 100 v29 M131 113 h24" stroke="#fff" strokeWidth="3" />
    <path d="M20 147 Q95 136 170 147" fill="none" stroke="#f2fffa" strokeWidth="13" strokeLinecap="round" />
    <circle cx="22" cy="80" r="5" fill="#f2d583" /><circle cx="47" cy="75" r="5" fill="#e6f7f9" />
    <circle cx="75" cy="74" r="5" fill="#f6c4d3" /><circle cx="108" cy="74" r="5" fill="#ffdd81" />
    <circle cx="143" cy="75" r="5" fill="#b6ffc4" /><circle cx="169" cy="77" r="5" fill="#f4c3b0" />
  </g>;
}

function Pine({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return <g transform={'translate(' + x + ' ' + y + ') scale(' + size + ')'}>
    <ellipse cx="0" cy="6" rx="37" ry="13" fill="#c0e1db" />
    <rect x="-7" y="-23" width="14" height="32" rx="3" fill="#936044" />
    <path d="M0 -151L-45 -77H-26L-60 -31H60L26 -77H45Z" fill="#22735b" stroke="#e1fff6" strokeWidth="5" strokeLinejoin="round" />
    <path d="M0 -151L-24 -108H24Z" fill="#48a68a" opacity=".8"/>
    <path d="M-40 -62Q0 -48 40 -62M-49 -31Q0 -13 49 -31" stroke="#f8f9e6" strokeWidth="10" strokeLinecap="round" fill="none"/>
    <circle cx="-21" cy="-87" r="6" fill="#ffbd80"/><circle cx="20" cy="-65" r="6" fill="#ec7983"/><circle cx="-15" cy="-35" r="7" fill="#fbda83"/><circle cx="31" cy="-23" r="6" fill="#a1e5ff"/>
  </g>;
}

function VillageElf({ x, y, coat, holding = false }: {
  x: number; y: number; coat: string; holding?: boolean;
}) {
  return <g transform={'translate(' + x + ' ' + y + ')'} aria-hidden="true">
    <ellipse cx="0" cy="0" rx="28" ry="8" fill="#80b9ae" opacity=".4"/>
    <g className="village-elf-bob">
      <path d="M-19 -22L-24 1L-5 1L0 -25Z M3 -25L7 1L26 1L20 -25Z" fill="#76554C"/>
      <path d="M-22 -5Q-16 -12 -2 -6L3 4Q-7 8 -28 2Z M7 -7Q21 -13 27 -4L32 3Q18 8 3 4Z" fill="#574341" stroke="#F4E0AC" strokeWidth="2"/>
      <path d="M-16 -74Q0 -82 16 -74L27 -25Q0 -14 -28 -25Z" fill={coat} stroke="#FCE6B6" strokeWidth="4"/>
      <path d="M-9 -73L0 -53L9 -73M-22 -31Q0 -23 22 -31" fill="none" stroke="#FFE6B5" strokeWidth="5"/>
      <path d="M-21 -67L-35 -46" stroke={coat} strokeWidth="13" strokeLinecap="round"/>
      <circle cx="-35" cy="-46" r="8" fill="#E8A985"/>
      <g className="village-elf-wave">
        <path d="M22 -68L35 -94" stroke={coat} strokeWidth="12" strokeLinecap="round"/>
        <circle cx="35" cy="-94" r="8" fill="#E8A985"/>
      </g>
      <rect x="-8" y="-81" width="16" height="13" rx="5" fill="#E8A985"/>
      <path d="M-29 -132Q-22 -164 0 -170Q28 -166 33 -132L18 -116L-18 -116Z" fill={coat} stroke="#FFE9BD" strokeWidth="3"/>
      <path d="M-28 -130Q0 -139 29 -130" stroke="#FFEBC3" strokeWidth="10" strokeLinecap="round"/>
      <circle cx="4" cy="-169" r="8" fill="#FFE5A0"/>
      <path d="M-17 -99L-31 -102L-23 -84L-14 -87Z M17 -99L31 -102L23 -84L14 -87Z" fill="#E8A985"/>
      <circle cx="0" cy="-103" r="30" fill="#F4C49F" stroke="#B88970" strokeWidth="2"/>
      <path d="M-26 -112Q-20 -145 1 -141Q22 -143 28 -112Q0 -127 -26 -112Z" fill="#704A43"/>
      <circle cx="-10" cy="-105" r="3.7" fill="#3F494F"/><circle cx="10" cy="-105" r="3.7" fill="#3F494F"/>
      <path d="M-10 -90Q0 -79 10 -90" fill="none" stroke="#9F5D54" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="-17" cy="-92" r="5" fill="#ED9C9A" opacity=".58"/><circle cx="17" cy="-92" r="5" fill="#ED9C9A" opacity=".58"/>
      {holding && <g transform="translate(-42 -37)">
        <rect x="-12" y="-16" width="26" height="28" rx="3" fill="#F0A7A7" stroke="#FFF7E1" strokeWidth="3"/>
        <path d="M0 -16V12M-12 -2H14" stroke="#FFE3A0" strokeWidth="5"/>
      </g>}
    </g>
  </g>;
}

function VillageLamp({ x, y }: { x: number; y: number }) {
  return <g transform={'translate(' + x + ' ' + y + ')'} aria-hidden="true">
    <ellipse cx="0" cy="0" rx="25" ry="10" fill="#A1C4B7"/>
    <path d="M0 -12V-104" stroke="#4E8B76" strokeWidth="11" strokeLinecap="round"/>
    <path d="M-23 -114L0 -145L23 -114Z" fill="#AC5B5E" stroke="#FFF2D6" strokeWidth="4"/>
    <path d="M-17 -115H17V-81H-17Z" fill="#FFDB81" stroke="#F9EAC4" strokeWidth="5"/>
    <path d="M-17 -114H17M0 -114V-81" stroke="#D5A86A" strokeWidth="3"/>
    <circle className="village-lamp-glow" cx="0" cy="-98" r="51" fill="url(#lanternGlow)" opacity=".7"/>
    <path d="M-20 -12H20" stroke="#F7FEF7" strokeWidth="9" strokeLinecap="round"/>
  </g>;
}

function VillageIllustration() {
  return <svg className="village-scene" viewBox="0 0 1200 690" role="img" aria-label="A colorful snowy Christmas village with Santa's workshop, a toy factory, Glitter's cottage, bakery, reindeer barn, craft cabin, post office, and an Advent tree, with an Elf Design Studio and Snowman Garden." preserveAspectRatio="none">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#215a87"/><stop offset=".61" stopColor="#65b4c1"/><stop offset="1" stopColor="#d5f2e4"/>
      </linearGradient>
      <linearGradient id="snowland" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#edfffc"/><stop offset="1" stopColor="#c9e5de"/>
      </linearGradient>
      <radialGradient id="lanternGlow"><stop stopColor="#fff8a0" stopOpacity=".85"/><stop offset="1" stopColor="#fff3a1" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="690" fill="url(#sky)"/>
    <circle cx="955" cy="91" r="56" fill="#ffffe9" opacity=".83"/>
    <circle cx="955" cy="91" r="105" fill="url(#lanternGlow)"/>
    <path d="M0 315Q120 190 220 292Q333 148 459 282Q585 158 725 284Q846 182 971 283Q1070 176 1200 294V690H0Z" fill="#b6d8dd" opacity=".57"/>
    <path d="M0 365Q170 275 352 350Q528 268 724 360Q910 276 1200 350V690H0Z" fill="#95c7c7"/>
    <path d="M0 429Q210 379 398 418Q600 350 816 423Q1011 365 1200 415V690H0Z" fill="url(#snowland)"/>
    <path d="M-30 584Q180 518 414 570T855 550T1230 580V690H0Z" fill="#e9f7ee"/>
    <path d="M592 472Q606 522 558 575Q537 630 577 690H750Q668 637 675 593Q693 533 647 485Z" fill="#e2f0e0" stroke="#fff" strokeWidth="16"/>
    <path d="M335 488Q343 543 420 588L485 690" fill="none" stroke="#fffdfa" strokeWidth="34" opacity=".68"/>
    <path d="M960 464Q915 531 872 563Q810 610 822 690" fill="none" stroke="#fffdfa" strokeWidth="32" opacity=".7"/>
    <Pine x={48} y={432} size={.78}/><Pine x={304} y={365} size={.63}/>
    <Pine x={806} y={393} size={.57}/><Pine x={1173} y={481} size={.72}/>
    <Pine x={75} y={629} size={1}/><Pine x={469} y={622} size={.67}/>
    <Pine x={1093} y={650} size={.65}/>
    <House x={65} y={276} large wall="#d95b57" roof="#9c3346" door="#773641" window="#ffe29e"/>
    <House x={341} y={249} wall="#4baab0" roof="#396e97" door="#28727d" window="#ffe8aa"/>
    <House x={847} y={273} wall="#cb96c4" roof="#775c9e" door="#8c507d" window="#fff1be"/>
    <House x={180} y={461} wall="#f2b975" roof="#ca7562" door="#8a5650" window="#fdf3a7"/>
    <House x={650} y={466} large wall="#bf7661" roof="#8e4e5b" door="#5d4b48" window="#ffc879"/>
    <House x={970} y={462} wall="#f3d597" roof="#6095aa" door="#679a8d" window="#fff1a3"/>
    <Pine x={588} y={479} size={1.46}/>
    <g transform="translate(965 235)" aria-hidden="true">
      <ellipse cx="0" cy="62" rx="55" ry="12" fill="#c0d9db"/>
      <circle cx="0" cy="35" r="36" fill="#fffef6" stroke="#d5e9ed" strokeWidth="4"/>
      <circle cx="0" cy="-15" r="27" fill="#fffef6" stroke="#d5e9ed" strokeWidth="4"/>
      <circle cx="-9" cy="-20" r="3" fill="#485967"/><circle cx="9" cy="-20" r="3" fill="#485967"/>
      <path d="M0 -12l29 5-29 5Z" fill="#f2ac55"/>
      <path d="M-18 -43h36v-33h-36Z" fill="#527a91"/>
      <path d="M-33 -44h66" stroke="#527a91" strokeWidth="7" strokeLinecap="round"/>
      <path d="M-19 13Q0 25 19 13" fill="none" stroke="#d87d8b" strokeWidth="9"/>
    </g>
    <path d="M587 230L594 247L612 248L598 260L602 278L587 268L571 277L577 260L562 247L580 247Z" fill="#ffe59b" stroke="#fff2c0" strokeWidth="4"/>
    <circle className="village-glow" cx="587" cy="254" r="48" fill="url(#lanternGlow)"/>
    <g transform="translate(1109 326)">
      <rect x="-4" y="13" width="11" height="85" rx="4" fill="#6e5149"/>
      <path d="M-32 -1H33V45H-32Z" fill="#cf5662" stroke="#fff7e8" strokeWidth="5"/>
      <path d="M-32 -1L0 -28L33 -1" fill="#e8d19a" stroke="#fff7e8" strokeWidth="4"/>
      <rect x="-20" y="12" width="40" height="22" rx="3" fill="#fff9df"/>
      <path d="M-17 13L0 26L17 13" fill="none" stroke="#9f5974" strokeWidth="2"/>
    </g>
    <VillageElf x={315} y={511} coat="#C95368" holding />
    <VillageElf x={538} y={586} coat="#9072B8"/>
    <VillageElf x={845} y={504} coat="#2C9B85" holding />
    <VillageElf x={422} y={655} coat="#D49748"/>
    <VillageElf x={1146} y={658} coat="#6E8FC3"/>
    <VillageLamp x={335} y={588}/>
    <VillageLamp x={935} y={608}/>
    <path d="M0 193Q183 141 365 182T732 163T1200 187" fill="none" stroke="#e9f4fa" strokeWidth="4" opacity=".65"/>
    {Array.from({length: 20}, (_, i) => {
      const x = i * 62 + 15, y = 191 - 24 * Math.cos((x / 1200) * Math.PI * 4);
      const colors = ['#ffdb79','#e9818a','#b1e7ff','#b7f3ca'];
      return <g key={'light-' + i}><circle cx={x} cy={y} r="15" fill="url(#lanternGlow)"/><circle className="village-light" cx={x} cy={y} r="5" fill={colors[i % 4]} /></g>;
    })}
    {Array.from({length: 55}, (_, i) => {
      const x = (i * 173 + 36) % 1190, y = (i * 97 + 13) % 610;
      return <circle key={'flake-' + i} className="village-flurry" cx={x} cy={y} r={i % 5 === 0 ? 3 : 2} fill="#fffefa" opacity=".7" style={{animationDelay: '-' + (i % 13) * .43 + 's'}}/>;
    })}
    <path d="M15 680 Q52 646 91 674M1073 678Q1120 635 1174 670" fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round"/>
  </svg>;
}

export function VillageHome({ child, days, onVisit, onAdvent }: {
  child: string;
  days: number;
  onVisit: (destination: VillageDestination) => void;
  onAdvent: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ available: false, progress: 0 });
  const updateScroll = () => {
    const area = viewport.current;
    if (!area) return;
    const maximum = Math.max(0, area.scrollWidth - area.clientWidth);
    setScroll({ available: maximum > 5,
      progress: maximum ? Math.min(100, Math.max(0, Math.round(area.scrollLeft / maximum * 100))) : 0 });
  };
  useEffect(() => {
    const area = viewport.current;
    if (!area) return;
    const observer = new ResizeObserver(updateScroll);
    observer.observe(area);
    if (area.firstElementChild) observer.observe(area.firstElementChild);
    updateScroll();
    return () => observer.disconnect();
  }, []);
  const pan = (direction: -1 | 1) => {
    const area = viewport.current;
    if (!area) return;
    area.scrollBy({ left: direction * Math.max(260, area.clientWidth * .77), behavior: 'smooth' });
  };
  const open = (stop: VillageStop) => {
    if (stop.advent) onAdvent();
    else if (stop.destination) onVisit(stop.destination);
  };
  return <section className="village-home" aria-label="Explore Christmas Village">
    <h1 className="village-sr-only">Explore Christmas Village</h1>
    <div className="village-frame">
      <div className="village-viewport" ref={viewport} onScroll={updateScroll}
        tabIndex={0} aria-label="Swipe or scroll horizontally to explore the entire Christmas village">
        <div className="village-canvas">
          <VillageIllustration />
          {VILLAGE_STOPS.map(stop => <button
            type="button" key={stop.id}
            className={'village-spot village-spot-' + stop.id}
            style={{ left: stop.x + '%', top: stop.y + '%' }}
            aria-label={stop.label + ': ' + stop.description}
            onClick={() => open(stop)}>
            <span className="village-spot-icon" aria-hidden="true">{stop.icon}</span>
            <span className="village-spot-label">{stop.label}</span>
          </button>)}
        </div>
      </div>
    </div>
    <div className="village-floating-welcome">
      <span>❄️ WELCOME TO THE NORTH POLE</span>
      <strong>Hi, {child}!</strong>
      <small>Tap a building to explore.</small>
    </div>
    <div className="village-countdown" aria-label={days === 0 ? 'Merry Christmas' : days + ' days until Christmas'}>
      <strong>{days === 0 ? '🎄' : days}</strong>
      <span>{days === 0 ? 'MERRY CHRISTMAS' : 'DAYS'}</span>
    </div>
    {scroll.available && <div className="village-explore-controls">
      <div className="village-scroll-track" aria-hidden="true"><span style={{ width: Math.max(8, scroll.progress) + '%' }} /></div>
      <div className="village-pan-buttons">
        <button type="button" onClick={() => pan(-1)} disabled={scroll.progress < 1} aria-label="Explore village to the left">‹</button>
        <button type="button" onClick={() => pan(1)} disabled={scroll.progress > 99} aria-label="Explore village to the right">›</button>
      </div>
    </div>}
    <p className="village-swipe" aria-hidden="true">{scroll.available ? '↔ Swipe to explore the village' : '✨ Tap a building to play!'}</p>
  </section>;
}

type Decoration = { x: number; y: number; color: string; kind: 'icing' | 'sprinkle' | 'star'; rotation: number };
export function CookieBakery() {
  const [tool, setTool] = useState<'icing' | 'sprinkle' | 'star'>('icing');
  const [color, setColor] = useState('#eb6d7d');
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const colors = ['#eb6d7d', '#78bba1', '#ffdd7c', '#ad87df', '#a4ddfa', '#fff6ed'];
  function addAt(x: number, y: number) {
    if (celebrating) setCelebrating(false);
    const dx = x - 180, dy = y - 155;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = distance > 112 ? 112 / distance : 1;
    setDecorations(items => [...items, { x: 180 + dx * scale, y: 155 + dy * scale, color, kind: tool, rotation: items.length * 47 % 180 }].slice(-90));
  }
  function tapCookie(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width * 360;
    const y = (event.clientY - box.top) / box.height * 310;
    addAt(x, y);
  }
  return <section className="mini-adventure" aria-label="Decorate a Christmas cookie">
    <header className="content-heading"><span className="eyebrow">🍪 THE COOKIE BAKERY</span>
      <h2>Decorate a Christmas Cookie!</h2>
      <p>Choose a topping, then tap the cookie to decorate it. Every cookie can be different!</p>
    </header>
    <div className="mini-activity-layout">
      <div className="cookie-board">
        <span className="cookie-board-label">YOUR COOKIE</span>
        <button type="button" className="cookie-canvas" aria-label="Tap to add your selected topping to the cookie" onClick={tapCookie}>
          <svg viewBox="0 0 360 310" aria-hidden="true">
            <ellipse cx="180" cy="177" rx="135" ry="121" fill="#86664c" opacity=".18"/>
            <circle cx="180" cy="155" r="124" fill="#ba7847" stroke="#9f6339" strokeWidth="7"/>
            <circle cx="180" cy="148" r="116" fill="#e9b77a" stroke="#f8dfac" strokeWidth="5"/>
            <path d="M87 109Q112 72 156 66M229 76Q265 102 274 139" fill="none" stroke="#f8db9d" strokeWidth="11" strokeLinecap="round"/>
            {decorations.map((item, i) => <g key={i} transform={'translate(' + item.x + ' ' + item.y + ') rotate(' + item.rotation + ')'}>
              {item.kind === 'icing' ? <circle r="12" fill={item.color} stroke="#fff8e4" strokeWidth="3"/> :
                item.kind === 'sprinkle' ? <><rect x="-4" y="-17" width="8" height="34" rx="4" fill={item.color} stroke="#9b7454" strokeWidth="1"/></> :
                <path d="M0 -16L5 -5L17 -4L8 5L11 17L0 11L-11 17L-8 5L-17 -4L-5 -5Z" fill={item.color} stroke="#fff8dc" strokeWidth="2"/>}
            </g>)}
          </svg>
        </button>
        <span className="cookie-count">{decorations.length} decorations</span>
        {celebrating && <div className="mini-celebration" role="status">🎉 Delicious masterpiece, {decorations.length} toppings!</div>}
      </div>
      <div className="mini-controls">
        <h3>1. Pick a topping</h3>
        <div className="cookie-tools" role="group" aria-label="Choose cookie topping">
          {([{id:'icing', icon:'🍬', name:'Icing dots'}, {id:'sprinkle', icon:'✨', name:'Sprinkles'}, {id:'star', icon:'⭐', name:'Candy stars'}] as const).map(t =>
            <button type="button" key={t.id} className={tool === t.id ? 'selected' : ''} aria-pressed={tool === t.id} onClick={() => setTool(t.id)}><span>{t.icon}</span>{t.name}</button>)}
        </div>
        <h3>2. Choose a color</h3>
        <div className="cookie-colors" role="group" aria-label="Choose decorating color">
          {colors.map(c => <button type="button" key={c} className={color === c ? 'selected' : ''} style={{background:c}} onClick={() => setColor(c)} aria-label={'Choose color ' + c} aria-pressed={color === c} />)}
        </div>
        <h3>3. Decorate!</h3>
        <button className="action" type="button" onClick={() => addAt(180 + (decorations.length * 23 % 140) - 70, 154 + (decorations.length * 17 % 130) - 65)}>+ Add a topping</button>
        <div className="mini-controls-bottom">
          <button className="pill" type="button" disabled={!decorations.length} onClick={() => setDecorations(d => d.slice(0,-1))}>↶ Undo</button>
          <button className="pill" type="button" onClick={() => {setDecorations([]);setCelebrating(false);}}>↻ New cookie</button>
        </div>
        <button className="action secondary" type="button" disabled={!decorations.length} onClick={() => setCelebrating(true)}>🎉 Show my masterpiece!</button>
        <p className="mini-hint">Decorating is just for fun — your artwork resets when you leave the bakery.</p>
      </div>
    </div>
  </section>;
}

const REINDEER_FACTS = [
  'Reindeer have wide hooves that help them walk on snowy ground.',
  'Both male and female reindeer can grow antlers!',
  'Reindeer have very warm coats to stay cozy in the cold.',
  'A baby reindeer is called a calf.',
  'Reindeer can travel a long way together in a herd.',
];
const SNACKS = [{ icon: '🥕', label: 'Carrot' },{ icon: '🍎', label: 'Apple' },{ icon: '🌾', label: 'Hay' }];
export function ReindeerBarn() {
  const [fed, setFed] = useState(0);
  const [lastSnack, setLastSnack] = useState('');
  const [fact, setFact] = useState(0);
  const full = fed >= 5;
  return <section className="mini-adventure" aria-label="Feed the reindeer game">
    <header className="content-heading"><span className="eyebrow">🦌 THE REINDEER BARN</span><h2>Help Feed the Reindeer!</h2>
      <p>Give the reindeer five tasty snacks to get them ready for Christmas.</p></header>
    <div className="mini-activity-layout">
      <div className="reindeer-scene">
        <span className="reindeer-snow">❄️ ✨ ❄️</span>
        <div className={lastSnack ? 'reindeer-friend happy' : 'reindeer-friend'} aria-label="Friendly reindeer">🦌</div>
        <div className="reindeer-feed-status" aria-live="polite">
          <strong>{full ? '🌟 All fed and ready to go!' : fed === 0 ? 'I’m a hungry reindeer!' : 'Yummy ' + lastSnack + '! Thank you!'}</strong>
          <span>{fed} of 5 snacks</span>
        </div>
        <div className="reindeer-progress" role="progressbar" aria-label="Reindeer fed snacks" aria-valuemin={0} aria-valuemax={5} aria-valuenow={fed}>
          <div style={{width:(fed/5*100)+'%'}} />
        </div>
      </div>
      <div className="mini-controls">
        <h3>Choose a snack!</h3>
        <div className="reindeer-snacks">
          {SNACKS.map(item => <button key={item.label} type="button" disabled={full} onClick={() => {setFed(n => Math.min(5,n+1));setLastSnack(item.label.toLowerCase());}}>
            <span aria-hidden="true">{item.icon}</span>{item.label}
          </button>)}
        </div>
        {full ? <div className="mini-celebration" role="status">🎉 Great job! The reindeer are ready for their trip!</div> :
          <p className="mini-hint">Tap the food to give your reindeer a snack.</p>}
        <button className="action secondary" type="button" onClick={() => {setFed(0);setLastSnack('');}}>↻ Feed again</button>
        <div className="reindeer-fact">
          <span className="eyebrow">DID YOU KNOW?</span>
          <p>{REINDEER_FACTS[fact]}</p>
          <button className="pill" type="button" onClick={() => setFact(n => (n + 1) % REINDEER_FACTS.length)}>Another reindeer fact →</button>
        </div>
      </div>
    </div>
  </section>;
}
