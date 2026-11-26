import { useEffect, useState } from 'react';
import type { ChildId } from './data';
import { requestApi } from './api';

export type CreatorKind = 'elf' | 'snowman';
type Look = Record<string, string>;
type Choice = { value: string; label: string; emoji?: string; swatch?: string };
type Feature = { key: string; title: string; emoji: string; choices: Choice[] };
type Creation = { id: string; child: ChildId; kind: CreatorKind; name: string; look: Look; updatedAt: string };

const palette = (items: [string, string][]): Choice[] => items.map(([value, label]) => ({ value, label, swatch: value }));
const choices = (items: [string, string, string][]): Choice[] => items.map(([value, label, emoji]) => ({ value, label, emoji }));

export const CREATOR_OPTIONS: Record<CreatorKind, Feature[]> = {
  elf: [
    { key: 'skin', title: 'Skin tone', emoji: '🎨', choices: palette([['#F6CEAA','Peach'],['#E8B18B','Warm'],['#C98861','Tan'],['#995C40','Brown'],['#623B32','Deep']]) },
    { key: 'hair', title: 'Hair color', emoji: '💇', choices: palette([['#5A3528','Chestnut'],['#33262C','Black'],['#D6A55E','Gold'],['#E66B45','Copper'],['#EEE7CE','Snow'],['#B185D8','Violet']]) },
    { key: 'hairStyle', title: 'Hairstyle', emoji: '🪮', choices: choices([['fringe','Fringe','💇'],['curls','Curly','🌀'],['pigtails','Pigtails','🎀'],['swoop','Side swoop','✨']]) },
    { key: 'eyes', title: 'Eye color', emoji: '👀', choices: palette([['#513829','Brown'],['#478CB8','Blue'],['#43956A','Green'],['#9C71A8','Purple']]) },
    { key: 'face', title: 'Expression', emoji: '😊', choices: choices([['smile','Smile','😊'],['wink','Wink','😉'],['giggle','Giggle','😄'],['surprised','Surprise','😮']]) },
    { key: 'outfit', title: 'Outfit style', emoji: '👗', choices: choices([['tunic','Elf tunic','🧝'],['dress','Party dress','👗'],['overalls','Overalls','🧸'],['jacket','Cozy coat','🧥']]) },
    { key: 'outfitColor', title: 'Outfit color', emoji: '🌈', choices: palette([['#C54C5C','Berry'],['#277D67','Pine'],['#4F88C8','Blue'],['#9E71C7','Lilac'],['#E8AC50','Honey'],['#E88DA5','Pink']]) },
    { key: 'hat', title: 'Hat', emoji: '🎩', choices: choices([['pointy','Elf hat','🧝'],['pom','Winter hat','❄️'],['hood','Hood','🧥'],['crown','Star crown','👑'],['none','No hat','🚫']]) },
    { key: 'accessory', title: 'Hold something', emoji: '🎁', choices: choices([['wand','Magic wand','🪄'],['gift','Present','🎁'],['candy','Candy cane','🍬'],['teddy','Teddy bear','🧸'],['none','Nothing','🙌']]) },
    { key: 'boots', title: 'Boots', emoji: '👢', choices: palette([['#664B42','Brown'],['#B84450','Red'],['#326E5B','Green'],['#755493','Purple']]) },
    { key: 'scene', title: 'Background', emoji: '🏞️', choices: choices([['snow','Snowy day','❄️'],['night','Starry night','🌙'],['workshop','Workshop','🧸'],['candy','Candy land','🍬']]) },
  ],
  snowman: [
    { key: 'shape', title: 'Snow body', emoji: '⛄', choices: choices([['classic','Classic','⛄'],['round','Super round','⚪'],['tall','Extra tall','🧊']]) },
    { key: 'face', title: 'Expression', emoji: '😊', choices: choices([['smile','Smile','😊'],['wink','Wink','😉'],['giggle','Giggle','😄'],['surprised','Surprise','😮']]) },
    { key: 'eyes', title: 'Eyes', emoji: '👀', choices: choices([['coal','Coal','⚫'],['blue','Blue','🔵'],['green','Green','🟢'],['lashes','Lashes','✨']]) },
    { key: 'nose', title: 'Nose', emoji: '🥕', choices: choices([['carrot','Carrot','🥕'],['button','Button','🟠'],['star','Star','⭐'],['candy','Candy','🍬']]) },
    { key: 'arms', title: 'Arms', emoji: '👐', choices: choices([['sticks','Twig arms','🌿'],['mittens','Mittens','🧤'],['branches','Branch arms','🌳'],['none','No arms','🙌']]) },
    { key: 'hat', title: 'Headwear', emoji: '🎩', choices: choices([['top','Top hat','🎩'],['knit','Knit hat','🧶'],['santa','Santa hat','🎅'],['earmuffs','Earmuffs','🎧'],['none','No hat','🚫']]) },
    { key: 'scarf', title: 'Scarf', emoji: '🧣', choices: choices([['red','Berry','❤️'],['teal','Mint','🌿'],['purple','Purple','💜'],['gold','Gold','💛'],['none','No scarf','🚫']]) },
    { key: 'buttons', title: 'Body buttons', emoji: '💎', choices: choices([['coal','Coal','⚫'],['stars','Stars','⭐'],['hearts','Hearts','💗'],['candy','Candy','🍬'],['none','No buttons','🚫']]) },
    { key: 'scene', title: 'Background', emoji: '🏞️', choices: choices([['snow','Snowy day','❄️'],['night','Starry night','🌙'],['workshop','Workshop','🧸'],['candy','Candy land','🍬']]) },
  ],
};

