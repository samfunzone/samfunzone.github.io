import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';

/* ─────────────────────────────
   Shared gradient / decoration helpers
   (SVG ids are page-global — only one food SVG is mounted at a time,
   and every id is prefixed `food-`)
───────────────────────────── */
const VGrad = ({ id, c, hi = 0.18, lo = 0.22 }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stopColor={lighten(c, hi)} />
    <stop offset="45%"  stopColor={c} />
    <stop offset="100%" stopColor={darken(c, lo)} />
  </linearGradient>
);

const Glossy = ({ id, c, hi = 0.55, lo = 0.35 }) => (
  <radialGradient id={id} cx="35%" cy="30%" r="75%">
    <stop offset="0%"   stopColor={lighten(c, hi)} />
    <stop offset="55%"  stopColor={c} />
    <stop offset="100%" stopColor={darken(c, lo)} />
  </radialGradient>
);

const Shadow = () => (
  <radialGradient id="food-shadow">
    <stop offset="0%"   stopColor="#000" stopOpacity=".22" />
    <stop offset="70%"  stopColor="#000" stopOpacity=".08" />
    <stop offset="100%" stopColor="#000" stopOpacity="0" />
  </radialGradient>
);

const STAR = 'M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z';
const Sparkles = ({ pts }) => (
  <g>
    {pts.map(([x, y], i) => (
      <g key={i} transform={`translate(${x},${y})`}>
        <path className="food-sparkle" d={STAR} fill="#ffd93d"
              style={{ animationDelay: `${i * 0.35}s` }} />
      </g>
    ))}
  </g>
);

// Rising steam wisps for hot foods on the done screen
const Steam = ({ xs, y }) => (
  <g>
    {xs.map((x, i) => (
      <path key={i} className="food-steam"
            d={`M${x},${y} q-6,-12 0,-22 q6,-10 0,-20`}
            stroke="rgba(255,255,255,.75)" strokeWidth="5" fill="none" strokeLinecap="round"
            style={{ animationDelay: `${i * 0.7}s` }} />
    ))}
  </g>
);

