import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

/* ─────────────────────────────
   Food SVG Components
───────────────────────────── */
function PizzaSVG({ added }) {
  const h = id => added.has(id);
  const tops = [[78,78],[116,72],[97,105],[68,108],[128,100],[108,128],[74,128]];
  return (
    <svg viewBox="0 0 200 200" width={210} height={210} style={{ maxWidth: '100%', height: 'auto' }}>
      <ellipse cx="100" cy="196" rx="88" ry="8" fill="#e0e0e0" opacity=".6"/>
      <circle cx="100" cy="100" r="95" fill="#fafafa" stroke="#ebebeb" strokeWidth="2"/>
      {h('dough') && <>
        <circle cx="100" cy="100" r="88" fill="#e8a84a"/>
        <circle cx="100" cy="100" r="78" fill="#f2c07a"/>
        {[0,40,80,120,160,200,240,280,320].map(a => {
          const rad = a*Math.PI/180;
          return <circle key={a} cx={100+83*Math.cos(rad)} cy={100+83*Math.sin(rad)}
            r="7" fill="#d4883a" opacity=".75"/>;
        })}
      </>}
      {h('sauce') && <circle cx="100" cy="100" r="70" fill="#d32f2f" opacity=".9"/>}
      {h('cheese') && <>
        <circle cx="100" cy="100" r="68" fill="#ffd54f" opacity=".88"/>
        {[[88,82],[112,90],[95,112],[108,76],[78,100]].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={16+i%2*5} ry={12+i%2*4}
            fill="#ffe082" transform={`rotate(${i*28} ${cx} ${cy})`} opacity=".8"/>
        ))}
      </>}
      {h('pepperoni') && tops.map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="11" fill="#c62828"/>
          <circle cx={cx} cy={cy} r="8.5" fill="#b71c1c"/>
          {[[3,2],[-3,-2],[1,-4]].map(([dx,dy],j) => (
            <circle key={j} cx={cx+dx} cy={cy+dy} r="2" fill="#c62828" opacity=".45"/>
          ))}
        </g>
      ))}
      {h('mushroom') && [[88,70],[120,90],[84,122],[112,126]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <ellipse cx="0" cy="-5" rx="10" ry="7" fill="#8d6e63"/>
          <rect x="-3.5" y="-2" width="7" height="10" rx="2" fill="#d7ccc8"/>
        </g>
      ))}
      {h('pepper') && [[74,96],[106,84],[94,116],[122,110]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="12" ry="5"
          fill={['#43a047','#ffee58','#e53935','#2196f3'][i]}
          transform={`rotate(${i*55} ${cx} ${cy})`} opacity=".95"/>
      ))}
      {h('olive') && [[90,92],[113,88],[100,120],[76,118]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="8" fill="#33691e"/>
          <circle cx={cx} cy={cy} r="3.5" fill="#558b2f"/>
        </g>
      ))}
    </svg>
  );
}

