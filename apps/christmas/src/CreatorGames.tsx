import { useState } from 'react';
import type { ChildId } from './data';

export type CreatorKind = 'elf' | 'snowman';
type Choice = { label: string; icon: string; color?: string };
type Category = { id: string; label: string; icon: string; options: readonly Choice[] };
type Outfit = Record<string, number>;
type SavedCharacter = { id: string; name: string; outfit: Outfit; created: number };

const C = (label: string, icon: string, color?: string): Choice => ({ label, icon, color });
const ELF_CATEGORIES: readonly Category[] = [
  { id: 'skin', label: 'Skin', icon: '🎨', options: [C('Peach','✨','#f5c8a7'),C('Golden','☀️','#d99a67'),C('Warm brown','🍯','#b97a52'),C('Deep brown','🤎','#84533e'),C('Rose','🌸','#f4b2b7'),C('Mint magic','🍃','#9bd7bd')] },
  { id: 'hair', label: 'Hair color', icon: '💇', options: [C('Chocolate','🍫','#5d3c32'),C('Honey','🍯','#dc9d46'),C('Sunshine','☀️','#ffe38a'),C('Ginger','🍁','#a45335'),C('Midnight','🌙','#26384b'),C('Lavender','💜','#ac8bdd'),C('Snow white','❄️','#f2f4f3')] },
  { id: 'hairdo', label: 'Hairdo', icon: '💈', options: [C('Side swoosh','〰️'),C('Curly','🌀'),C('Pigtails','🎀'),C('Spiky','⭐'),C('Long waves','🌊')] },
  { id: 'eyes', label: 'Eyes', icon: '👀', options: [C('Bright eyes','👀'),C('Sleepy','😌'),C('Sparkly','✨'),C('Winking','😉'),C('Happy','😊')] },
  { id: 'mouth', label: 'Smile', icon: '😄', options: [C('Sweet smile','🙂'),C('Big grin','😁'),C('Surprised','😮'),C('Cheeky','😋')] },
  { id: 'hat', label: 'Headwear', icon: '🎩', options: [C('Pointy hat','🧝'),C('Santa hat','🎅'),C('Beanie','🧶'),C('Antlers','🦌'),C('Bow','🎀'),C('No hat','🙂')] },
  { id: 'outfit', label: 'Outfit', icon: '👕', options: [C('Evergreen','🌲','#239676'),C('Candy red','❤️','#dc5871'),C('Royal purple','💜','#946cbb'),C('Snow blue','🩵','#69acc5'),C('Sunflower','💛','#e8b34f'),C('Candy pink','🩷','#ec99b6')] },
  { id: 'scarf', label: 'Neckwear', icon: '🧣', options: [C('Gold scarf','🌟','#f8d477'),C('Pink scarf','🩷','#e997ad'),C('Blue scarf','🩵','#94d8ed'),C('Green scarf','💚','#59c6a0'),C('Bow tie','🎀','#cf718b'),C('None','➖')] },
  { id: 'boots', label: 'Shoes', icon: '👢', options: [C('Chocolate','🍫','#614e4a'),C('Berry','🍓','#a34f67'),C('Snow','❄️','#f5f1df'),C('Navy','💙','#395778')] },
  { id: 'extra', label: 'Hold', icon: '🎁', options: [C('Candy cane','🍬'),C('Gift','🎁'),C('Star wand','⭐'),C('Snowball','❄️'),C('Teddy','🧸'),C('Nothing','✋')] },
  { id: 'scene', label: 'Place', icon: '🏞️', options: [C('Toy room','🧸'),C('Snowy forest','🌲'),C('Candy land','🍭'),C('Starry night','🌙')] },
];
const SNOW_CATEGORIES: readonly Category[] = [
  { id: 'snow', label: 'Snow', icon: '❄️', options: [C('Classic','🤍','#fbfcff'),C('Icy blue','🩵','#d8effd'),C('Pink snow','🩷','#fce4ee'),C('Mint snow','💚','#def9ef')] },
  { id: 'shape', label: 'Body', icon: '⛄', options: [C('Round','⛄'),C('Tall','🥕'),C('Tiny','🧊'),C('Three snowballs','⚪')] },
  { id: 'eyes', label: 'Eyes', icon: '👀', options: [C('Coal','⚫'),C('Happy','😊'),C('Starry','⭐'),C('Wink','😉'),C('Sleepy','😌')] },
  { id: 'mouth', label: 'Smile', icon: '😁', options: [C('Coal smile','🙂'),C('Big grin','😁'),C('Surprised','😮'),C('Cheeky','😋')] },
  { id: 'nose', label: 'Nose', icon: '🥕', options: [C('Carrot','🥕'),C('Red button','🔴'),C('Golden star','⭐'),C('Pink button','🩷')] },
  { id: 'hat', label: 'Hat', icon: '🎩', options: [C('Top hat','🎩'),C('Beanie','🧶'),C('Santa hat','🎅'),C('Earmuffs','🎧'),C('Crown','👑'),C('No hat','❄️')] },
  { id: 'scarf', label: 'Scarf', icon: '🧣', options: [C('Berry','❤️','#e66b85'),C('Mint','🍃','#66c9b5'),C('Gold','⭐','#ebbb53'),C('Blue','💙','#71b6d9'),C('Purple','💜','#a88ed3'),C('None','➖')] },
  { id: 'buttons', label: 'Buttons', icon: '🔘', options: [C('Coal','⚫','#394650'),C('Rainbow','🌈','#e595ad'),C('Golden','⭐','#ddad57'),C('Hearts','💗','#d46884'),C('None','➖')] },
  { id: 'arms', label: 'Arms', icon: '👐', options: [C('Twig arms','🌿'),C('Mittens','🧤'),C('Waving','👋'),C('No arms','❄️')] },
  { id: 'extra', label: 'Hold', icon: '🎁', options: [C('Broom','🧹'),C('Candy cane','🍬'),C('Gift','🎁'),C('Penguin pal','🐧'),C('Magic star','✨'),C('Nothing','➖')] },
  { id: 'scene', label: 'Place', icon: '🏞️', options: [C('Snowy village','🏘️'),C('Winter night','🌙'),C('Candy land','🍭'),C('Northern lights','🌌')] },
];
const CONFIG: Record<CreatorKind, readonly Category[]> = { elf: ELF_CATEGORIES, snowman: SNOW_CATEGORIES };