/* ─────────────────────────────
   Food SVG Components
───────────────────────────── */
function PizzaSVG({ added, done }) {
  const h = id => added.has(id);
  const tops = [[78,78],[116,72],[97,105],[68,108],[128,100],[108,128],[74,128]];
  return (
    <svg viewBox="0 0 200 200" width={210} height={210} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <radialGradient id="food-plate" cx="50%" cy="45%" r="60%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f7f7f7" />
          <stop offset="100%" stopColor="#e2e2e2" />
        </radialGradient>
        <radialGradient id="food-pizza-crust" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={lighten('#e8a84a', .2)} />
          <stop offset="75%"  stopColor="#e8a84a" />
          <stop offset="100%" stopColor={darken('#e8a84a', .25)} />
        </radialGradient>
        <radialGradient id="food-pizza-dough" cx="45%" cy="40%" r="65%">
          <stop offset="0%"   stopColor={lighten('#f2c07a', .25)} />
          <stop offset="70%"  stopColor="#f2c07a" />
          <stop offset="100%" stopColor={darken('#f2c07a', .12)} />
        </radialGradient>
        <radialGradient id="food-pizza-sauce" cx="45%" cy="40%" r="65%">
          <stop offset="0%"   stopColor={lighten('#d32f2f', .15)} />
          <stop offset="70%"  stopColor="#d32f2f" />
          <stop offset="100%" stopColor={darken('#d32f2f', .25)} />
        </radialGradient>
        <radialGradient id="food-pizza-cheese" cx="45%" cy="40%" r="65%">
          <stop offset="0%"   stopColor={lighten('#ffd54f', .35)} />
          <stop offset="65%"  stopColor="#ffd54f" />
          <stop offset="100%" stopColor={darken('#ffd54f', .15)} />
        </radialGradient>
        <Glossy id="food-pep"   c="#c62828" />
        <Glossy id="food-olive" c="#33691e" />
        <VGrad  id="food-mush-cap"  c="#8d6e63" />
        <VGrad  id="food-mush-stem" c="#d7ccc8" hi={0.15} lo={0.1} />
      </defs>

      <ellipse cx="100" cy="194" rx="88" ry="9" fill="url(#food-shadow)" />
      <circle cx="100" cy="100" r="95" fill="url(#food-plate)" stroke="#e6e6e6" strokeWidth="2" />

      {h('dough') && <g className="food-ing">
        <circle cx="100" cy="100" r="88" fill="url(#food-pizza-crust)" />
        <circle cx="100" cy="100" r="78" fill="url(#food-pizza-dough)" />
        {[0,40,80,120,160,200,240,280,320].map(a => {
          const rad = a*Math.PI/180;
          return <circle key={a} cx={100+83*Math.cos(rad)} cy={100+83*Math.sin(rad)}
            r="7" fill={darken('#d4883a', .08)} opacity=".7" />;
        })}
        {/* crust sheen */}
        <path d="M30,72 A75,75 0 0 1 96,18" stroke="rgba(255,255,255,.45)" strokeWidth="6"
              fill="none" strokeLinecap="round" />
      </g>}

      {h('sauce') && <g className="food-ing">
        <circle cx="100" cy="100" r="70" fill="url(#food-pizza-sauce)" opacity=".95" />
        <ellipse cx="84" cy="78" rx="26" ry="12" fill="rgba(255,255,255,.18)"
                 transform="rotate(-20 84 78)" />
      </g>}

      {h('cheese') && <g className="food-ing">
        <circle cx="100" cy="100" r="68" fill="url(#food-pizza-cheese)" opacity=".92" />
        {[[88,82],[112,90],[95,112],[108,76],[78,100]].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={16+i%2*5} ry={12+i%2*4}
            fill={lighten('#ffd54f', .3)} transform={`rotate(${i*28} ${cx} ${cy})`} opacity=".75" />
        ))}
      </g>}

      {h('pepperoni') && tops.map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <circle cx={cx} cy={cy} r="11" fill="url(#food-pep)" />
          <circle cx={cx} cy={cy} r="8.5" fill="none" stroke={darken('#b71c1c', .15)} strokeWidth="1" opacity=".5" />
          {[[3,2],[-3,-2],[1,-4]].map(([dx,dy],j) => (
            <circle key={j} cx={cx+dx} cy={cy+dy} r="2" fill={lighten('#c62828', .3)} opacity=".5" />
          ))}
          <ellipse cx={cx-3.5} cy={cy-4} rx="3.4" ry="2" fill="rgba(255,255,255,.45)" />
        </g>
      ))}

      {h('mushroom') && [[88,70],[120,90],[84,122],[112,126]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <g transform={`translate(${cx} ${cy})`}>
            <ellipse cx="0" cy="-5" rx="10" ry="7" fill="url(#food-mush-cap)" />
            <rect x="-3.5" y="-2" width="7" height="10" rx="2" fill="url(#food-mush-stem)" />
            <ellipse cx="-3" cy="-7.5" rx="4" ry="2.2" fill="rgba(255,255,255,.4)" />
          </g>
        </g>
      ))}

      {h('pepper') && [[74,96],[106,84],[94,116],[122,110]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={cy} rx="12" ry="5"
            fill={['#43a047','#ffee58','#e53935','#2196f3'][i]}
            stroke={darken(['#43a047','#ffee58','#e53935','#2196f3'][i], .25)} strokeWidth="1"
            transform={`rotate(${i*55} ${cx} ${cy})`} opacity=".95" />
        </g>
      ))}

      {h('olive') && [[90,92],[113,88],[100,120],[76,118]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <circle cx={cx} cy={cy} r="8" fill="url(#food-olive)" />
          <circle cx={cx} cy={cy} r="3.5" fill={darken('#33691e', .3)} />
          <ellipse cx={cx-2.6} cy={cy-3} rx="2.4" ry="1.4" fill="rgba(255,255,255,.5)" />
        </g>
      ))}

      {done && <Steam xs={[70,100,130]} y={58} />}
      {done && <Sparkles pts={[[14,40],[186,70],[20,150],[182,160]]} />}
    </svg>
  );
}