function BurgerSVG({ added }) {
  const h = id => added.has(id);

  let curY = 234;
  const nextY = height => { curY -= height; return curY; };

  const bunBotY  = h('bun')     ? nextY(22) : null;
  const pattyY   = h('patty')   ? nextY(24) : null;
  const cheeseY  = h('cheese')  ? nextY(12) : null;
  const lettuceY = h('lettuce') ? nextY(18) : null;
  const tomatoY  = h('tomato')  ? nextY(14) : null;
  const onionY   = h('onion')   ? nextY(12) : null;
  const bunTopY  = h('bun')     ? curY      : null;

  return (
    <svg viewBox="0 0 200 240" width={200} height={240} style={{ maxWidth: '100%', height: 'auto' }}>
      <ellipse cx="100" cy="236" rx="86" ry="10" fill="#e8e8e8"/>
      {bunBotY !== null && <>
        <rect x="28" y={bunBotY} width={144} height={22} rx={11} fill="#e8a44a"/>
        <rect x="28" y={bunBotY} width={144} height={10} rx={8} fill="#f0c06a"/>
      </>}
      {pattyY !== null && <>
        <rect x="30" y={pattyY} width={140} height={24} rx={12} fill="#6d3c1e"/>
        <rect x="34" y={pattyY+2} width={132} height={10} rx={5} fill="#8b4e28" opacity=".7"/>
        {[52,76,100,124,148].map((x,i) => (
          <line key={i} x1={x} y1={pattyY+2} x2={x-8} y2={pattyY+22}
            stroke="#4a2812" strokeWidth="2" opacity=".4"/>
        ))}
      </>}
      {cheeseY !== null && <>
        <rect x="20" y={cheeseY} width={160} height={14} rx={4} fill="#ffd740"/>
        <rect x="20" y={cheeseY} width={160} height={6} rx={4} fill="#ffe57f" opacity=".7"/>
      </>}
      {lettuceY !== null && (
        <path d={`M24,${lettuceY+18} q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 L176,${lettuceY+18} Z`}
          fill="#66bb6a"/>
      )}
      {tomatoY !== null && [48,82,116,152].map((cx,i) => (
        <g key={i}>
          <ellipse cx={cx} cy={tomatoY+8} rx={22} ry={9} fill="#e53935" opacity=".9"/>
          <line x1={cx} y1={tomatoY+1} x2={cx} y2={tomatoY+15}
            stroke="#ef9a9a" strokeWidth="1.5" opacity=".6"/>
        </g>
      ))}
      {onionY !== null && [54,100,146].map((cx,i) => (
        <ellipse key={i} cx={cx} cy={onionY+6} rx={22} ry={8} fill="#e1bee7" opacity=".85"
          stroke="#ce93d8" strokeWidth="1"/>
      ))}
      {bunTopY !== null && <>
        <path d={`M28,${bunTopY} Q28,${bunTopY-55} 100,${bunTopY-59} Q172,${bunTopY-55} 172,${bunTopY} Z`}
          fill="#e8a44a"/>
        <path d={`M34,${bunTopY} Q34,${bunTopY-47} 100,${bunTopY-51} Q166,${bunTopY-47} 166,${bunTopY} Z`}
          fill="#f0b860" opacity=".65"/>
        {[[82,16],[100,10],[118,15],[90,26],[110,24],[72,22],[128,20]].map(([bx,by],i) => (
          <ellipse key={i} cx={bx} cy={bunTopY-by} rx={7} ry={3.5}
            fill="#fff8e1" opacity=".9" transform={`rotate(${i*25-30} ${bx} ${bunTopY-by})`}/>
        ))}
        <ellipse cx="100" cy={bunTopY-46} rx="32" ry="8" fill="rgba(255,255,255,0.2)"/>
      </>}
    </svg>
  );
}

