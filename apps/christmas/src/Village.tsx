import { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { Tab } from './data';

export type VillageDestination = { tab: Tab; category?: 'All' | 'Create' | 'Play' | 'Kindness' | 'Family' };

type VillageStop = {
  id: string;
  label: string;
  icon: string;
  description: string;
  x: number;
  y: number;
  mobileX: number;
  mobileY: number;
  destination?: VillageDestination;
  advent?: boolean;
};

export const VILLAGE_STOPS: VillageStop[] = [
  { id: 'santa', label: "Santa's Workshop", icon: '🎅', description: 'Watch the North Pole livestream', x: 16, y: 57, mobileX: 25, mobileY: 39, destination: { tab: 'workshop' } },
  { id: 'games', label: 'Reindeer Games', icon: '🎮', description: 'Play Christmas games', x: 38, y: 51, mobileX: 75, mobileY: 39, destination: { tab: 'games' } },
  { id: 'studio', label: 'Elf Design School', icon: '🎨', description: 'Create cookies, elves, snowmen and gingerbread', x: 36, y: 32, mobileX: 25, mobileY: 23, destination: { tab: 'studio' } },
  { id: 'mailbox', label: "Santa's Mailbox", icon: '💌', description: 'Make your wish list for Santa', x: 82, y: 31, mobileX: 75, mobileY: 23, destination: { tab: 'wishlist' } },
  { id: 'advent', label: 'Advent Tree', icon: '🎄', description: 'Open a daily surprise', x: 58, y: 61, mobileX: 25, mobileY: 55, advent: true },
  { id: 'glitter', label: "Glitter's Cottage", icon: '📸', description: "Discover Glitter's diary", x: 78, y: 56, mobileX: 75, mobileY: 55, destination: { tab: 'diary' } },
  { id: 'cabin', label: "Mrs. Claus's Cabin", icon: '🏠', description: 'Activities and kindness with Mrs. Claus', x: 27, y: 87, mobileX: 25, mobileY: 71, destination: { tab: 'activities', category: 'All' } },
  { id: 'nice-meter', label: 'Naughty or Nice?', icon: '⭐', description: 'Choose where you think you are on the list this year', x: 65, y: 87, mobileX: 75, mobileY: 71, destination: { tab: 'nice-meter' } },
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

function VillageIllustration() {
  return <svg className="village-scene village-scene-landscape" viewBox="0 0 1200 690" role="img" aria-label="A colorful snowy Christmas village with Santa's Workshop, Reindeer Games, Elf Design School, Mrs. Claus's Cabin, Santa's Mailbox, Glitter's Cottage, an Advent Tree and a Naughty or Nice check-in." preserveAspectRatio="none">
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


function VillagePortraitIllustration() {
  const lights = ['#ffe39e','#ed8a9a','#9fe6b6','#b5e8f5'];
  return <svg className="village-scene village-scene-portrait" viewBox="0 0 440 1400"
    role="img" aria-label="An illustrated snowy village to explore by scrolling down, with eight Christmas destinations.">
    <defs>
      <linearGradient id="portrait-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#194e72"/><stop offset=".27" stopColor="#5b9bbb"/>
        <stop offset=".65" stopColor="#a8d7d0"/><stop offset="1" stopColor="#d9f2e2"/>
      </linearGradient>
      <radialGradient id="portrait-star"><stop stopColor="#fff8d4" stopOpacity=".97"/><stop offset="1" stopColor="#fff8d4" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="440" height="1400" fill="url(#portrait-sky)" />
    <circle cx="375" cy="108" r="51" fill="#fff4c8"/>
    <circle cx="375" cy="108" r="91" fill="url(#portrait-star)"/>
    <path d="M0 286L78 199L142 257L230 177L342 275L401 202L440 249V1400H0Z" fill="#c2dfdf" opacity=".57"/>
    <path d="M0 364Q125 301 245 345T440 321V1400H0Z" fill="#d9f1e9"/>
    <path d="M0 465Q113 399 222 454T440 425V1400H0Z" fill="#ecf7eb"/>
    <path d="M0 570Q180 527 440 568V1400H0Z" fill="#e0f0e5"/>
    <path d="M0 752Q195 688 440 734V1400H0Z" fill="#e9f5e8"/>
    <path d="M0 991Q196 942 440 979V1400H0Z" fill="#f1f8eb"/>
    <path d="M0 1251Q210 1209 440 1241V1400H0Z" fill="#f7faed"/>
    {/* A winding snow-covered walking path links the village together. */}
    <path d="M215 208Q208 306 218 407T220 609Q185 740 227 862T220 1127Q188 1240 229 1400"
      stroke="#bdded9" strokeWidth="98" strokeLinecap="round" fill="none" opacity=".75"/>
    <path d="M215 208Q208 306 218 407T220 609Q185 740 227 862T220 1127Q188 1240 229 1400"
      stroke="#fffdf7" strokeWidth="79" strokeLinecap="round" fill="none"/>
    <path d="M207 286Q222 395 206 514T219 738Q234 915 207 1064T223 1330"
      stroke="#cfebdf" strokeWidth="3" fill="none" strokeDasharray="12 33" opacity=".8"/>
    {/* Five rows of buildings, at a comfortable distance for little hands to tap. */}
    <House x={11} y={205} wall="#df8db4" roof="#97679b" door="#8d537b" window="#ffefa8"/>
    <House x={231} y={205} wall="#badcf0" roof="#629ec1" door="#709dc1" window="#ffe6ae"/>
    <House x={11} y={425} wall="#e28a71" roof="#9d4355" door="#994355" window="#ffeab1"/>
    <House x={231} y={425} wall="#68b3b6" roof="#417e9c" door="#368c81" window="#ffe5a6"/>
    <Pine x={110} y={803} size={1.05}/>
    <House x={231} y={645} wall="#cf9dc9" roof="#8d68a8" door="#945e87" window="#ffecaf"/>
    <House x={11} y={865} wall="#efbb83" roof="#bd7762" door="#8b5a5f" window="#fff3be"/>
    <House x={231} y={865} wall="#cb9478" roof="#936176" door="#80604f" window="#ffe7a3"/>
    <House x={11} y={1085} wall="#f4d39a" roof="#79a8b8" door="#679c91" window="#fff0bb"/>
    <House x={231} y={1085} wall="#abc8a1" roof="#66876f" door="#6c8b75" window="#ffefaa"/>
    {/* Christmas bunting draped across the village streets. */}
    {[417,637,857,1077].map((y,i)=><g key={'bunting-'+i}>
      <path d={'M0 '+y+' Q220 '+(y+30)+' 440 '+y} fill="none" stroke="#f7f6e3" strokeWidth="3" opacity=".8"/>
      {Array.from({length:9},(_,j)=>{
        const x=20+j*50, yy=y+Math.sin(j/8*Math.PI)*24;
        return <g key={j}><circle cx={x} cy={yy} r="13" fill="#fff1c6" opacity=".17"/>
          <circle className="village-light" cx={x} cy={yy} r="5" fill={lights[(j+i)%lights.length]}/></g>;
      })}
    </g>)}
    {/* Playful snow drifts, tiny lanterns, presents and trees. */}
    {[405,625,845,1065,1280].map((y,i)=><g key={'decor-'+i}>
      <ellipse cx={i%2?30:412} cy={y+14} rx="35" ry="17" fill="#fffdf4"/>
      <path d={'M'+(i%2?22:412)+' '+(y-44)+' l-24 45h48Z'} fill="#2c8774" stroke="#f7fefa" strokeWidth="4"/>
      <circle cx={i%2?22:412} cy={y-47} r="5" fill="#ffdf83"/>
    </g>)}
    <g transform="translate(203 823)">
      <rect x="-12" y="-15" width="30" height="27" rx="4" fill="#e78992"/>
      <path d="M2 -15V12M-12 -2H18" stroke="#fff1b0" strokeWidth="7"/>
    </g>
    <g transform="translate(201 1330)">
      <circle cy="-25" r="20" fill="#fffdf6" stroke="#d0e9e4" strokeWidth="2"/>
      <circle cy="7" r="29" fill="#fffdf6" stroke="#d0e9e4" strokeWidth="2"/>
      <path d="M-5 -31h2M10 -31h2" stroke="#4c5e5a" strokeWidth="5" strokeLinecap="round"/>
      <path d="M-3 -16Q7 -8 16 -18" fill="none" stroke="#ad6f61" strokeWidth="2.5"/>
      <path d="M0 -49H16V-65H0Z" fill="#6f568d"/>
      <path d="M-10 -49H26" stroke="#6f568d" strokeWidth="7"/>
    </g>
    {Array.from({length:84},(_,i)=>{
      const x=(i*109+31)%430, y=(i*173+49)%1380;
      return <circle key={i} className="village-flurry" cx={x} cy={y} r={i%4===0?2.9:1.9}
        fill="#fffcf2" opacity=".7" style={{animationDelay:'-'+(i%19)*.41+'s'}}/>;
    })}
    <path d="M0 1375Q75 1349 154 1374T312 1377T440 1372V1400H0Z" fill="#fffef5"/>
  </svg>;
}

export function VillageHome({ child, days, onSettings, onVisit, onAdvent }: {
  child: string;
  days: number;
  onSettings: () => void;
  onVisit: (destination: VillageDestination) => void;
  onAdvent: () => void;
}) {
  const open = (stop: VillageStop) => {
    if (stop.advent) onAdvent();
    else if (stop.destination) onVisit(stop.destination);
  };
  return <section className="village-home" aria-label="Explore Christmas Village">
    <div className="village-frame">
      <div className="village-viewport">
        <div className="village-canvas">
          <VillageIllustration />
          <VillagePortraitIllustration />
          <div className="village-overlay">
            <div className="village-intro">
              <span className="village-kicker">❄️ NORTH POLE ADVENTURES</span>
              <h1><span>{child}’s</span> Christmas Village</h1>
              <p>Tap a place to explore!</p>
            </div>
            <div className="village-overlay-controls">
              <button type="button" className="village-hud-settings" onClick={onSettings}
                aria-label="Open grown-up settings">⚙️ <span>Settings</span></button>
              <div className="village-countdown" aria-live="polite" aria-label={days === 0 ? 'Merry Christmas' : days + ' days until Christmas'}>
                <strong>{days === 0 ? '🎄' : days}</strong>
                <small>{days === 0 ? 'Merry Christmas!' : 'days to go'}</small>
              </div>
            </div>
          </div>
          {VILLAGE_STOPS.map(stop => <button
            type="button" key={stop.id}
            className={'village-spot village-spot-' + stop.id}
            style={{
              left: stop.x + '%', top: stop.y + '%',
              '--mobile-x': stop.mobileX + '%',
              '--mobile-y': stop.mobileY + '%'
            } as CSSProperties}
            aria-label={stop.label + ': ' + stop.description}
            onClick={() => open(stop)}>
            <span className="village-spot-icon" aria-hidden="true">{stop.icon}</span>
            <span className="village-spot-label">{stop.label}</span>
          </button>)}
          <span className="village-scroll-hint" aria-hidden="true">Explore the village <span>↓</span></span>
        </div>
      </div>
    </div>
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