function BurgerSVG({ added, done }) {
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
      <defs>
        <Shadow />
        <VGrad id="food-bun"    c="#e8a44a" />
        <VGrad id="food-patty"  c="#6d3c1e" hi={0.22} lo={0.3} />
        <VGrad id="food-bcheese" c="#ffd740" hi={0.3} lo={0.18} />
        <Glossy id="food-btomato" c="#e53935" />
        <linearGradient id="food-onion" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten('#e1bee7', .3)} stopOpacity=".95" />
          <stop offset="100%" stopColor="#ce93d8" stopOpacity=".8" />
        </linearGradient>
        <VGrad id="food-lettuce" c="#66bb6a" hi={0.25} lo={0.2} />
      </defs>

      <ellipse cx="100" cy="234" rx="86" ry="10" fill="url(#food-shadow)" />

      {bunBotY !== null && <g className="food-ing">
        <rect x="28" y={bunBotY} width={144} height={22} rx={11} fill="url(#food-bun)" />
        <rect x="28" y={bunBotY} width={144} height={10} rx={8} fill={lighten('#f0c06a', .2)} opacity=".7" />
      </g>}

      {pattyY !== null && <g className="food-ing">
        <rect x="30" y={pattyY} width={140} height={24} rx={12} fill="url(#food-patty)" />
        <rect x="34" y={pattyY+2} width={132} height={10} rx={5} fill={lighten('#8b4e28', .12)} opacity=".7" />
        {[52,76,100,124,148].map((x,i) => (
          <line key={i} x1={x} y1={pattyY+2} x2={x-8} y2={pattyY+22}
            stroke={darken('#4a2812', .15)} strokeWidth="2" opacity=".45" />
        ))}
      </g>}

      {cheeseY !== null && <g className="food-ing">
        <rect x="20" y={cheeseY} width={160} height={14} rx={4} fill="url(#food-bcheese)" />
        <rect x="20" y={cheeseY} width={160} height={6} rx={4} fill={lighten('#ffe57f', .3)} opacity=".7" />
        {/* melty drips */}
        <path d={`M40,${cheeseY+13} q2,9 6,11 q4,-2 4,-9 Z`} fill="#fbc02d" />
        <path d={`M150,${cheeseY+13} q2,7 5,9 q4,-2 4,-8 Z`} fill="#fbc02d" />
      </g>}

      {lettuceY !== null && <g className="food-ing">
        <path d={`M24,${lettuceY+18} q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 L176,${lettuceY+18} Z`}
          fill="url(#food-lettuce)" />
      </g>}

      {tomatoY !== null && [48,82,116,152].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={tomatoY+8} rx={22} ry={9} fill="url(#food-btomato)" opacity=".95" />
          <line x1={cx} y1={tomatoY+1} x2={cx} y2={tomatoY+15}
            stroke="#ef9a9a" strokeWidth="1.5" opacity=".6" />
          <ellipse cx={cx-7} cy={tomatoY+5} rx="6" ry="2.5" fill="rgba(255,255,255,.4)" />
        </g>
      ))}

      {onionY !== null && [54,100,146].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={onionY+6} rx={22} ry={8} fill="url(#food-onion)"
            stroke="#ce93d8" strokeWidth="1" />
        </g>
      ))}

      {bunTopY !== null && <g className="food-ing">
        <path d={`M28,${bunTopY} Q28,${bunTopY-55} 100,${bunTopY-59} Q172,${bunTopY-55} 172,${bunTopY} Z`}
          fill="url(#food-bun)" />
        <path d={`M34,${bunTopY} Q34,${bunTopY-47} 100,${bunTopY-51} Q166,${bunTopY-47} 166,${bunTopY} Z`}
          fill={lighten('#f0b860', .12)} opacity=".55" />
        {[[82,16],[100,10],[118,15],[90,26],[110,24],[72,22],[128,20]].map(([bx,by],i) => (
          <ellipse key={i} cx={bx} cy={bunTopY-by} rx={7} ry={3.5}
            fill="#fff8e1" opacity=".9" transform={`rotate(${i*25-30} ${bx} ${bunTopY-by})`} />
        ))}
        <ellipse cx="100" cy={bunTopY-46} rx="32" ry="8" fill="rgba(255,255,255,0.3)" />
      </g>}

      {done && <Steam xs={[70,100,130]} y={52} />}
      {done && <Sparkles pts={[[16,70],[184,90],[22,180],[180,190]]} />}
    </svg>
  );
}