function IceCreamSVG({ added }) {
  const h = id => added.has(id);

  const scoopDefs = [
    { id: 'vanilla',    fill: '#fff9c4', stroke: '#f9a825' },
    { id: 'chocolate',  fill: '#795548', stroke: '#4e342e' },
    { id: 'strawberry', fill: '#f48fb1', stroke: '#e91e63' },
    { id: 'mint',       fill: '#b2dfdb', stroke: '#26a69a' },
    { id: 'cookie',     fill: '#8d6e63', stroke: '#5d4037' },
  ];
  const scoops = scoopDefs.filter(s => h(s.id));

  const CX = 100;
  const CONE_Y = 198;
  const R = 38;
  const GAP = 56;

  // Top scoop center
  const topY = scoops.length > 0
    ? CONE_Y - R * 0.4 - (scoops.length - 1) * GAP
    : CONE_Y - R;

  // Dynamic viewBox so scoops never clip
  const minY = Math.min(topY - R - 35, 0);
  const vh = 290 - minY;

  return (
    <svg viewBox={`0 ${minY} 200 ${vh}`} width={200} height={Math.min(320, vh)} style={{ maxWidth: '100%', height: 'auto' }}>
      {/* Cone */}
      {h('cone') && <>
        <defs>
          <clipPath id="iceConeClip">
            <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`}/>
          </clipPath>
        </defs>
        <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`} fill="#d4956a"/>
        {/* Waffle lines clipped to cone shape */}
        <g clipPath="url(#iceConeClip)">
          {[-3,-2,-1,0,1,2,3].map(i => (
            <line key={`d${i}`} x1={CX+i*15-46} y1={CONE_Y} x2={CX} y2={CONE_Y+82}
              stroke="#a06030" strokeWidth="1.2" opacity=".55"/>
          ))}
          {[0.18,0.38,0.58,0.78].map((t,i) => {
            const hw = 46*(1-t);
            return <line key={`h${i}`} x1={CX-hw} y1={CONE_Y+82*t} x2={CX+hw} y2={CONE_Y+82*t}
              stroke="#a06030" strokeWidth="1.2" opacity=".5"/>;
          })}
        </g>
        <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`}
          fill="none" stroke="#a06030" strokeWidth="1.5"/>
        <ellipse cx={CX} cy={CONE_Y} rx="46" ry="12" fill="#edc070"/>
      </>}

      {/* Scoops */}
      {scoops.map((s, i) => {
        const sy = CONE_Y - R * 0.4 - i * GAP;
        return (
          <g key={s.id}>
            <circle cx={CX} cy={sy} r={R} fill={s.fill} stroke={s.stroke} strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}/>
            <ellipse cx={CX-13} cy={sy-14} rx="13" ry="9"
              fill="rgba(255,255,255,0.5)" transform={`rotate(-25 ${CX-13} ${sy-14})`}/>
          </g>
        );
      })}

      {/* Toppings — always anchored to top scoop */}
      {scoops.length > 0 && <>
        {h('whip') && (
          [[-12,-3],[0,-16],[12,-3],[0,3]].map(([dx,dy],i) => (
            <ellipse key={i} cx={CX+dx} cy={topY-R+dy-5} rx="13" ry="10"
              fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}/>
          ))
        )}
        {h('choc') && (
          [[-18,6],[6,15],[20,-3],[-4,-16],[16,-14]].map(([dx,dy],i) => (
            <path key={i} d={`M${CX+dx},${topY-R*0.5+dy} q${dx/3+5},${dy/2+10} ${dx/3+12},${dy/2+22}`}
              stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".85"/>
          ))
        )}
        {h('sprinkles') && (
          [[-22,-4],[16,-12],[-12,14],[20,10],[-4,-22],[22,0],[-20,6],[8,20]].map(([dx,dy],i) => (
            <rect key={i} x={CX+dx-5} y={topY-R*0.45+dy} width="12" height="5" rx="2.5"
              fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800','#f06292','#26c6da'][i]}
              transform={`rotate(${i*45} ${CX+dx} ${topY-R*0.45+dy+2.5})`}/>
          ))
        )}
        {h('cherry') && <>
          <circle cx={CX} cy={topY-R-10} r="12" fill="#e53935"
            style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }}/>
          <ellipse cx={CX+4} cy={topY-R-15} rx="5" ry="3.5"
            fill="rgba(255,255,255,0.45)" transform={`rotate(-30 ${CX+4} ${topY-R-15})`}/>
          <path d={`M${CX},${topY-R-22} q-14,-20 -8,-34`}
            stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </>}
      </>}
    </svg>
  );
}

function CakeSVG({ added }) {
  const h = id => added.has(id);

  const layerDefs = [
    { id:'layer1', fill:'#f48fb1', hilite:'#fce4ec', rx:74, x:26 },
    { id:'layer2', fill:'#ce93d8', hilite:'#f3e5f5', rx:60, x:40 },
    { id:'layer3', fill:'#80cbc4', hilite:'#e0f2f1', rx:46, x:54 },
  ];
  const layers = layerDefs.filter(l => h(l.id));
  const n = layers.length;
  const LAYER_H = 44;
  const ERY = 12;
  const lty = i => 258 - (i + 1) * LAYER_H;

  return (
    <svg viewBox="0 0 200 280" width={210} height={280} style={{ maxWidth: '100%', height: 'auto' }}>
      <ellipse cx="100" cy="260" rx="90" ry="12" fill="#e0e0e0" opacity=".8"/>
      {layers.map((layer, i) => {
        const ty = lty(i);
        return (
          <g key={layer.id}>
            <rect x={layer.x} y={ty} width={layer.rx*2} height={LAYER_H} rx={8} fill={layer.fill}/>
            <rect x={layer.x+4} y={ty+4} width={layer.rx*2-8} height={10} rx={5}
              fill={layer.hilite} opacity=".5"/>
            {/* Frosting cap with shine */}
            <ellipse cx={100} cy={ty} rx={layer.rx} ry={ERY} fill="white" opacity=".95"/>
            <ellipse cx={88} cy={ty-3} rx={layer.rx*0.36} ry={4} fill="rgba(255,255,255,0.65)"/>
            {/* Frosting drips */}
            {[...Array(5)].map((_,j) => {
              const dropX = layer.x + 14 + j * (layer.rx*2 - 28) / 4;
              const dropLen = 10 + [4,7,5,8,3][j];
              return (
                <path key={j} d={`M${dropX},${ty+ERY*0.7} q1,${dropLen} -1,${dropLen+6}`}
                  stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".9"/>
              );
            })}
          </g>
        );
      })}
      {h('candles') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        const xs = n===3 ? [80,100,120] : n===2 ? [73,91,109,127] : [60,78,100,122,140];
        const colors = ['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8'];
        return xs.map((cx,i) => (
          <g key={i}>
            <rect x={cx-5} y={ty-32} width={10} height={26} rx={4} fill={colors[i%colors.length]}/>
            <line x1={cx} y1={ty-32} x2={cx} y2={ty-36} stroke="#5d4037" strokeWidth="1.5"/>
            <path d={`M${cx},${ty-36} q-5,-9 0,-19 q5,9 0,19`} fill="#ffee58" opacity=".9"/>
            <path d={`M${cx},${ty-38} q-3,-6 0,-12 q3,6 0,12`} fill="#ff9800"/>
          </g>
        ));
      })()}
      {h('sprinkles') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        return [[-22,4],[14,-3],[24,9],[6,13],[-12,8],[-5,-7]].map(([dx,dy],i) => (
          <rect key={i} x={100+dx-5} y={ty+dy} width="12" height="5" rx="2.5"
            fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800'][i]}
            transform={`rotate(${i*35} ${100+dx} ${ty+dy+2.5})`}/>
        ));
      })()}
      {h('stars') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        return [[-30,-2],[0,-10],[30,0]].map(([dx,dy],i) => (
          <text key={i} x={100+dx} y={ty+dy} fontSize="16" textAnchor="middle">⭐</text>
        ));
      })()}
    </svg>
  );
}

function TacoSVG({ added }) {
  const h = id => added.has(id);
  return (
    <svg viewBox="0 0 220 185" width={230} height={185} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <clipPath id="tacoClip">
          <path d="M22,164 Q110,40 198,164 Z"/>
        </clipPath>
      </defs>

      <ellipse cx="110" cy="178" rx="88" ry="8" fill="#e0e0e0" opacity=".5"/>

      {/* Shell — arch shape, three layers for depth */}
      {h('shell') && <>
        <path d="M22,164 Q110,40 198,164 Z" fill="#c8893a"/>
        <path d="M32,164 Q110,54 188,164 Z" fill="#e8b050"/>
        <path d="M42,164 Q110,66 178,164 Z" fill="#f5c860" opacity=".7"/>
      </>}

      {/* All filling clipped to arch interior */}
      <g clipPath="url(#tacoClip)">
        {h('meat') && (
          <path d="M22,164 Q110,108 198,164 Z" fill="#8d4c2a"/>
        )}
        {h('lettuce') && (
          <path d="M26,157 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q12,-14 18,0 L198,164 Q110,122 26,164 Z"
            fill="#66bb6a" opacity=".95"/>
        )}
        {h('tomato') && [58,92,130,166].map((cx,i) => (
          <g key={i}>
            <circle cx={cx} cy={138} r="11" fill="#e53935" opacity=".9"/>
            <line x1={cx} y1={128} x2={cx} y2={148} stroke="#ef9a9a" strokeWidth="1.5" opacity=".6"/>
            <line x1={cx-9} y1={132} x2={cx+9} y2={144} stroke="#ef9a9a" strokeWidth="1.5" opacity=".6"/>
          </g>
        ))}
        {/* Cheese — wavy closed ribbon, 6 waves × 28px = 168px (clipped at edges) */}
        {h('cheese') && (
          <path d="M28,124 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 L196,132 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 Z"
            fill="#ffd740" opacity=".92"/>
        )}
        {/* Sour cream — wavy closed ribbon, 4 waves × 32px = 128px */}
        {h('sourcream') && (
          <path d="M52,109 q16,-11 32,0 q16,-11 32,0 q16,-11 32,0 q16,-11 32,0 L180,117 q-16,11 -32,0 q-16,11 -32,0 q-16,11 -32,0 q-16,11 -32,0 Z"
            fill="white" opacity=".95"/>
        )}
        {h('salsa') && [66,102,140,174].map((cx,i) => (
          <circle key={i} cx={cx} cy={97} r="8" fill="#ff5722" opacity=".85"/>
        ))}
        {h('jalapeno') && [80,118,156].map((cx,i) => (
          <ellipse key={i} cx={cx} cy={86} rx="13" ry="6" fill="#388e3c"
            transform={`rotate(${i*20-20} ${cx} 86)`}/>
        ))}
      </g>

      {/* Shell outer edge on top */}
      {h('shell') && (
        <path d="M22,164 Q110,40 198,164" fill="none" stroke="#a06820" strokeWidth="3"/>
      )}
    </svg>
  );
}

/* ─────────────────────────────
   Food Definitions
───────────────────────────── */
const FOODS = [
  {
    id: 'pizza', name: 'Pizza', emoji: '🍕', cookWord: 'Bake', cookEmoji: '🔥',
    required: ['dough','sauce','cheese'],
    optional: ['pepperoni','mushroom','pepper','olive'],
    ingredients: [
      { id:'dough',     label:'🍞 Pizza Dough',    req:true  },
      { id:'sauce',     label:'🍅 Tomato Sauce',   req:true  },
      { id:'cheese',    label:'🧀 Mozzarella',     req:true  },
      { id:'pepperoni', label:'🔴 Pepperoni',      req:false },
      { id:'mushroom',  label:'🍄 Mushrooms',      req:false },
      { id:'pepper',    label:'🫑 Bell Peppers',   req:false },
      { id:'olive',     label:'🫒 Olives',         req:false },
    ],
    Viz: PizzaSVG,
  },
  {
    id: 'burger', name: 'Burger', emoji: '🍔', cookWord: 'Grill', cookEmoji: '🥩',
    required: ['bun','patty'],
    optional: ['cheese','lettuce','tomato','onion'],
    ingredients: [
      { id:'bun',     label:'🍞 Burger Bun',    req:true  },
      { id:'patty',   label:'🥩 Beef Patty',    req:true  },
      { id:'cheese',  label:'🧀 Cheese Slice',  req:false },
      { id:'lettuce', label:'🥬 Lettuce',        req:false },
      { id:'tomato',  label:'🍅 Tomato',         req:false },
      { id:'onion',   label:'🧅 Onion',          req:false },
    ],
    Viz: BurgerSVG,
  },
  {
    id: 'icecream', name: 'Ice Cream', emoji: '🍦', cookWord: 'Freeze', cookEmoji: '❄️',
    required: ['cone','vanilla'],
    optional: ['chocolate','strawberry','mint','cookie','whip','choc','sprinkles','cherry'],
    ingredients: [
      { id:'cone',       label:'🍦 Waffle Cone',     req:true  },
      { id:'vanilla',    label:'🤍 Vanilla Scoop',   req:true  },
      { id:'chocolate',  label:'🍫 Chocolate Scoop', req:false },
      { id:'strawberry', label:'🩷 Strawberry Scoop',req:false },
      { id:'mint',       label:'💚 Mint Scoop',      req:false },
      { id:'cookie',     label:'🍪 Cookie & Cream',  req:false },
      { id:'whip',       label:'🌿 Whipped Cream',   req:false },
      { id:'choc',       label:'🍫 Choc Sauce',      req:false },
      { id:'sprinkles',  label:'🌈 Sprinkles',        req:false },
      { id:'cherry',     label:'🍒 Cherry on Top',   req:false },
    ],
    Viz: IceCreamSVG,
  },
  {
    id: 'cake', name: 'Birthday Cake', emoji: '🎂', cookWord: 'Bake', cookEmoji: '✨',
    required: ['layer1'],
    optional: ['layer2','layer3','candles','sprinkles','stars'],
    ingredients: [
      { id:'layer1',    label:'🎂 First Layer',     req:true  },
      { id:'layer2',    label:'🎂 Second Layer',    req:false },
      { id:'layer3',    label:'🎂 Third Layer',     req:false },
      { id:'candles',   label:'🕯️ Birthday Candles',req:false },
      { id:'sprinkles', label:'🌈 Sprinkles',        req:false },
      { id:'stars',     label:'⭐ Star Decorations', req:false },
    ],
    Viz: CakeSVG,
  },
  {
    id: 'taco', name: 'Taco', emoji: '🌮', cookWord: 'Serve', cookEmoji: '🎉',
    required: ['shell','meat'],
    optional: ['lettuce','tomato','cheese','sourcream','salsa','jalapeno'],
    ingredients: [
      { id:'shell',     label:'🌮 Taco Shell',     req:true  },
      { id:'meat',      label:'🥩 Seasoned Meat',  req:true  },
      { id:'lettuce',   label:'🥬 Lettuce',         req:false },
      { id:'tomato',    label:'🍅 Tomato',          req:false },
      { id:'cheese',    label:'🧀 Cheese',          req:false },
      { id:'sourcream', label:'🤍 Sour Cream',      req:false },
      { id:'salsa',     label:'🌶️ Salsa',           req:false },
      { id:'jalapeno',  label:'🫑 Jalapeños',       req:false },
    ],
    Viz: TacoSVG,
  },
];

/* ─────────────────────────────
   Main Component
───────────────────────────── */
export default function MakingYummyFood() {
  const [food,    setFood]    = useState(null);
  const [added,   setAdded]   = useState(new Set());
  const [cooking, setCooking] = useState(false);
  const [done,    setDone]    = useState(false);

  const toggle = (id) => {
    setAdded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const canServe = food && food.required.every(r => added.has(r));

  const serve = () => {
    setCooking(true);
    setTimeout(() => {
      setCooking(false);
      setDone(true);
      launchConfetti(window.innerWidth / 2, 200, 70);
    }, 2000);
  };

  const reset = () => {
    setFood(null); setAdded(new Set()); setCooking(false); setDone(false);
  };

  if (done && food) {
    const Viz = food.Viz;
    return (
      <div className="card card-orange">
        <h2>🍽️ Making Yummy Food!</h2>
        <div style={{ textAlign:'center' }}>
          <h3 style={{ fontSize:'1.8rem', color:'#e65100' }}>Your {food.name} is ready! {food.emoji}</h3>
          <div style={{ display:'flex', justifyContent:'center', margin:'16px 0' }}>
            <Viz added={added} />
          </div>
          <p style={{ fontSize:'2rem' }}>😋🤤👨‍🍳</p>
          <div className="btn-row" style={{ justifyContent:'center', marginTop:16 }}>
            <button className="btn btn-orange" onClick={reset}>Cook Again! 👨‍🍳</button>
          </div>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="card card-orange">
        <h2>🍽️ Making Yummy Food!</h2>
        <p className="food-instruction">What do you want to make today?</p>
        <div className="food-pick-grid">
          {FOODS.map(f => (
            <button key={f.id} className="food-pick-btn" onClick={() => setFood(f)}>
              <span className="food-pick-emoji">{f.emoji}</span>
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const Viz = food.Viz;

  return (
    <div className="card card-orange">
      <h2>🍽️ Making Yummy Food!</h2>

      <div className="food-layout">
        {/* Visual */}
        <div className="food-viz-area">
          <div className={cooking ? 'food-cooking' : ''}>
            <Viz added={added} />
          </div>
          {cooking && (
            <div className="cooking-overlay">
              <span style={{ fontSize:'3rem' }}>{food.cookEmoji}</span>
              <p>{food.cookWord}ing your {food.name}...</p>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="food-controls">
          <h3>Build your {food.name}! {food.emoji}</h3>
          <p className="food-instruction" style={{ marginBottom:12 }}>
            Add ingredients — <strong>required ones</strong> are marked ⭐
          </p>

          <div className="ingredient-list">
            {food.ingredients.map(ing => (
              <button
                key={ing.id}
                className={`ingredient-btn${added.has(ing.id) ? ' added' : ''}${ing.req ? ' required' : ''}`}
                onClick={() => toggle(ing.id)}
              >
                <span className="ing-check">{added.has(ing.id) ? '✅' : '⬜'}</span>
                {ing.label}
                {ing.req && <span className="ing-star">⭐</span>}
              </button>
            ))}
          </div>

          <div className="btn-row" style={{ marginTop:16 }}>
            <button className="btn btn-orange" onClick={reset}>◀ Pick Another</button>
            <button className="btn btn-green" onClick={serve}
              disabled={!canServe || cooking}
              style={{ opacity: canServe ? 1 : 0.45 }}>
              {cooking ? `${food.cookWord}ing...` : `${food.cookWord} it! ${food.cookEmoji}`}
            </button>
          </div>
          {!canServe && (
            <p style={{ fontSize:'.9rem', color:'#e65100', marginTop:8 }}>
              Add all ⭐ required ingredients first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