export function defaultLook(kind: CreatorKind): Look {
  return Object.fromEntries(CREATOR_OPTIONS[kind].map(feature => [feature.key, feature.choices[0].value]));
}
export function randomLook(kind: CreatorKind): Look {
  return Object.fromEntries(CREATOR_OPTIONS[kind].map(feature => [
    feature.key, feature.choices[Math.floor(Math.random() * feature.choices.length)].value,
  ]));
}

function Star({ x, y, r = 7, color = '#FFDE8F' }: { x: number; y: number; r?: number; color?: string }) {
  return <path d={'M'+x+' '+(y-r)+' L'+(x+r*.27)+' '+(y-r*.27)+' L'+(x+r)+' '+y+' L'+(x+r*.27)+' '+(y+r*.27)+' L'+x+' '+(y+r)+' L'+(x-r*.27)+' '+(y+r*.27)+' L'+(x-r)+' '+y+' L'+(x-r*.27)+' '+(y-r*.27)+' Z'} fill={color} />;
}

function Backdrop({ scene }: { scene: string }) {
  const sky = scene === 'night' ? '#254666' : scene === 'candy' ? '#F6AFC2' : scene === 'workshop' ? '#F1D8AC' : '#94D3DA';
  return <g>
    <rect width="440" height="520" rx="25" fill={sky} />
    {scene === 'night' ? <>
      <circle cx="365" cy="80" r="36" fill="#FFF2C8" />
      {Array.from({length:23},(_,i)=><Star key={i} x={(i*127+31)%440} y={(i*67+19)%320} r={i%3===0?6:3} color="#FFF7D4"/>)}
    </> : scene === 'workshop' ? <>
      <rect x="26" y="100" width="388" height="276" rx="18" fill="#E9B97E" opacity=".65"/>
      <path d="M30 160H410M30 244H410M30 327H410" stroke="#BD855B" strokeWidth="10" />
      {['🧸','🎁','🪁','🚂'].map((v,i)=><text key={v} x={50+i*91} y={237} fontSize="40">{v}</text>)}
      <path d="M0 370H440V520H0Z" fill="#C88E64"/>
    </> : scene === 'candy' ? <>
      <path d="M0 326Q100 270 210 326T440 310V520H0Z" fill="#FFE6ED" />
      {Array.from({length:5},(_,i)=><g key={i} transform={'translate('+(24+i*95)+' '+(328+i%2*37)+')'}>
        <rect x="-6" y="0" width="12" height="55" rx="6" fill="#FFF4D1"/>
        <circle cy="-8" r="24" fill={i%2===0?'#F07E9D':'#87CDB5'} stroke="#FFF5D7" strokeWidth="7"/>
        <path d="M-18 -23L18 7M-18 7L18 -23" stroke="#FFF5D7" strokeWidth="5"/>
      </g>)}
    </> : <>
      <path d="M0 268Q89 218 176 279Q271 216 440 280V520H0Z" fill="#DCEFED"/>
      <path d="M0 340Q160 293 300 358Q367 320 440 345V520H0Z" fill="#F0FCF8"/>
      {Array.from({length:5},(_,i)=><g key={i} transform={'translate('+(30+i*95)+' '+(285+i%2*28)+')'}>
        <rect x="-5" y="3" width="10" height="45" fill="#907051"/>
        <path d="M0 -92L-40 -18H-23L-49 17H49L23 -18H40Z" fill="#398A75" stroke="#F3FFFB" strokeWidth="5"/>
      </g>)}
    </>}
    <path d="M0 434Q80 419 177 439T440 424V520H0Z" fill={scene==='workshop'?'#E3B98B':'#F6FBF3'} />
    {Array.from({length:11},(_,i)=><circle key={i} cx={(i*113+24)%440} cy={(i*77+34)%320} r={i%3===0?4:2.5} fill="#FFFDF6" opacity=".7"/>)}
    <ellipse cx="223" cy="435" rx="130" ry="20" fill="#375B6130" />
  </g>;
}