function IceCreamSVG({ added, done }) {
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
      <defs>
        <Shadow />
        <VGrad id="food-cone" c="#d4956a" />
        <VGrad id="food-cone-rim" c="#edc070" hi={0.25} lo={0.15} />
        <radialGradient id="food-whip" cx="40%" cy="30%" r="80%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f2f0f5" />
          <stop offset="100%" stopColor="#dfdce8" />
        </radialGradient>
        <Glossy id="food-cherry" c="#e53935" />
        {scoopDefs.map(s => <Glossy key={s.id} id={`food-scoop-${s.id}`} c={s.fill} hi={0.35} lo={0.18} />)}
      </defs>

      <ellipse cx={CX} cy="284" rx="60" ry="7" fill="url(#food-shadow)" />

      {/* Cone */}
      {h('cone') && <g className="food-ing">
        <clipPath id="food-cone-clip">
          <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`} />
        </clipPath>
        <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`} fill="url(#food-cone)" />
        {/* Waffle lines clipped to cone shape */}
        <g clipPath="url(#food-cone-clip)">
          {[-3,-2,-1,0,1,2,3].map(i => (
            <line key={`d${i}`} x1={CX+i*15-46} y1={CONE_Y} x2={CX} y2={CONE_Y+82}
              stroke="#a06030" strokeWidth="1.2" opacity=".55" />
          ))}
          {[0.18,0.38,0.58,0.78].map((t,i) => {
            const hw = 46*(1-t);
            return <line key={`h${i}`} x1={CX-hw} y1={CONE_Y+82*t} x2={CX+hw} y2={CONE_Y+82*t}
              stroke="#a06030" strokeWidth="1.2" opacity=".5" />;
          })}
          {/* cone sheen */}
          <path d={`M${CX-30},${CONE_Y+4} L${CX-8},${CONE_Y+70}`}
            stroke="rgba(255,255,255,.35)" strokeWidth="7" strokeLinecap="round" />
        </g>
        <path d={`M${CX-46},${CONE_Y} L${CX+46},${CONE_Y} L${CX},${CONE_Y+82} Z`}
          fill="none" stroke="#a06030" strokeWidth="1.5" />
        <ellipse cx={CX} cy={CONE_Y} rx="46" ry="12" fill="url(#food-cone-rim)" />
      </g>}

      {/* Scoops — keyed by flavor; cy transitions glide when a lower scoop toggles */}
      {scoops.map((s, i) => {
        const sy = CONE_Y - R * 0.4 - i * GAP;
        return (
          <g key={s.id} className="food-ing">
            <circle cx={CX} cy={sy} r={R} fill={`url(#food-scoop-${s.id})`}
              stroke={s.stroke} strokeWidth="1.2" strokeOpacity=".55"
              style={{ transition: 'cy 0.45s ease' }} />
            <ellipse cx={CX-13} cy={sy-14} rx="13" ry="9"
              fill="rgba(255,255,255,0.5)" transform={`rotate(-25 ${CX-13} ${sy-14})`}
              style={{ transition: 'cy 0.45s ease' }} />
          </g>
        );
      })}

      {/* Toppings — always anchored to top scoop */}
      {scoops.length > 0 && <>
        {h('whip') && <g className="food-ing">
          {[[-12,-3],[0,-16],[12,-3],[0,3]].map(([dx,dy],i) => (
            <ellipse key={i} cx={CX+dx} cy={topY-R+dy-5} rx="13" ry="10" fill="url(#food-whip)" />
          ))}
          <ellipse cx={CX-6} cy={topY-R-16} rx="6" ry="3.5" fill="rgba(255,255,255,.85)" />
        </g>}
        {h('choc') && <g className="food-ing">
          {[[-18,6],[6,15],[20,-3],[-4,-16],[16,-14]].map(([dx,dy],i) => (
            <path key={i} d={`M${CX+dx},${topY-R*0.5+dy} q${dx/3+5},${dy/2+10} ${dx/3+12},${dy/2+22}`}
              stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".85" />
          ))}
        </g>}
        {h('sprinkles') && [[-22,-4],[16,-12],[-12,14],[20,10],[-4,-22],[22,0],[-20,6],[8,20]].map(([dx,dy],i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
            <rect x={CX+dx-5} y={topY-R*0.45+dy} width="12" height="5" rx="2.5"
              fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800','#f06292','#26c6da'][i]}
              transform={`rotate(${i*45} ${CX+dx} ${topY-R*0.45+dy+2.5})`} />
          </g>
        ))}
        {h('cherry') && <g className="food-ing">
          <circle cx={CX} cy={topY-R-10} r="12" fill="url(#food-cherry)" />
          <ellipse cx={CX+4} cy={topY-R-15} rx="5" ry="3.5"
            fill="rgba(255,255,255,0.5)" transform={`rotate(-30 ${CX+4} ${topY-R-15})`} />
          <path d={`M${CX},${topY-R-22} q-14,-20 -8,-34`}
            stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>}
      </>}

      {done && <Sparkles pts={[[24,150],[176,120],[30,250],[170,240]]} />}
    </svg>
  );
}