function selected(look: Outfit, key: string) { return look[key] ?? 0; }
function option(kind: CreatorKind, key: string, look: Outfit) {
  const group = CONFIG[kind].find(item => item.id === key);
  return group?.options[selected(look, key)] ?? group?.options[0] ?? C('','');
}
function fresh(kind: CreatorKind): Outfit {
  return Object.fromEntries(CONFIG[kind].map(group => [group.id, 0]));
}
function validate(kind: CreatorKind, candidate: unknown): Outfit {
  const raw = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {};
  return Object.fromEntries(CONFIG[kind].map(group => {
    const n = raw[group.id];
    return [group.id, Number.isInteger(n) && typeof n === 'number' && n >= 0 && n < group.options.length ? n : 0];
  }));
}
const keyFor = (kind: CreatorKind, child: ChildId) => 'christmas-character-creator-v1-' + kind + '-' + child;
function loadSaved(kind: CreatorKind, child: ChildId): SavedCharacter[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(keyFor(kind, child)) || '[]');
    if (!Array.isArray(data)) return [];
    return data.slice(0, 10).filter(item => item && typeof item === 'object' &&
      typeof item.name === 'string' && typeof item.id === 'string' && item.name.length <= 40 && item.id.length < 120)
      .map(item => ({ id: item.id as string, name: item.name.slice(0, 28), outfit: validate(kind, item.outfit), created: typeof item.created === 'number' ? item.created : 0 }));
  } catch { return []; }
}
function Scene({ scene = 0, kind }: { scene?: number; kind: CreatorKind }) {
  const palette = kind === 'elf'
    ? [['#d5f3e9','#eff9e8'],['#80bbd2','#e3f7f2'],['#ffd6df','#fff3d4'],['#183a69','#536baa']][scene]
    : [['#b0ddec','#ebf8f2'],['#233b74','#7b97cf'],['#f7b3c0','#ffe3ab'],['#2b6099','#61c4ad']][scene];
  return <g>
    <defs>
      <linearGradient id="creator-sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor={palette[0]}/><stop offset="1" stopColor={palette[1]}/></linearGradient>
      <linearGradient id="creator-floor" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fffdf6"/><stop offset="1" stopColor="#dcebe3"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="360" height="420" rx="26" fill="url(#creator-sky)"/>
    {scene === 1 && <><circle cx="289" cy="71" r="27" fill="#fff8d4"/><circle cx="302" cy="63" r="27" fill={palette[0]}/></>}
    {scene === 2 && <><path d="M0 127 L50 92 L99 127 L140 92 L184 127 L224 92 L266 127 L311 92 L360 122" stroke="#fff4dd" strokeWidth="8" fill="none"/>
      {Array.from({length: 8},(_,i)=><circle key={i} cx={i*48+12} cy={116+i%2*8} r="8" fill={['#ffdf77','#f28ab1','#8bcbab'][i%3]}/>)}</>}
    {scene === 3 && <><path d="M0 75Q80 30 142 79T360 71" fill="none" stroke="#d5ffda" strokeWidth="20" opacity=".3"/><path d="M0 115Q80 71 150 116T360 107" fill="none" stroke="#f3afff" strokeWidth="11" opacity=".25"/></>}
    {Array.from({length:14},(_,i)=><g key={i}><circle cx={(i*83+35)%352} cy={(i*57+18)%280} r={i%3+2} fill="#fffefa" opacity=".8"/></g>)}
    <path d="M0 334Q85 305 176 330T360 333V420H0Z" fill="url(#creator-floor)"/>
    <path d="M0 363Q110 348 176 363T360 363" fill="none" stroke="#fffef4" strokeWidth="9" opacity=".9"/>
    {Array.from({length:4},(_,i)=><g key={i} transform={'translate('+(i*108+8)+' '+(326+i%2*22)+')'} opacity=".7">
      <path d="M0 -46L-25 -5H25Z" fill="#39816e" stroke="#dcf8ea" strokeWidth="4"/>
      <path d="M0 -59L-20 -21H20Z" fill="#4f9d83"/><rect x="-4" y="-6" width="8" height="14" fill="#896858"/>
    </g>)}
  </g>;
}
function Eyes({ variant, y = 174 }: { variant: number; y?: number }) {
  if (variant === 1 || variant === 4)
    return <g stroke="#3c3543" strokeWidth="4.5" strokeLinecap="round" fill="none">
      <path d={'M143 '+y+'q12 '+(variant===1?'-12':'13')+' 24 0M193 '+y+'q12 '+(variant===1?'-12':'13')+' 24 0'}/>
    </g>;
  if (variant === 2) return <g fill="#33374d"><path d={'M154 '+(y-13)+'l5 9 10 2 -8 7 2 10 -9 -5 -9 5 2 -10 -8 -7 10 -2ZM204 '+(y-13)+'l5 9 10 2 -8 7 2 10 -9 -5 -9 5 2 -10 -8 -7 10 -2Z'}/></g>;
  return <g><ellipse cx="158" cy={y} rx="6" ry="8" fill="#32394b"/>
    {variant === 3 ? <path d={'M194 '+y+'q11 11 22 0'} stroke="#343847" strokeWidth="4" strokeLinecap="round" fill="none"/> : <ellipse cx="206" cy={y} rx="6" ry="8" fill="#32394b"/>}
    <circle cx="156" cy={y-3} r="2.3" fill="#fff"/>{variant===0 && <circle cx="204" cy={y-3} r="2.3" fill="#fff"/>}</g>;
}
function Mouth({ variant, y = 201 }: { variant: number; y?: number }) {
  if (variant === 2) return <ellipse cx="182" cy={y+5} rx="9" ry="12" fill="#a65e62" stroke="#7a4954" strokeWidth="2"/>;
  if (variant === 1) return <g><path d={'M163 '+y+'Q182 '+(y+29)+' 202 '+y+'Z'} fill="#a8535d" stroke="#784753" strokeWidth="2"/><path d={'M167 '+(y+2)+'H198Q182 '+(y+14)+' 167 '+(y+2)+'Z'} fill="#fff6f3"/></g>;
  return <path d={variant===3?'M166 '+y+'q14 15 31 0M197 '+y+'l9 -4':'M166 '+y+'q16 19 33 0'} stroke="#8e575d" strokeWidth="4" strokeLinecap="round" fill="none"/>;
}
function ElfPortrait({ look }: { look: Outfit }) {
  const skin = option('elf','skin',look).color || '#f5c8a7';
  const hair = option('elf','hair',look).color || '#5d3c32';
  const outfit = option('elf','outfit',look).color || '#239676';
  const boots = option('elf','boots',look).color || '#614e4a';
  const scarf = option('elf','scarf',look).color || '#f8d477';
  const hairdo = selected(look,'hairdo'), hat = selected(look,'hat');
  return <svg className="creator-svg" viewBox="0 0 360 420" role="img" aria-label="Your customized Christmas elf">
    <Scene scene={selected(look,'scene')} kind="elf"/>
    <ellipse cx="183" cy="359" rx="100" ry="21" fill="#537477" opacity=".2"/>
    {/* Hair, ears and arms are behind the head and clothes */}
    {hairdo===2 && <><ellipse cx="103" cy="151" rx="26" ry="43" fill={hair}/><ellipse cx="261" cy="151" rx="26" ry="43" fill={hair}/><path d="M106 119l-13 -10M260 119l13 -10" stroke="#ef9caa" strokeWidth="9"/></>}
    {hairdo===4 && <><path d="M110 145Q96 221 114 263L146 237Q154 205 150 164Z" fill={hair}/><path d="M247 145Q272 220 253 263L223 242Q211 205 215 164Z" fill={hair}/></>}
    <g stroke="#865d63" strokeWidth="3"><path d="M129 151Q98 123 103 163Q109 181 131 177Z" fill={skin}/><path d="M232 151Q261 122 261 163Q252 181 230 177Z" fill={skin}/></g>
    <rect x="163" y="219" width="34" height="39" rx="12" fill={skin}/>
    <g>
      <rect x="143" y="305" width="31" height="47" rx="10" fill="#f5f0e6" stroke="#93a4a0" strokeWidth="2"/>
      <rect x="194" y="305" width="31" height="47" rx="10" fill="#f5f0e6" stroke="#93a4a0" strokeWidth="2"/>
      <path d="M141 341Q144 327 173 330L185 355Q178 363 137 359Q129 353 141 341Z" fill={boots} stroke="#fff5e6" strokeWidth="4"/>
      <path d="M196 336Q220 327 229 342L240 355Q223 367 186 359Q180 353 196 336Z" fill={boots} stroke="#fff5e6" strokeWidth="4"/>
      <path d="M143 344q15 -9 32 -5M196 340q14 -7 29 2" fill="none" stroke="#ffffff8c" strokeWidth="4"/>
    </g>
    <path d="M130 248Q95 242 75 272L99 302L131 278Z" fill={outfit} stroke="#fff3dc" strokeWidth="5"/>
    <path d="M231 245Q268 244 284 276L261 304L230 273Z" fill={outfit} stroke="#fff3dc" strokeWidth="5"/>
    <circle cx="87" cy="297" r="16" fill={skin} stroke="#fff5dc" strokeWidth="4"/>
    <circle cx="274" cy="302" r="16" fill={skin} stroke="#fff5dc" strokeWidth="4"/>
    <path d="M127 253Q157 230 182 238Q223 230 239 253L247 320Q182 338 118 320Z" fill={outfit} stroke="#fff4d6" strokeWidth="6"/>
    <path d="M181 247v78" stroke="#fff5d8" strokeWidth="5"/>
    <circle cx="185" cy="272" r="5" fill="#ffdd9d"/><circle cx="185" cy="298" r="5" fill="#ffdd9d"/>
    <path d="M124 315Q179 328 242 315" fill="none" stroke="#f5cf73" strokeWidth="11"/>
    <path d="M137 244Q149 235 157 234M223 234Q233 236 240 246" fill="none" stroke="#fff5e6" strokeWidth="5"/>
    {/* Big expressive face */}
    <ellipse cx="182" cy="161" rx="68" ry="75" fill={skin} stroke="#fae7d4" strokeWidth="4"/>
    {hairdo===0 && <path d="M117 139Q110 90 152 88Q217 76 251 136Q223 113 203 118Q155 145 117 139Z" fill={hair}/>}
    {hairdo===1 && <g fill={hair}>{[118,141,165,189,214,236].map((x,i)=><circle key={x} cx={x} cy={110+(i%2)*6} r="24"/>)}</g>}
    {hairdo===2 && <path d="M116 134Q130 89 183 89Q231 86 249 136Q205 121 182 127Q147 112 116 134Z" fill={hair}/>}
    {hairdo===3 && <path d="M118 139L122 86L147 108L166 79L179 111L201 76L217 106L244 84L248 144Q183 126 118 139Z" fill={hair}/>}
    {hairdo===4 && <path d="M113 148Q104 92 152 82Q227 70 247 137Q237 98 222 103Q178 149 113 148Z" fill={hair}/>}
    <ellipse cx="143" cy="194" rx="13" ry="8" fill="#f59da3" opacity=".44"/><ellipse cx="223" cy="194" rx="13" ry="8" fill="#f59da3" opacity=".44"/>
    <Eyes variant={selected(look,'eyes')}/>
    <ellipse cx="183" cy="188" rx="6" ry="4" fill="#d48f7f"/>
    <Mouth variant={selected(look,'mouth')}/>
    {/* Hats sit on top of the hair */}
    {hat===0 && <g><path d="M120 117L197 16Q235 21 242 122Z" fill={outfit} stroke="#fff4db" strokeWidth="5"/><path d="M111 116Q182 102 249 116" fill="none" stroke="#f7df98" strokeWidth="15" strokeLinecap="round"/><circle cx="195" cy="16" r="13" fill="#ffdc8e"/></g>}
    {hat===1 && <g><path d="M116 119Q109 76 166 64Q210 45 260 89Q268 114 257 127Z" fill="#cd5363" stroke="#fff8e5" strokeWidth="5"/><path d="M112 124Q180 108 251 123" fill="none" stroke="#fffefa" strokeWidth="21" strokeLinecap="round"/><circle cx="263" cy="86" r="16" fill="#fff9ed"/></g>}
    {hat===2 && <g><path d="M113 116Q122 55 183 63Q242 60 251 116Z" fill="#9476bb"/>{[137,161,187,213,235].map(x=><path key={x} d={'M'+x+' 75v27'} stroke="#efe3ff" strokeWidth="5"/>)}<path d="M113 120Q180 114 251 120" fill="none" stroke="#f6d9f7" strokeWidth="15" strokeLinecap="round"/></g>}
    {hat===3 && <g stroke="#835c4a" strokeWidth="7" fill="none" strokeLinecap="round"><path d="M146 107l-19 -45 -12 -21M127 62L100 52M127 62l16 -30M223 110l20 -46 16 -27M243 68l-18 -24M243 68l21 -10"/></g>}
    {hat===4 && <g fill="#ef869c" stroke="#fff0e0" strokeWidth="3"><path d="M181 112Q143 84 143 116Q151 141 181 119Q211 89 220 108Q231 143 181 119Z"/><circle cx="181" cy="117" r="8" fill="#f8d58d"/></g>}
    {selected(look,'scarf')<4 && <g><path d="M132 225Q182 249 231 224L218 247Q181 262 143 249Z" fill={scarf} stroke="#fff0d3" strokeWidth="4"/><path d="M207 244L227 298L239 291L226 241Z" fill={scarf} stroke="#fff0d3" strokeWidth="3"/></g>}
    {selected(look,'scarf')===4 && <g><path d="M182 240Q145 216 147 245Q163 261 183 249Q207 219 219 241Q219 260 182 249Z" fill={scarf} stroke="#fff0d3" strokeWidth="3"/><circle cx="183" cy="246" r="8" fill="#fff0dc"/></g>}
    {selected(look,'extra')===0 && <g transform="translate(281 270) rotate(14)"><path d="M0 70V-42Q0 -76 27 -69Q47 -63 39 -39" fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round"/><path d="M0 62v-14M0 28V14M0 -7v-15M3 -50Q12 -64 22 -62M35 -58Q40 -53 40 -42" stroke="#db6475" strokeWidth="8" strokeLinecap="round"/></g>}
    {selected(look,'extra')===1 && <g transform="translate(277 276)"><rect x="-27" y="-5" width="61" height="56" rx="5" fill="#e9b15c" stroke="#fff5e8" strokeWidth="4"/><path d="M0 -5v56M-27 24h61" stroke="#d85d77" strokeWidth="10"/><path d="M0 -6Q-37 -32 -23 -11Q-13 1 0 -6Q25 -33 25 -17Q21 -4 0 -6Z" fill="#da7187"/></g>}
    {selected(look,'extra')===2 && <g transform="translate(285 278)"><path d="M0 70V-35" stroke="#a17859" strokeWidth="8"/><path d="M0 -62l9 20 22 3 -16 14 5 23 -20 -11 -20 11 5 -23 -16 -14 22 -3Z" fill="#ffdc82" stroke="#fff7d4" strokeWidth="4"/></g>}
    {selected(look,'extra')===3 && <g><circle cx="282" cy="293" r="28" fill="#f8ffff" stroke="#d9e9eb" strokeWidth="3"/><circle cx="274" cy="287" r="4" fill="#cdeff0"/></g>}
    {selected(look,'extra')===4 && <text x="255" y="317" fontSize="51">🧸</text>}
    <path d="M75 336Q180 346 282 335" fill="none" stroke="#fffefd" strokeWidth="6" opacity=".7"/>
  </svg>;
}
function SnowPortrait({ look }: { look: Outfit }) {
  const snow = option('snowman','snow',look).color || '#fbfcff';
  const scarf = option('snowman','scarf',look).color || '#e66b85';
  const shape = selected(look,'shape');
  const scaleX = [1, .83, .85, 1][shape];
  const scaleY = [1, 1.08, .82, 1][shape];
  const hat = selected(look,'hat');
  const buttons = selected(look,'buttons');
  return <svg className="creator-svg" viewBox="0 0 360 420" role="img" aria-label="Your customized snowman">
    <Scene scene={selected(look,'scene')} kind="snowman"/>
    <ellipse cx="182" cy="364" rx="105" ry="18" fill="#658d91" opacity=".22"/>
    <g transform={'translate(180 344) scale('+scaleX+' '+scaleY+') translate(-180 -344)'}>
      {/* Arms behind the snowy body */}
      {selected(look,'arms')!==3 && <g fill="none" stroke="#946a51" strokeWidth="9" strokeLinecap="round">
        <path d="M124 237Q82 222 52 182M238 237Q278 222 308 187"/>
        {selected(look,'arms')!==1 && <><path d="M68 201l-15 -35M68 201l-29 -5M293 201l11 -36M293 201l29 -8"/></>}
        {selected(look,'arms')===2 && <path d="M238 237Q273 196 301 132" strokeWidth="7"/>}
      </g>}
      {selected(look,'arms')===1 && <g fill="#e38c9d" stroke="#fff2e1" strokeWidth="4"><ellipse cx="52" cy="182" rx="21" ry="29" transform="rotate(-36 52 182)"/><ellipse cx="308" cy="187" rx="21" ry="29" transform="rotate(36 308 187)"/></g>}
      <ellipse cx="180" cy="296" rx={shape===3?95:93} ry="72" fill={snow} stroke="#d4e5eb" strokeWidth="5"/>
      {shape===3 && <ellipse cx="180" cy="258" rx="78" ry="60" fill={snow} stroke="#d5e6e9" strokeWidth="5"/>}
      <ellipse cx="180" cy="214" rx="74" ry="62" fill={snow} stroke="#d4e5eb" strokeWidth="5"/>
      <ellipse cx="180" cy="123" rx="64" ry="64" fill={snow} stroke="#d4e5eb" strokeWidth="5"/>
      <path d="M130 109Q145 78 163 77" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".86"/>
      <ellipse cx="145" cy="155" rx="13" ry="9" fill="#f4b7b5" opacity=".36"/><ellipse cx="217" cy="155" rx="13" ry="9" fill="#f4b7b5" opacity=".36"/>
      <Eyes variant={selected(look,'eyes')%4} y={116}/>
      {selected(look,'eyes')===4 && <g stroke="#3c3543" strokeWidth="4" strokeLinecap="round" fill="none"><path d="M143 116q12 11 24 0M193 116q12 11 24 0"/></g>}
      {selected(look,'nose')===0 && <path d="M181 131L246 141L178 145Z" fill="#f39a4c" stroke="#d67738" strokeWidth="3"/>}
      {selected(look,'nose')===1 && <circle cx="183" cy="138" r="10" fill="#d56b72" stroke="#f1afb2" strokeWidth="2"/>}
      {selected(look,'nose')===2 && <path d="M183 124l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2Z" fill="#f0c65b"/>}
      {selected(look,'nose')===3 && <circle cx="183" cy="138" r="10" fill="#f4adc4" stroke="#fff4e6" strokeWidth="2"/>}
      {selected(look,'mouth')===0 && [-31,-19,-7,7,19,31].map((dx,i)=><circle key={i} cx={183+dx} cy={158+Math.abs(dx)*-.13+i%2*2} r="3.5" fill="#424a50"/>)}
      {selected(look,'mouth')!==0 && <Mouth variant={selected(look,'mouth')===1?1:selected(look,'mouth')===2?2:3} y={154}/>}
      {buttons!==4 && [242,279,317].map((y,i)=> buttons===3
        ? <path key={i} d={'M180 '+(y-8)+'q-14 -15 -18 0q-4 12 18 24q22 -12 18 -24q-4 -15 -18 0Z'} fill="#d46884"/>
        : <circle key={i} cx="180" cy={y} r="10" fill={buttons===1?['#ed8d96','#f4c76f','#86b5dd'][i]:buttons===2?'#ddad57':'#394650'} stroke="#fff0da" strokeWidth="2"/>)}
      {selected(look,'scarf')<5 && <g><path d="M116 167Q178 181 245 167L230 186Q180 202 133 185Z" fill={scarf} stroke="#fff3e8" strokeWidth="4"/><path d="M214 181L237 257L258 247L229 173Z" fill={scarf} stroke="#fff3e8" strokeWidth="4"/><path d="M237 257l5 -14M247 254l4 -15" stroke="#fff3e8" strokeWidth="3"/></g>}
      {hat===0 && <g><path d="M140 105V43H223V105Z" fill="#333f57" stroke="#eeeaf0" strokeWidth="4"/><path d="M126 97H238Q249 97 240 110H126Q117 110 126 97Z" fill="#2d364b" stroke="#fff1e5" strokeWidth="3"/><path d="M140 86h83" stroke="#df8191" strokeWidth="10"/></g>}
      {hat===1 && <g><path d="M118 107Q115 47 180 44Q245 46 245 107Z" fill="#a68dcb"/><path d="M114 107Q180 96 250 107" stroke="#eee1ff" strokeWidth="18" strokeLinecap="round"/><circle cx="180" cy="45" r="16" fill="#f3e6ff"/></g>}
      {hat===2 && <g><path d="M117 107Q112 60 165 52Q207 36 250 84Q255 112 247 117Z" fill="#d85e68"/><path d="M117 114Q180 103 250 114" stroke="#fffef7" strokeWidth="18" strokeLinecap="round"/><circle cx="254" cy="79" r="17" fill="#fffef7"/></g>}
      {hat===3 && <g><path d="M116 115Q121 66 182 67Q240 68 244 115" fill="none" stroke="#ba86b5" strokeWidth="14"/><ellipse cx="111" cy="120" rx="17" ry="25" fill="#e9bad6"/><ellipse cx="248" cy="120" rx="17" ry="25" fill="#e9bad6"/></g>}
      {hat===4 && <g><path d="M117 99l22 -42 27 23 16 -42 16 42 26 -23 23 42Z" fill="#f7d477" stroke="#fff4d1" strokeWidth="4"/>{[139,182,225].map((x,i)=><circle key={x} cx={x} cy={i===1?55:80} r="6" fill={['#e786a7','#78bba1','#8ca9da'][i]}/>)}</g>}
    </g>
    {selected(look,'extra')===0 && <g transform="translate(293 282) rotate(17)"><path d="M-20 69l54 -123" stroke="#936b51" strokeWidth="8"/><path d="M-5 9Q28 -10 50 18L10 45Z" fill="#caab76" stroke="#fff6de" strokeWidth="4"/><path d="M6 36l8 17M16 30l8 17M28 26l8 17" stroke="#937448" strokeWidth="3"/></g>}
    {selected(look,'extra')===1 && <g transform="translate(285 270) rotate(12)"><path d="M0 78V-41Q1 -73 28 -65Q43 -60 38 -40" stroke="#fff" strokeWidth="16" fill="none" strokeLinecap="round"/><path d="M0 76v-22M0 35V13M0 -4v-23M4 -46l13 -15" stroke="#d45e68" strokeWidth="8"/></g>}
    {selected(look,'extra')===2 && <g><rect x="258" y="304" width="66" height="54" rx="5" fill="#cd6178" stroke="#fff" strokeWidth="3"/><path d="M289 304v54M258 330h66" stroke="#ffdc85" strokeWidth="9"/></g>}
    {selected(look,'extra')===3 && <text x="254" y="352" fontSize="73">🐧</text>}
    {selected(look,'extra')===4 && <g><path d="M291 276l10 22 22 4-17 13 6 22-21-13-22 13 6-22-17-13 23-4Z" fill="#ffde7f" stroke="#fff2cd" strokeWidth="5"/></g>}
  </svg>;
}

function Preview({ kind, look }: { kind: CreatorKind; look: Outfit }) {
  return kind === 'elf' ? <ElfPortrait look={look}/> : <SnowPortrait look={look}/>;
}

export function CharacterCreator({ kind, child }: { kind: CreatorKind; child: ChildId }) {
  const categories = CONFIG[kind];
  const [outfit, setOutfit] = useState<Outfit>(() => fresh(kind));
  const [category, setCategory] = useState(categories[0].id);
  const [saved, setSaved] = useState<SavedCharacter[]>(() => loadSaved(kind, child));
  const [name, setName] = useState(kind==='elf'?'Jingle':'Flurry');
  const [message, setMessage] = useState('');
  const [party, setParty] = useState(false);
  const group = categories.find(g => g.id === category) || categories[0];
  const names = { elf: 'Elf Creator', snowman: 'Snowman Creator' };
  const icon = kind === 'elf' ? '🧝' : '⛄';
  const title = kind === 'elf' ? 'Make your own magical elf!' : 'Build your own snow friend!';
  const update = (id: string, index: number) => { setOutfit(look => ({ ...look, [id]:index })); setMessage(''); };
  function randomize() {
    setOutfit(Object.fromEntries(categories.map(g => [g.id, Math.floor(Math.random()*g.options.length)])));
    setParty(false); setMessage('✨ Surprise! Your character has a brand-new style!');
  }
  function persist(next: SavedCharacter[]) {
    try { localStorage.setItem(keyFor(kind,child), JSON.stringify(next)); setSaved(next); return true; }
    catch { setMessage('This device cannot save right now. You can still design and play!'); return false; }
  }
  function save() {
    const trimmed = name.trim().slice(0,28) || (kind==='elf'?'My elf':'My snowman');
    const entry = {id: String(Date.now())+'-'+Math.random().toString(36).slice(2,8), name:trimmed, outfit:{...outfit}, created:Date.now()};
    if (persist([entry,...saved].slice(0,10))) setMessage('💖 '+trimmed+' is saved in your collection on this device!');
  }
  function remove(id: string) { if (persist(saved.filter(item=>item.id!==id))) setMessage('Character removed from your collection.'); }
  function load(entry: SavedCharacter) { setOutfit(validate(kind,entry.outfit)); setName(entry.name); setParty(false); setMessage('✨ '+entry.name+' is back in the studio!'); }
  return <section className={'character-creator creator-'+kind}>
    <div className="creator-heading">
      <span className="eyebrow">{icon} NORTH POLE DESIGN STUDIO</span>
      <h2>{title}</h2>
      <p>Mix and match everything until your character is just right. There’s no wrong way to create!</p>
    </div>
    <div className="creator-layout">
      <div className="creator-preview-card">
        <div className="creator-preview-header"><span>{icon} {names[kind]}</span><span className="creator-sparkle" aria-hidden="true">✦ ✧ ✦</span></div>
        <div className={'creator-preview'+(party?' is-dancing':'')}>
          <Preview kind={kind} look={outfit}/>
          {party && <div className="creator-party" aria-hidden="true">🎉 ✨ 🌟 🎊</div>}
        </div>
        <label className="creator-name-label" htmlFor={'creator-name-'+kind}>Give your {kind==='elf'?'elf':'snowman'} a name</label>
        <input id={'creator-name-'+kind} className="creator-name" maxLength={28} value={name} onChange={e=>setName(e.target.value)} placeholder={kind==='elf'?'Jingle':'Flurry'}/>
        <div className="creator-actions">
          <button type="button" className="action" onClick={save}>💖 Save character</button>
          <button type="button" className="pill" onClick={randomize}>🎲 Surprise me!</button>
          <button type="button" className="pill" onClick={()=>setParty(value=>!value)}>{party?'✨ Stop dancing':'🎉 Dance party'}</button>
          <button type="button" className="pill" onClick={()=>{setOutfit(fresh(kind));setParty(false);setMessage('A blank new character is ready!');}}>↻ Start over</button>
        </div>
        {message && <p className="creator-message" role="status">{message}</p>}
      </div>
      <div className="creator-customize">
        <h3>🎨 Make it yours</h3><p>Choose what to change, then pick a style.</p>
        <div className="creator-category-list" role="group" aria-label="Character parts">
          {categories.map(g => <button type="button" key={g.id} onClick={()=>setCategory(g.id)}
            aria-pressed={category===g.id} className={'creator-category'+(category===g.id?' selected':'')}>
            <span>{g.icon}</span><small>{g.label}</small>
          </button>)}
        </div>
        <div className="creator-choices">
          <h4>{group.icon} Choose {group.label.toLowerCase()}</h4>
          <div className="creator-choice-grid">
            {group.options.map((choice,i)=><button key={choice.label} type="button"
              className={'creator-choice'+(selected(outfit,group.id)===i?' chosen':'')}
              aria-pressed={selected(outfit,group.id)===i} onClick={()=>update(group.id,i)}>
              {choice.color ? <span className="creator-swatch" style={{background:choice.color}} aria-hidden="true"/> :
                <span className="creator-choice-icon" aria-hidden="true">{choice.icon}</span>}
              <strong>{choice.label}</strong>
              {selected(outfit,group.id)===i && <span className="creator-check" aria-hidden="true">✓</span>}
            </button>)}
          </div>
        </div>
        <p className="creator-tip">💡 Try changing a new part next — hair, hats, faces and outfits can all be different!</p>
      </div>
    </div>
    <section className="creator-collection" aria-label={'Your saved '+kind+' characters'}>
      <div className="creator-collection-heading"><div><span className="eyebrow">💌 MY NORTH POLE COLLECTION</span><h3>My saved characters <span>({saved.length}/10)</span></h3></div>
        <p>Saved for this child on this device. Tap one to dress them up again.</p></div>
      {saved.length===0?<div className="creator-empty">✨ Your collection is waiting! Make a character and press “Save character.”</div>:
        <div className="creator-saved-grid">{saved.map(item=><article className="creator-saved" key={item.id}>
          <button type="button" className="creator-saved-open" onClick={()=>load(item)} aria-label={'Load '+item.name}>
            <span className="creator-saved-art"><Preview kind={kind} look={item.outfit}/></span>
            <strong>{item.name}</strong><small>Tap to play again</small>
          </button>
          <button type="button" className="creator-delete" onClick={()=>remove(item.id)} aria-label={'Delete '+item.name}>✕ Remove</button>
        </article>)}</div>}
    </section>
  </section>;
}