function Face({ expression, eyeColor, snowman = false }: { expression: string; eyeColor: string; snowman?: boolean }) {
  const eyeY = snowman ? 182 : 168;
  const leftX = snowman ? 197 : 194;
  const rightX = snowman ? 247 : 250;
  return <g>
    {expression === 'wink' ? <path d={'M'+(leftX-10)+' '+eyeY+'q10 -7 20 0'} stroke="#45372D" strokeWidth="5" fill="none" strokeLinecap="round"/> :
      <ellipse cx={leftX} cy={eyeY} rx="7" ry="9" fill={eyeColor}/>}
    <ellipse cx={rightX} cy={eyeY} rx="7" ry="9" fill={eyeColor}/>
    <circle cx={rightX-2} cy={eyeY-3} r="2.4" fill="#fff"/>
    {expression !== 'wink' && <circle cx={leftX-2} cy={eyeY-3} r="2.4" fill="#fff"/>}
    {expression === 'surprised' ? <ellipse cx="223" cy={eyeY+45} rx="10" ry="13" fill="#80434B"/> :
      expression === 'giggle' ? <g><path d={'M202 '+(eyeY+41)+' Q223 '+(eyeY+68)+' 244 '+(eyeY+41)+' Z'} fill="#843E43" />
        <path d={'M209 '+(eyeY+47)+' Q223 '+(eyeY+55)+' 237 '+(eyeY+47)} fill="none" stroke="#fff" strokeWidth="4"/></g> :
      <path d={'M207 '+(eyeY+44)+' Q223 '+(eyeY+61)+' 241 '+(eyeY+44)} fill="none" stroke="#8F5046" strokeWidth="5" strokeLinecap="round"/>}
  </g>;
}