function CakeSVG({ added, done }) {
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
  const candleColors = ['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8'];

  return (
    <svg viewBox="0 0 200 280" width={210} height={280} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <radialGradient id="food-frost" cx="40%" cy="30%" r="85%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f6f4f8" />
          <stop offset="100%" stopColor="#e4e0ec" />
        </radialGradient>
        {layerDefs.map(l => <VGrad key={l.id} id={`food-cake-${l.id}`} c={l.fill} />)}
        {candleColors.map((c, i) => <VGrad key={i} id={`food-candle-${i}`} c={c} hi={0.3} lo={0.15} />)}
      </defs>

      <ellipse cx="100" cy="260" rx="90" ry="12" fill="url(#food-shadow)" />

      {layers.map((layer, i) => {
        const ty = lty(i);
        return (
          <g key={layer.id} className="food-ing">
            <rect x={layer.x} y={ty} width={layer.rx*2} height={LAYER_H} rx={8} fill={`url(#food-cake-${layer.id})`} />
            <rect x={layer.x+4} y={ty+4} width={layer.rx*2-8} height={10} rx={5}
              fill={layer.hilite} opacity=".5" />
            {/* Frosting cap with shine */}
            <ellipse cx={100} cy={ty} rx={layer.rx} ry={ERY} fill="url(#food-frost)" opacity=".97" />
            <ellipse cx={88} cy={ty-3} rx={layer.rx*0.36} ry={4} fill="rgba(255,255,255,0.7)" />
            {/* Frosting drips */}
            {[...Array(5)].map((_,j) => {
              const dropX = layer.x + 14 + j * (layer.rx*2 - 28) / 4;
              const dropLen = 10 + [4,7,5,8,3][j];
              return (
                <path key={j} d={`M${dropX},${ty+ERY*0.7} q1,${dropLen} -1,${dropLen+6}`}
                  stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".9" />
              );
            })}
          </g>
        );
      })}

      {h('candles') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        const xs = n===3 ? [80,100,120] : n===2 ? [73,91,109,127] : [60,78,100,122,140];
        return xs.map((cx,i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <rect x={cx-5} y={ty-32} width={10} height={26} rx={4} fill={`url(#food-candle-${i%candleColors.length})`} />
            <line x1={cx} y1={ty-32} x2={cx} y2={ty-36} stroke="#5d4037" strokeWidth="1.5" />
            <g className="food-flame" style={{ animationDelay: `${i * 0.15}s` }}>
              <path d={`M${cx},${ty-36} q-5,-9 0,-19 q5,9 0,19`} fill="#ffee58" opacity=".9" />
              <path d={`M${cx},${ty-38} q-3,-6 0,-12 q3,6 0,12`} fill="#ff9800" />
            </g>
          </g>
        ));
      })()}

      {h('sprinkles') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        return [[-22,4],[14,-3],[24,9],[6,13],[-12,8],[-5,-7]].map(([dx,dy],i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
            <rect x={100+dx-5} y={ty+dy} width="12" height="5" rx="2.5"
              fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800'][i]}
              transform={`rotate(${i*35} ${100+dx} ${ty+dy+2.5})`} />
          </g>
        ));
      })()}

      {h('stars') && n > 0 && (() => {
        const ty = lty(n-1) - ERY;
        return [[-30,-2],[0,-10],[30,0]].map(([dx,dy],i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <text x={100+dx} y={ty+dy} fontSize="16" textAnchor="middle">⭐</text>
          </g>
        ));
      })()}

      {done && <Sparkles pts={[[20,80],[180,100],[24,200],[176,220]]} />}
    </svg>
  );
}

function TacoSVG({ added, done }) {
  const h = id => added.has(id);
  return (
    <svg viewBox="0 0 220 185" width={230} height={185} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <clipPath id="food-taco-clip">
          <path d="M22,164 Q110,40 198,164 Z" />
        </clipPath>
        <VGrad id="food-shell-out" c="#c8893a" />
        <VGrad id="food-shell-mid" c="#e8b050" hi={0.15} lo={0.12} />
        <VGrad id="food-shell-in"  c="#f5c860" hi={0.12} lo={0.08} />
        <VGrad id="food-meat" c="#8d4c2a" hi={0.15} lo={0.28} />
        <VGrad id="food-tcheese" c="#ffd740" hi={0.3} lo={0.15} />
        <Glossy id="food-ttomato" c="#e53935" />
        <Glossy id="food-salsa" c="#ff5722" />
        <VGrad id="food-jalapeno" c="#388e3c" hi={0.25} lo={0.2} />
        <VGrad id="food-tlettuce" c="#66bb6a" hi={0.25} lo={0.2} />
        <radialGradient id="food-whip2" cx="40%" cy="30%" r="85%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f5f3f0" />
          <stop offset="100%" stopColor="#e3ded6" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="176" rx="88" ry="9" fill="url(#food-shadow)" />

      {/* Shell — arch shape, three layers for depth */}
      {h('shell') && <g className="food-ing">
        <path d="M22,164 Q110,40 198,164 Z" fill="url(#food-shell-out)" />
        <path d="M32,164 Q110,54 188,164 Z" fill="url(#food-shell-mid)" />
        <path d="M42,164 Q110,66 178,164 Z" fill="url(#food-shell-in)" opacity=".8" />
        {/* toasted speckles */}
        {[[60,140],[90,112],[130,118],[160,142],[110,96]].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r="2.4" fill={darken('#c8893a', .25)} opacity=".4" />
        ))}
      </g>}

      {/* All filling clipped to arch interior */}
      <g clipPath="url(#food-taco-clip)">
        {h('meat') && <g className="food-ing">
          <path d="M22,164 Q110,108 198,164 Z" fill="url(#food-meat)" />
          {[[70,150],[100,138],[130,140],[160,152]].map(([mx,my],i) => (
            <circle key={i} cx={mx} cy={my} r="4" fill={darken('#8d4c2a', .2)} opacity=".6" />
          ))}
        </g>}
        {h('lettuce') && <g className="food-ing">
          <path d="M26,157 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q15,-18 28,0 q12,-14 18,0 L198,164 Q110,122 26,164 Z"
            fill="url(#food-tlettuce)" opacity=".95" />
        </g>}
        {h('tomato') && [58,92,130,166].map((cx,i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <circle cx={cx} cy={138} r="11" fill="url(#food-ttomato)" opacity=".95" />
            <line x1={cx} y1={128} x2={cx} y2={148} stroke="#ef9a9a" strokeWidth="1.5" opacity=".6" />
            <line x1={cx-9} y1={132} x2={cx+9} y2={144} stroke="#ef9a9a" strokeWidth="1.5" opacity=".6" />
          </g>
        ))}
        {/* Cheese — wavy closed ribbon, 6 waves × 28px = 168px (clipped at edges) */}
        {h('cheese') && <g className="food-ing">
          <path d="M28,124 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 q14,-9 28,0 L196,132 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 q-14,9 -28,0 Z"
            fill="url(#food-tcheese)" opacity=".94" />
        </g>}
        {/* Sour cream — wavy closed ribbon, 4 waves × 32px = 128px */}
        {h('sourcream') && <g className="food-ing">
          <path d="M52,109 q16,-11 32,0 q16,-11 32,0 q16,-11 32,0 q16,-11 32,0 L180,117 q-16,11 -32,0 q-16,11 -32,0 q-16,11 -32,0 q-16,11 -32,0 Z"
            fill="url(#food-whip2)" />
        </g>}
        {h('salsa') && [66,102,140,174].map((cx,i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <circle cx={cx} cy={97} r="8" fill="url(#food-salsa)" opacity=".92" />
          </g>
        ))}
        {h('jalapeno') && [80,118,156].map((cx,i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <ellipse cx={cx} cy={86} rx="13" ry="6" fill="url(#food-jalapeno)"
              transform={`rotate(${i*20-20} ${cx} 86)`} />
            <ellipse cx={cx} cy={86} rx="8" ry="2.5" fill={lighten('#388e3c', .4)} opacity=".6"
              transform={`rotate(${i*20-20} ${cx} 86)`} />
          </g>
        ))}
      </g>

      {/* Shell outer edge on top */}
      {h('shell') && (
        <path d="M22,164 Q110,40 198,164" fill="none" stroke="#a06820" strokeWidth="3" />
      )}

      {done && <Steam xs={[88,110,132]} y={58} />}
      {done && <Sparkles pts={[[18,70],[202,90],[30,160]]} />}
    </svg>
  );
}

function SandwichSVG({ added, done }) {
  const h = id => added.has(id);

  let curY = 232;
  const nextY = height => { curY -= height; return curY; };

  const breadBotY  = h('bread')    ? nextY(20) : null;
  const hamY       = h('ham')      ? nextY(16) : null;
  const cheeseY    = h('cheese')   ? nextY(10) : null;
  const lettuceY   = h('lettuce')  ? nextY(14) : null;
  const tomatoY    = h('tomato')   ? nextY(12) : null;
  const cucumberY  = h('cucumber') ? nextY(10) : null;
  const mayoY      = h('mayo')     ? nextY(8)  : null;
  const breadTopY  = h('bread')    ? curY      : null;

  return (
    <svg viewBox="0 0 200 240" width={200} height={240} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <VGrad id="food-crust" c="#e0a35c" hi={0.15} lo={0.2} />
        <VGrad id="food-crumb" c="#f6e2b3" hi={0.2} lo={0.08} />
        <Glossy id="food-ham" c="#ef8da0" hi={0.35} lo={0.18} />
        <VGrad id="food-scheese" c="#ffca28" hi={0.3} lo={0.15} />
        <VGrad id="food-slettuce" c="#7cb342" hi={0.3} lo={0.2} />
        <Glossy id="food-stomato" c="#e53935" />
        <VGrad id="food-cucumber" c="#d8eebc" hi={0.15} lo={0.08} />
        <radialGradient id="food-mayo" cx="40%" cy="30%" r="85%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f8f5ec" />
          <stop offset="100%" stopColor="#eae3d2" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="232" rx="84" ry="9" fill="url(#food-shadow)" />

      {breadBotY !== null && <g className="food-ing">
        <rect x="32" y={breadBotY} width={136} height={20} rx={6} fill="url(#food-crust)" />
        <rect x="37" y={breadBotY+3} width={126} height={14} rx={4} fill="url(#food-crumb)" />
      </g>}

      {hamY !== null && [62,100,138].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={hamY+8} rx={34} ry={8.5} fill="url(#food-ham)"
            stroke={darken('#ef8da0', .15)} strokeWidth="1" opacity=".95"
            transform={`rotate(${(i-1)*4} ${cx} ${hamY+8})`} />
        </g>
      ))}

      {cheeseY !== null && <g className="food-ing">
        <rect x="30" y={cheeseY} width={140} height={10} rx={3} fill="url(#food-scheese)" />
        {/* hanging corners */}
        <path d={`M58,${cheeseY+9} L70,${cheeseY+22} L82,${cheeseY+9} Z`} fill={darken('#ffca28', .06)} />
        <path d={`M120,${cheeseY+9} L132,${cheeseY+20} L144,${cheeseY+9} Z`} fill={darken('#ffca28', .06)} />
      </g>}

      {lettuceY !== null && <g className="food-ing">
        <path d={`M28,${lettuceY+14} q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 L172,${lettuceY+14} Z`}
          fill="url(#food-slettuce)" />
      </g>}

      {tomatoY !== null && [62,100,138].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={tomatoY+6} rx={26} ry={7} fill="url(#food-stomato)" opacity=".95" />
          <line x1={cx} y1={tomatoY+1} x2={cx} y2={tomatoY+11} stroke="#ef9a9a" strokeWidth="1.5" opacity=".6" />
          <ellipse cx={cx-8} cy={tomatoY+4} rx={6} ry={2} fill="rgba(255,255,255,.4)" />
        </g>
      ))}

      {cucumberY !== null && [56,88,120,150].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={cucumberY+5} rx={13} ry={6} fill="url(#food-cucumber)"
            stroke="#7cb342" strokeWidth="2" />
          <ellipse cx={cx} cy={cucumberY+5} rx={7} ry={3} fill="none"
            stroke="#aed581" strokeWidth="1" opacity=".8" />
        </g>
      ))}

      {mayoY !== null && <g className="food-ing">
        <path d={`M44,${mayoY+2} q14,-8 28,0 q14,-8 28,0 q14,-8 28,0 q14,-8 28,0 L156,${mayoY+8} q-14,8 -28,0 q-14,8 -28,0 q-14,8 -28,0 q-14,8 -28,0 Z`}
          fill="url(#food-mayo)" opacity=".95" />
      </g>}

      {breadTopY !== null && <g className="food-ing">
        <path d={`M34,${breadTopY} Q34,${breadTopY-22} 100,${breadTopY-24} Q166,${breadTopY-22} 166,${breadTopY} Z`}
          fill="url(#food-crust)" />
        <path d={`M40,${breadTopY} Q40,${breadTopY-16} 100,${breadTopY-18} Q160,${breadTopY-16} 160,${breadTopY} Z`}
          fill="url(#food-crumb)" opacity=".9" />
        <ellipse cx="86" cy={breadTopY-14} rx="26" ry="5" fill="rgba(255,255,255,.45)" />
      </g>}

      {done && <Sparkles pts={[[20,120],[180,100],[24,210],[176,200]]} />}
    </svg>
  );
}