function ElfArt({ look }: { look: Look }) {
  const skin = look.skin, hair = look.hair, outfit = look.outfitColor, boot = look.boots;
  return <g>
    <path d="M177 352L180 425H208L214 353Z M234 351L238 425H264L267 351Z" fill="#657576" stroke="#F0E1C9" strokeWidth="4"/>
    <path d="M175 411Q187 404 211 416L222 440Q207 451 162 441Q157 428 175 411Z" fill={boot} stroke="#FDE8B3" strokeWidth="4"/>
    <path d="M235 413Q251 404 268 414L288 441Q269 451 226 442Q226 423 235 413Z" fill={boot} stroke="#FDE8B3" strokeWidth="4"/>
    {look.hat==='hood'&&<ellipse cx="221" cy="153" rx="93" ry="104" fill={outfit} stroke="#F7E6B4" strokeWidth="7"/>}
    <path d="M180 268Q142 268 130 300L110 346L141 360L167 328L185 335" fill={outfit} stroke="#F8EBC8" strokeWidth="5"/>
    <path d="M262 268Q305 272 314 306L332 343L301 358L278 325L260 334" fill={outfit} stroke="#F8EBC8" strokeWidth="5"/>
    <ellipse cx="113" cy="356" rx="17" ry="19" fill={skin}/><ellipse cx="324" cy="355" rx="17" ry="19" fill={skin}/>
    <path d={look.outfit==='dress'?'M190 268Q221 254 251 268L275 384Q221 401 165 384Z':look.outfit==='jacket'?'M179 271Q218 259 265 270L280 366H162Z':look.outfit==='overalls'?'M179 279H262L272 371H169Z':'M190 268Q221 255 252 268L280 370Q218 391 164 370Z'} fill={outfit} stroke="#FCEED3" strokeWidth="6" strokeLinejoin="round"/>
    {look.outfit==='overalls'?<>
      <rect x="197" y="283" width="46" height="70" rx="8" fill="#FCDF9B" stroke="#FCEED3" strokeWidth="4"/>
      <path d="M183 272L199 321M259 272L242 321" stroke="#FCEED3" strokeWidth="13"/>
    </>:look.outfit==='jacket'?<path d="M222 269V363M180 315H266" stroke="#FEECC0" strokeWidth="7"/>:
      look.outfit==='dress'?<><path d="M191 311Q223 322 255 311" fill="none" stroke="#FEE3AB" strokeWidth="7"/><Star x={221} y={342} r={15}/></>:
      <path d="M222 273V360" stroke="#FFE5B0" strokeWidth="6" strokeDasharray="9 14" />}
    <path d="M169 363Q220 383 270 363" stroke="#FEECC0" strokeWidth="5" fill="none"/>
    <rect x="207" y="246" width="29" height="37" rx="12" fill={skin}/>
    {look.hairStyle==='pigtails'&&<><ellipse cx="133" cy="164" rx="26" ry="47" fill={hair}/><ellipse cx="306" cy="164" rx="26" ry="47" fill={hair}/>
      <circle cx="144" cy="142" r="12" fill="#ED91A1"/><circle cx="298" cy="142" r="12" fill="#ED91A1"/></>}
    {look.hairStyle==='curls'&&Array.from({length:9},(_,i)=><circle key={i} cx={154+i*16} cy={117+(i%2)*7} r="17" fill={hair}/>)}
    <path d="M147 144L112 154Q122 194 151 191Z M293 143L333 155Q321 193 291 193Z" fill={skin} stroke="#C18A72" strokeWidth="3"/>
    <ellipse cx="220" cy="165" rx="76" ry="88" fill={skin} stroke="#C89174" strokeWidth="3"/>
    <ellipse cx="170" cy="199" rx="15" ry="9" fill="#F5A0A6" opacity=".56"/><ellipse cx="272" cy="199" rx="15" ry="9" fill="#F5A0A6" opacity=".56"/>
    <path d={look.hairStyle==='swoop'?'M151 152Q132 69 218 70Q305 66 291 148Q238 133 202 108Q192 140 151 152Z':
      look.hairStyle==='fringe'?'M149 160Q132 65 224 69Q313 75 296 156L282 127L259 151L242 124L220 151L199 124L179 151L159 124Z':
      look.hairStyle==='curls'?'M149 147Q151 73 220 71Q299 69 294 146Q261 122 220 124Q180 126 149 147Z':
      'M148 143Q151 79 219 74Q294 79 293 143Q217 107 148 143Z'} fill={hair}/>
    {look.hairStyle==='curls'&&Array.from({length:9},(_,i)=><circle key={i} cx={157+i*15} cy={117+(i%2)*8} r="15" fill={hair}/>)}
    <Face expression={look.face} eyeColor={look.eyes}/>
    <path d="M216 198Q223 203 230 198" fill="none" stroke="#C08872" strokeWidth="3"/>
    {look.hat==='pointy'&&<>
      <path d="M139 111Q154 48 255 12Q286 10 274 45L307 118Q211 100 139 111Z" fill={outfit} stroke="#FBE8B4" strokeWidth="6"/>
      <path d="M143 112Q220 91 302 112" fill="none" stroke="#FBE8B4" strokeWidth="17" strokeLinecap="round"/>
      <circle cx="258" cy="13" r="14" fill="#FFDC81"/>
    </>}
    {look.hat==='pom'&&<>
      <path d="M141 115Q139 39 216 37Q302 35 298 115" fill={outfit} stroke="#FFEFD3" strokeWidth="7"/>
      <path d="M145 117H295" stroke="#FAE6C5" strokeWidth="23" strokeLinecap="round"/>
      <circle cx="223" cy="29" r="23" fill="#FFF7E7"/>
    </>}
    {look.hat==='hood'&&<path d="M143 129Q174 49 262 66Q297 83 306 135" fill="none" stroke="#F9E9C9" strokeWidth="18" strokeLinecap="round"/>}
    {look.hat==='crown'&&<><path d="M152 115L148 65L176 80L206 47L238 78L272 49L291 110Z" fill="#FFE1A0" stroke="#CA9B53" strokeWidth="5"/><Star x={223} y={84} r={14} color="#F6A0A5"/></>}
    {look.accessory==='wand'&&<><path d="M320 355L351 280" stroke="#926748" strokeWidth="9" strokeLinecap="round"/><Star x={354} y={272} r={23} color="#FFD96D"/></>}
    {look.accessory==='gift'&&<g><rect x="306" y="306" width="59" height="58" rx="7" fill="#ED91AA" stroke="#FFF3E3" strokeWidth="5"/><path d="M334 307V362M307 334H361" stroke="#FFEDAE" strokeWidth="9"/><path d="M335 311Q308 296 319 290Q331 284 335 311Q355 279 362 298Q363 307 335 311Z" fill="#FFEDAE"/></g>}
    {look.accessory==='candy'&&<g><path d="M325 356V289Q325 270 343 270Q360 270 360 288" fill="none" stroke="#FFF5E5" strokeWidth="15" strokeLinecap="round"/><path d="M326 322L337 333M326 295L340 306M342 272L350 288" stroke="#D95663" strokeWidth="9"/></g>}
    {look.accessory==='teddy'&&<g transform="translate(337 329)"><circle cx="-20" cy="-17" r="12" fill="#BA8054"/><circle cx="20" cy="-17" r="12" fill="#BA8054"/><circle cy="-12" r="26" fill="#C99A6B"/><ellipse cy="29" rx="29" ry="33" fill="#C99A6B"/><ellipse cy="-5" rx="10" ry="9" fill="#E7C69C"/><circle cy="-8" r="5" fill="#6B4C42"/><circle cx="-11" cy="-17" r="4" fill="#49342D"/><circle cx="11" cy="-17" r="4" fill="#49342D"/></g>}
  </g>;
}