function FriesSVG({ added, done }) {
  const h = id => added.has(id);

  // Deterministic fry fan — never Math.random() in render
  const fries = [...Array(9)].map((_, i) => ({
    x: 60 + i * 9,
    top: 34 + ((i * 23) % 20),
    rot: ((i * 37) % 15) - 7,
  }));

  return (
    <svg viewBox="0 0 200 230" width={210} height={230} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <VGrad id="food-fry" c="#f5c842" hi={0.25} lo={0.18} />
        <VGrad id="food-carton" c="#e53935" hi={0.12} lo={0.22} />
        <Glossy id="food-ketchup" c="#d32f2f" hi={0.4} lo={0.25} />
        <linearGradient id="food-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e4e0da" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="222" rx="86" ry="8" fill="url(#food-shadow)" />

      {/* Carton back panel */}
      {h('carton') && <g className="food-ing">
        <path d="M56,108 L144,108 L140,150 L60,150 Z" fill={darken('#e53935', .35)} />
      </g>}

      {/* Fries — render between carton back and front so bottoms sit inside */}
      {h('fries') && fries.map((f, i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
          <g transform={`rotate(${f.rot} ${f.x + 5.5} 148)`}>
            <rect x={f.x} y={f.top} width="11" height={150 - f.top} rx="4"
              fill="url(#food-fry)" stroke={darken('#f5c842', .25)} strokeWidth="1" />
            <rect x={f.x + 2} y={f.top + 3} width="3" height={Math.max(20, 130 - f.top)} rx="1.5"
              fill="rgba(255,255,255,.45)" />
          </g>
        </g>
      ))}

      {/* Salt specks over the fry tops */}
      {h('salt') && h('fries') && [[66,48],[82,40],[98,56],[112,42],[126,52],[90,68],[108,72],[74,62]].map(([sx,sy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 40}ms` }}>
          <circle cx={sx} cy={sy} r="1.8" fill="#ffffff" opacity=".95" />
        </g>
      ))}

      {/* Cheese drizzle ribbons */}
      {h('cheese') && h('fries') && <g className="food-ing">
        <path d="M60,72 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 18,0"
          stroke="#ffa726" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".9" />
        <path d="M66,92 q10,-7 20,0 q10,7 20,0 q10,-7 20,0"
          stroke="#ffb74d" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".85" />
      </g>}

      {/* Herb flecks */}
      {h('herbs') && h('fries') && [[72,56],[94,46],[116,60],[84,80],[122,84],[104,96]].map(([hx,hy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 40}ms` }}>
          <rect x={hx} y={hy} width="6" height="2.6" rx="1.3" fill="#66bb6a"
            transform={`rotate(${i * 55} ${hx + 3} ${hy + 1.3})`} />
        </g>
      ))}

      {/* Carton front panel (covers fry bottoms) */}
      {h('carton') && <g className="food-ing">
        <path d="M52,120 L148,120 L139,212 Q138,219 130,219 L70,219 Q62,219 61,212 Z"
          fill="url(#food-carton)" />
        {/* sheen streak + top edge highlight */}
        <path d="M68,128 Q72,170 78,208" stroke="rgba(255,255,255,.35)" strokeWidth="7"
          fill="none" strokeLinecap="round" />
        <line x1="54" y1="122" x2="146" y2="122" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
        {/* friendly smile arc */}
        <path d="M78,160 Q100,178 122,160" stroke="rgba(255,255,255,.9)" strokeWidth="5"
          fill="none" strokeLinecap="round" />
      </g>}

      {/* Ketchup dip cup */}
      {h('ketchup') && <g className="food-ing">
        <path d="M152,188 L196,188 L191,212 Q190,218 184,218 L164,218 Q158,218 157,212 Z"
          fill="url(#food-cup)" stroke="#d5d0c8" strokeWidth="1.5" />
        <ellipse cx="174" cy="190" rx="19" ry="6" fill="url(#food-ketchup)" />
        <ellipse cx="168" cy="188.5" rx="6" ry="2" fill="rgba(255,255,255,.5)" />
      </g>}

      {done && <Steam xs={[80,100,120]} y={50} />}
      {done && <Sparkles pts={[[20,60],[180,50],[30,170]]} />}
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
    id: 'sandwich', name: 'Sandwich', emoji: '🥪', cookWord: 'Stack', cookEmoji: '🥪',
    required: ['bread','ham'],
    optional: ['cheese','lettuce','tomato','cucumber','mayo'],
    ingredients: [
      { id:'bread',    label:'🍞 Bread Slices',  req:true  },
      { id:'ham',      label:'🍖 Ham',           req:true  },
      { id:'cheese',   label:'🧀 Cheese Slice',  req:false },
      { id:'lettuce',  label:'🥬 Lettuce',        req:false },
      { id:'tomato',   label:'🍅 Tomato',         req:false },
      { id:'cucumber', label:'🥒 Cucumber',       req:false },
      { id:'mayo',     label:'🤍 Mayo',           req:false },
    ],
    Viz: SandwichSVG,
  },
  {
    id: 'fries', name: 'French Fries', emoji: '🍟', cookWord: 'Fry', cookEmoji: '🍟',
    required: ['carton','fries'],
    optional: ['salt','ketchup','cheese','herbs'],
    ingredients: [
      { id:'carton',  label:'🟥 Fry Carton',     req:true  },
      { id:'fries',   label:'🍟 Crispy Fries',   req:true  },
      { id:'salt',    label:'🧂 Sea Salt',        req:false },
      { id:'ketchup', label:'🍅 Ketchup Dip',     req:false },
      { id:'cheese',  label:'🧀 Cheese Drizzle',  req:false },
      { id:'herbs',   label:'🌿 Herb Sprinkle',   req:false },
    ],
    Viz: FriesSVG,
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
        <div className="food-done-panel food-panel-in">
          <h3 style={{ fontSize:'1.8rem', color:'#e65100' }}>Your {food.name} is ready! {food.emoji}</h3>
          <div style={{ display:'flex', justifyContent:'center', margin:'16px 0' }}>
            <Viz added={added} done />
          </div>
          <div className="food-done-card">
            <p className="food-done-name">Chef Samritha&apos;s {food.name} {food.emoji}</p>
            <p style={{ fontSize:'1.8rem', margin:'6px 0 0' }}>😋🤤👨‍🍳</p>
          </div>
          <span className="food-float" style={{ left:'12%', animationDelay:'0s'   }}>{food.emoji}</span>
          <span className="food-float" style={{ left:'48%', animationDelay:'1.2s' }}>✨</span>
          <span className="food-float" style={{ left:'82%', animationDelay:'2.4s' }}>{food.emoji}</span>
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
        <div className="food-pick-grid food-panel-in">
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

      <div className="food-layout food-panel-in" key={food.id}>
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
            <button className={`btn btn-green${canServe && !cooking ? ' food-serve-ready' : ''}`} onClick={serve}
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