function SnowmanArt({ look }: { look: Look }) {
  const tall = look.shape === 'tall', round = look.shape === 'round';
  const baseRx = round ? 121 : tall ? 92 : 105;
  const topR = round ? 73 : tall ? 66 : 71;
  const scarfColor = ({red:'#CE5E6D',teal:'#41A68F',purple:'#9B7ACA',gold:'#E5BA5B'} as Record<string,string>)[look.scarf] || '#D26166';
  const coal = look.eyes==='blue'?'#468AB8':look.eyes==='green'?'#45936B':'#3E4446';
  return <g>
    {look.arms!=='none'&&<>
      <path d="M154 319Q111 299 79 253M284 321Q327 292 364 255" fill="none" stroke="#856249" strokeWidth={look.arms==='branches'?12:9} strokeLinecap="round"/>
      {look.arms==='branches'&&<><path d="M103 274L92 249M321 281L350 267" stroke="#856249" strokeWidth="8" strokeLinecap="round"/></>}
      {look.arms==='mittens'&&<><ellipse cx="83" cy="251" rx="20" ry="26" fill="#E87991"/><ellipse cx="359" cy="254" rx="20" ry="26" fill="#4D9D88"/><rect x="72" y="269" width="21" height="15" rx="4" fill="#FFF3D8"/><rect x="347" y="270" width="22" height="15" rx="4" fill="#FFF3D8"/></>}
      {look.arms==='sticks'&&<><path d="M84 263L56 257M84 263L74 234M358 267L389 258M358 267L377 232" stroke="#856249" strokeWidth="6" strokeLinecap="round"/></>}
    </>}
    <ellipse cx="220" cy={tall?367:361} rx={baseRx} ry={tall?97:round?84:94} fill="#F0FAFC" stroke="#CCDFE3" strokeWidth="6"/>
    <ellipse cx="220" cy="263" rx={round?84:tall?67:75} ry={tall?88:74} fill="#F6FCFD" stroke="#CADFE6" strokeWidth="6"/>
    <circle cx="221" cy={tall?164:158} r={topR} fill="#F9FFFF" stroke="#D3E9ED" strokeWidth="5"/>
    <path d="M183 139Q219 110 253 132" fill="none" stroke="#FFF" strokeWidth="12" strokeLinecap="round" opacity=".85"/>
    <g transform={'translate(0 '+(tall?-18:0)+')'}><Face expression={look.face} eyeColor={coal} snowman/></g>
    {look.eyes==='lashes'&&<><path d="M186 168L177 160M255 168L266 160" stroke="#3E4446" strokeWidth="4" strokeLinecap="round"/></>}
    {look.nose==='carrot'?<path d="M221 197L293 211L222 213Z" fill="#F39A55" stroke="#CA7843" strokeWidth="3"/>:
      look.nose==='button'?<circle cx="221" cy="206" r="11" fill="#DDA267" stroke="#B7794D" strokeWidth="4"/>:
      look.nose==='star'?<Star x={222} y={206} r={15} color="#F2C569"/>:
      <path d="M220 212V187Q220 173 236 175Q245 177 244 190" stroke="#DF6982" strokeWidth="8" fill="none" strokeLinecap="round"/>}
    {look.scarf!=='none'&&<>
      <path d="M174 223Q224 249 274 223L278 249Q223 268 169 247Z" fill={scarfColor} stroke="#F7F0D6" strokeWidth="5"/>
      <path d="M250 243Q263 265 260 315L240 325Q230 283 235 248Z" fill={scarfColor} stroke="#F7F0D6" strokeWidth="5"/>
      <path d="M240 311L239 329M251 313L254 329M260 310L267 323" stroke="#F7F0D6" strokeWidth="4"/>
    </>}
    {look.buttons!=='none'&&[300,336,372].map((cy,i)=>look.buttons==='coal'?<circle key={cy} cx={220} cy={cy} r="10" fill="#464A50" stroke="#FFF" strokeWidth="2"/>:
      look.buttons==='stars'?<Star key={cy} x={220} y={cy} r={13} color={i===1?'#DF8BAD':'#E2B95E'}/>:
      look.buttons==='hearts'?<path key={cy} d={'M220 '+(cy+12)+'Q191 '+(cy-6)+' 205 '+(cy-15)+'Q215 '+(cy-20)+' 220 '+(cy-10)+'Q229 '+(cy-21)+' 239 '+(cy-14)+'Q254 '+(cy-3)+' 220 '+(cy+12)+'Z'} fill="#E98099"/>:
      <g key={cy}><circle cx={220} cy={cy} r="12" fill="#DD82AA"/><circle cx={220} cy={cy} r="7" fill="#F5D98D"/></g>)}
    {look.hat==='top'&&<><path d="M157 114H286L279 130H166Z" fill="#424E58" stroke="#F3D7AB" strokeWidth="5"/><rect x="177" y="32" width="89" height="87" rx="9" fill="#3C4853" stroke="#F3D7AB" strokeWidth="5"/><rect x="177" y="96" width="90" height="17" fill="#E2808E"/></>}
    {look.hat==='knit'&&<><path d="M155 123Q150 40 222 31Q292 46 292 120Z" fill="#8D77C2" stroke="#FFF0D7" strokeWidth="5"/><path d="M151 118H295" stroke="#F0DFCD" strokeWidth="19"/><circle cx="221" cy="27" r="21" fill="#FFF5E8"/></>}
    {look.hat==='santa'&&<><path d="M157 121Q165 44 213 29Q255 12 276 48L320 85L297 103Q273 71 253 80Q232 101 157 121Z" fill="#D96770" stroke="#FFE9CB" strokeWidth="5"/><path d="M155 117Q220 96 292 117" fill="none" stroke="#FFF8ED" strokeWidth="21"/><circle cx="318" cy="88" r="21" fill="#FFF8ED"/></>}
    {look.hat==='earmuffs'&&<><path d="M149 177Q145 63 222 68Q300 63 300 177" fill="none" stroke="#815E8C" strokeWidth="14"/><ellipse cx="150" cy="170" rx="18" ry="31" fill="#E296C4"/><ellipse cx="295" cy="170" rx="18" ry="31" fill="#E296C4"/></>}
  </g>;
}

export function CharacterPreview({ kind, look, name }: { kind: CreatorKind; look: Look; name: string }) {
  return <svg className="character-svg" viewBox="0 0 440 520" role="img" aria-label={kind==='elf'?'Your customized Christmas elf':'Your customized snowman'}>
    <Backdrop scene={look.scene}/>
    {kind==='elf'?<ElfArt look={look}/>:<SnowmanArt look={look}/>}
    <g><rect x="85" y="467" width="270" height="41" rx="17" fill="#FFF8E8" stroke="#D4B679" strokeWidth="3"/>
      <text x="220" y="496" textAnchor="middle" fill="#476351" fontSize="20" fontWeight="900" fontFamily="Nunito, sans-serif">{name.trim().slice(0,25) || (kind==='elf'?'My Elf':'My Snowman')}</text></g>
  </svg>;
}

export function CharacterCreator({ kind, child }: { kind: CreatorKind; child: ChildId }) {
  const [look, setLook] = useState<Look>(()=>defaultLook(kind));
  const [name, setName] = useState(kind==='elf'?'My Elf':'My Snowman');
  const [activeCategory, setActiveCategory] = useState(CREATOR_OPTIONS[kind][0].key);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Creation[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const options = CREATOR_OPTIONS[kind];
  const active = options.find(f=>f.key===activeCategory) || options[0];

  useEffect(()=>{
    setLook(defaultLook(kind));
    setName(kind==='elf'?'My Elf':'My Snowman');
    setActiveCategory(CREATOR_OPTIONS[kind][0].key);
    setSelectedId(null);
    setMessage('');
    setError('');
  },[kind,child]);

  useEffect(()=>{
    let current=true;
    setLoading(true);
    requestApi<{ creations: Creation[] }>('characters?child='+child+'&kind='+kind)
      .then(data=>{if(current){setSaved(data.creations);setError('');}})
      .catch(()=>{if(current){setSaved([]);setError('Saving is unavailable right now. You can still dress up your character!');}})
      .finally(()=>{if(current)setLoading(false);});
    return ()=>{current=false;};
  },[kind,child]);

  function update(key: string, value: string) {
    setLook(prev=>({...prev,[key]:value}));
    setMessage('');
  }
  function newCharacter() {
    setLook(defaultLook(kind));
    setName(kind==='elf'?'My Elf':'My Snowman');
    setSelectedId(null);
    setMessage('A fresh character is ready!');
    setError('');
  }
  function surprise() {
    setLook(randomLook(kind));
    setMessage('✨ Ta-da! What do you think?');
  }
  async function save() {
    if (busy) return;
    setBusy(true);setError('');setMessage('');
    try{
      const body={child,kind,name:name.trim() || (kind==='elf'?'My Elf':'My Snowman'),look};
      const result=await requestApi<{ id: string }>(selectedId?'characters/'+selectedId:'characters',{
        method:selectedId?'PATCH':'POST', body,
      });
      setSelectedId(result.id);
      const data=await requestApi<{ creations: Creation[] }>('characters?child='+child+'&kind='+kind);
      setSaved(data.creations);
      setMessage('🌟 Saved to your character collection!');
    }catch(e){setError(e instanceof Error?e.message:'Unable to save your character.');}
    finally{setBusy(false);}
  }
  async function remove(item: Creation) {
    if (busy) return;
    setBusy(true);setError('');
    try{
      await requestApi('characters/'+item.id+'?child='+child+'&kind='+kind,{method:'DELETE'});
      setSaved(list=>list.filter(c=>c.id!==item.id));
      if(selectedId===item.id)setSelectedId(null);
      setMessage('Character removed from your collection.');
    }catch(e){setError(e instanceof Error?e.message:'Unable to remove this character.');}
    finally{setBusy(false);}
  }
  function load(item: Creation) {
    setLook(item.look);
    setName(item.name);
    setSelectedId(item.id);
    setMessage('You can dress up this character some more!');
    setError('');
    setActiveCategory(options[0].key);
  }

  return <section className="character-studio" aria-label={kind==='elf'?'Create an elf':'Create a snowman'}>
    <div className="character-title">
      <div><span className="eyebrow">✨ THE CHARACTER STUDIO ✨</span>
        <h3>{kind==='elf'?'🧝 Design Your Own Elf':'⛄ Build Your Own Snowman'}</h3>
        <p>Pick a look, try fun outfits and create your very own Christmas friend!</p></div>
      <button type="button" className="character-surprise" onClick={surprise}>🎲 Surprise me!</button>
    </div>
    <div className="character-layout">
      <div className="character-preview">
        <CharacterPreview kind={kind} look={look} name={name}/>
        <div className="character-name">
          <label htmlFor={'creator-name-'+kind}>Name your {kind}</label>
          <input id={'creator-name-'+kind} value={name} maxLength={24}
            placeholder={kind==='elf'?'Sparkle':'Snowy'}
            onChange={e=>{setName(e.target.value);setMessage('');}}/>
        </div>
        <div className="character-actions">
          <button type="button" className="action" onClick={()=>void save()} disabled={busy}>{busy?'Saving…':selectedId?'💾 Save changes':'💾 Save my '+kind}</button>
          <button type="button" className="action secondary" onClick={newCharacter}>✦ Make another</button>
        </div>
        {message&&<p className="character-message" role="status">{message}</p>}
        {error&&<p className="character-error" role="alert">{error}</p>}
      </div>
      <div className="character-customize">
        <h4>Choose what to customize</h4>
        <div className="character-categories" role="group" aria-label="Character customization categories">
          {options.map(feature=><button key={feature.key} type="button"
            className={active.key===feature.key?'selected':''}
            aria-pressed={active.key===feature.key} onClick={()=>setActiveCategory(feature.key)}>
            <span>{feature.emoji}</span>{feature.title}</button>)}
        </div>
        <h4>{active.emoji} {active.title}</h4>
        <div className="character-choices" role="group" aria-label={active.title}>
          {active.choices.map(choice=><button key={choice.value} type="button"
            aria-pressed={look[active.key]===choice.value}
            className={look[active.key]===choice.value?'selected':''}
            onClick={()=>update(active.key,choice.value)}>
            <span className="character-choice-art" aria-hidden="true">
              {choice.swatch?<span className="character-color" style={{backgroundColor:choice.swatch}}/>:choice.emoji}
            </span>
            <strong>{choice.label}</strong>
            {look[active.key]===choice.value&&<span className="character-choice-check" aria-hidden="true">✓</span>}
          </button>)}
        </div>
        <div className="character-custom-hint">👆 Tap a choice and watch your character change!</div>
      </div>
    </div>
    <section className="character-gallery">
      <div className="section-row"><div><h4>🌟 My saved characters</h4>
        <p>{loading?'Loading your creations…':saved.length? 'Tap a character to dress them up again.':'Save your first character to start a collection!'}</p></div>
        <span className="stat-chip">{saved.length}/24 saved</span></div>
      {saved.length>0&&<div className="character-gallery-grid">
        {saved.map(item=><div className={'character-gallery-item '+(selectedId===item.id?'selected':'')} key={item.id}>
          <button type="button" className="character-gallery-load" onClick={()=>load(item)}
            aria-label={'Customize '+item.name}>
            <CharacterPreview kind={item.kind} look={item.look} name={item.name}/>
            <strong>{item.name}</strong></button>
          <button type="button" className="character-gallery-delete" onClick={()=>void remove(item)} disabled={busy} aria-label={'Delete '+item.name}>🗑 Remove</button>
        </div>)}
      </div>}
      <small className="character-save-note">Saved characters are shared across your family’s devices for this child profile.</small>
    </section>
  </section>;
}
