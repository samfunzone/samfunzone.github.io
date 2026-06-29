import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';
import { track } from '../utils/analytics';

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

// Horizontal sheen bar swept across a food on the done screen (clip per food)
const SheenGrad = () => (
  <linearGradient id="food-sheen-grad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stopColor="#fff" stopOpacity="0" />
    <stop offset="50%"  stopColor="#fff" stopOpacity=".5" />
    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
  </linearGradient>
);

const STAR = 'M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z';
const Sparkles = ({ pts }) => (
  <g>
    {pts.map(([x, y], i) => (
      <g key={i} transform={`translate(${x},${y}) scale(${1 + (i % 3) * 0.25})`}>
        <path className="food-sparkle" d={STAR} fill={i % 2 ? '#ffd93d' : '#fff176'}
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
  const pepColors = ['#43a047','#ffee58','#e53935','#ff9800'];
  return (
    <svg viewBox="0 0 200 200" width={210} height={210} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <SheenGrad />
        <clipPath id="food-pizza-clip"><circle cx="100" cy="100" r="88" /></clipPath>
        <radialGradient id="food-plate" cx="50%" cy="45%" r="60%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f7f7f7" />
          <stop offset="100%" stopColor="#e0e0e4" />
        </radialGradient>
        <radialGradient id="food-pizza-crust" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={lighten('#e8a84a', .2)} />
          <stop offset="72%"  stopColor="#e8a84a" />
          <stop offset="94%"  stopColor={darken('#e8a84a', .18)} />
          <stop offset="100%" stopColor={darken('#e8a84a', .3)} />
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
      <circle cx="100" cy="100" r="86" fill="none" stroke="#ebebef" strokeWidth="2.5" />

      {h('dough') && <g className="food-ing">
        <circle cx="100" cy="100" r="88" fill="url(#food-pizza-crust)" />
        <circle cx="100" cy="100" r="78" fill="url(#food-pizza-dough)" />
        {/* inner shadow where crust meets dough */}
        <circle cx="100" cy="100" r="78" fill="none" stroke={darken('#d4883a', .2)} strokeWidth="2.5" opacity=".35" />
        {/* toasted blisters along the crust */}
        {[0,40,80,120,160,200,240,280,320].map(a => {
          const rad = a*Math.PI/180;
          return <circle key={a} cx={100+83*Math.cos(rad)} cy={100+83*Math.sin(rad)}
            r="7" fill={darken('#d4883a', .08)} opacity=".7" />;
        })}
        {[20,100,180,260,340].map(a => {
          const rad = a*Math.PI/180;
          return <circle key={a} cx={100+83*Math.cos(rad)} cy={100+83*Math.sin(rad)}
            r="3" fill={lighten('#e8a84a', .3)} opacity=".7" />;
        })}
        {/* flour dust on the dough */}
        {[[78,62],[124,80],[92,132],[64,98]].map(([fx,fy],i) => (
          <ellipse key={i} cx={fx} cy={fy} rx="5" ry="2.5" fill="#fff" opacity=".18"
            transform={`rotate(${i*40} ${fx} ${fy})`} />
        ))}
        {/* crust sheen */}
        <path d="M30,72 A75,75 0 0 1 96,18" stroke="rgba(255,255,255,.45)" strokeWidth="6"
              fill="none" strokeLinecap="round" />
      </g>}

      {h('sauce') && <g className="food-ing">
        <circle cx="100" cy="100" r="70" fill="url(#food-pizza-sauce)" opacity=".95" />
        {/* chunky wavy edge */}
        {[...Array(10)].map((_, i) => {
          const a = i/10*Math.PI*2;
          const bx = 100+68*Math.cos(a), by = 100+68*Math.sin(a);
          return <ellipse key={i} cx={bx} cy={by} rx="8.5" ry="4.5" fill="#c92c2c" opacity=".95"
            transform={`rotate(${a*180/Math.PI+90} ${bx} ${by})`} />;
        })}
        {/* tomato chunks */}
        {[[82,90],[112,104],[92,118],[118,82],[74,108]].map(([tx,ty],i) => (
          <rect key={i} x={tx} y={ty} width="9" height="6" rx="3" fill={darken('#d32f2f', .14)}
            opacity=".75" transform={`rotate(${i*38} ${tx+4.5} ${ty+3})`} />
        ))}
        <ellipse cx="84" cy="78" rx="26" ry="12" fill="rgba(255,255,255,.18)"
                 transform="rotate(-20 84 78)" />
      </g>}

      {h('cheese') && <g className="food-ing">
        {/* melted bumpy edge */}
        {[...Array(12)].map((_, i) => {
          const a = i/12*Math.PI*2;
          const bx = 100+63*Math.cos(a), by = 100+63*Math.sin(a);
          return <ellipse key={i} cx={bx} cy={by} rx="11" ry="6.5" fill="#fdd05a"
            transform={`rotate(${a*180/Math.PI+90} ${bx} ${by})`} />;
        })}
        <circle cx="100" cy="100" r="63" fill="url(#food-pizza-cheese)" opacity=".96" />
        {[[88,82],[112,90],[95,112],[108,76],[78,100]].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={16+i%2*5} ry={12+i%2*4}
            fill={lighten('#ffd54f', .3)} transform={`rotate(${i*28} ${cx} ${cy})`} opacity=".75" />
        ))}
        {/* browned bubble spots */}
        {[[84,68],[122,98],[70,116],[104,128],[126,72]].map(([bx,by],i) => (
          <g key={i}>
            <circle cx={bx} cy={by} r={4 + i%2} fill="#dd9a3c" opacity=".5" />
            <circle cx={bx} cy={by} r={1.8} fill="#c9842c" opacity=".55" />
          </g>
        ))}
        {/* grease glints */}
        {[[94,90],[112,112],[80,84]].map(([gx,gy],i) => (
          <ellipse key={i} cx={gx} cy={gy} rx="6" ry="2.6" fill="#fff" opacity=".3"
            transform={`rotate(${i*52-30} ${gx} ${gy})`} />
        ))}
      </g>}

      {h('pepperoni') && tops.map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          {/* cupped crisp rim */}
          <circle cx={cx} cy={cy} r="11.5" fill={darken('#c62828', .28)} />
          <circle cx={cx} cy={cy} r="9.5" fill="url(#food-pep)" />
          <path d={`M${cx-7},${cy+5.5} a9,9 0 0 0 14,0`} stroke={darken('#b71c1c', .3)}
            strokeWidth="1.6" fill="none" opacity=".55" />
          {[[3,2],[-3,-2],[1,-4]].map(([dx,dy],j) => (
            <circle key={j} cx={cx+dx} cy={cy+dy} r="1.8" fill={lighten('#c62828', .35)} opacity=".6" />
          ))}
          <ellipse cx={cx-3.5} cy={cy-4} rx="3.4" ry="2" fill="rgba(255,255,255,.5)" />
        </g>
      ))}

      {h('mushroom') && [[88,70],[120,90],[84,122],[112,126]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <g transform={`translate(${cx} ${cy}) rotate(${(i*55)%40-20})`}>
            <rect x="-3.5" y="-3" width="7" height="11" rx="2.5" fill="url(#food-mush-stem)" />
            <path d="M-11,-2 Q-11,-13 0,-13 Q11,-13 11,-2 Q5,1 0,1 Q-5,1 -11,-2 Z" fill="url(#food-mush-cap)" />
            {[-5,0,5].map(gx => (
              <line key={gx} x1={gx} y1="-1.5" x2={gx*0.4} y2="-6" stroke={darken('#8d6e63', .25)}
                strokeWidth="1" opacity=".5" />
            ))}
            <ellipse cx="-3.5" cy="-9" rx="4" ry="2" fill="rgba(255,255,255,.45)" />
          </g>
        </g>
      ))}

      {h('pepper') && [[74,96],[106,84],[94,116],[122,110]].map(([cx,cy],i) => {
        const c = pepColors[i];
        return (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <g transform={`rotate(${i*50-30} ${cx} ${cy})`}>
              <path d={`M${cx-12},${cy} a12,10 0 0 1 24,0`} stroke={darken(c, .15)}
                strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d={`M${cx-12},${cy} a12,10 0 0 1 24,0`} stroke={lighten(c, .3)}
                strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </g>
          </g>
        );
      })}

      {h('olive') && [[90,92],[113,88],[100,120],[76,118]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <circle cx={cx} cy={cy} r="9.2" fill="none" stroke={darken('#33691e', .3)} strokeWidth="1.2" opacity=".55" />
          <circle cx={cx} cy={cy} r="7" fill="none" stroke="url(#food-olive)" strokeWidth="4.6" />
          <circle cx={cx} cy={cy} r="4.6" fill="none" stroke={darken('#33691e', .25)} strokeWidth="1" opacity=".5" />
          <path d={`M${cx-6},${cy-3.5} a7,7 0 0 1 4,-3.5`} stroke="rgba(255,255,255,.55)"
            strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* glossy sheen sweeping over the finished pizza */}
      {done && h('dough') && (
        <g clipPath="url(#food-pizza-clip)">
          <g transform="rotate(-18 100 100)">
            <rect className="food-sheen" x="-70" y="-30" width="64" height="260" fill="url(#food-sheen-grad)" />
          </g>
        </g>
      )}

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
        {/* toasted inner face */}
        <line x1="34" y1={bunBotY+1.5} x2="166" y2={bunBotY+1.5} stroke={darken('#e8a44a', .22)}
          strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      </g>}

      {pattyY !== null && <g className="food-ing">
        <ellipse cx="100" cy={pattyY+25} rx="68" ry="4" fill="#000" opacity=".09" />
        <rect x="30" y={pattyY} width={140} height={24} rx={12} fill="url(#food-patty)" />
        <rect x="34" y={pattyY+2} width={132} height={10} rx={5} fill={lighten('#8b4e28', .12)} opacity=".7" />
        {/* char grill marks, two directions */}
        {[52,76,100,124,148].map((x,i) => (
          <line key={i} x1={x} y1={pattyY+2} x2={x-8} y2={pattyY+22}
            stroke={darken('#4a2812', .15)} strokeWidth="2" opacity=".45" />
        ))}
        {[64,112].map((x,i) => (
          <line key={i} x1={x} y1={pattyY+3} x2={x+10} y2={pattyY+21}
            stroke={darken('#4a2812', .2)} strokeWidth="1.5" opacity=".3" />
        ))}
        {/* juicy glints */}
        <ellipse cx="62" cy={pattyY+7} rx="7" ry="2.4" fill="#fff" opacity=".22" />
        <ellipse cx="128" cy={pattyY+9} rx="5" ry="2" fill="#fff" opacity=".18" />
      </g>}

      {cheeseY !== null && <g className="food-ing">
        <rect x="20" y={cheeseY} width={160} height={14} rx={4} fill="url(#food-bcheese)" />
        <rect x="20" y={cheeseY} width={160} height={6} rx={4} fill={lighten('#ffe57f', .3)} opacity=".7" />
        {/* melty drips grow downward after the slice lands */}
        <path className="food-drip" style={{ animationDelay: '.35s' }}
          d={`M40,${cheeseY+13} q2,9 6,11 q4,-2 4,-9 Z`} fill="#fbc02d" />
        <path className="food-drip" style={{ animationDelay: '.5s' }}
          d={`M96,${cheeseY+13} q2,11 6,14 q4,-2 4,-11 Z`} fill="#fbc02d" />
        <path className="food-drip" style={{ animationDelay: '.65s' }}
          d={`M150,${cheeseY+13} q2,7 5,9 q4,-2 4,-8 Z`} fill="#fbc02d" />
      </g>}

      {lettuceY !== null && <g className="food-ing">
        <path d={`M24,${lettuceY+21} q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 L176,${lettuceY+21} Z`}
          fill={darken('#66bb6a', .18)} opacity=".9" />
        <path d={`M24,${lettuceY+18} q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 q14,-18 28,0 L176,${lettuceY+18} Z`}
          fill="url(#food-lettuce)" />
      </g>}

      {tomatoY !== null && [48,82,116,152].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={tomatoY+8} rx={22} ry={9} fill="url(#food-btomato)" opacity=".95" />
          <ellipse cx={cx} cy={tomatoY+8} rx={15} ry={5.6} fill="none" stroke="#ef9a9a"
            strokeWidth="1.4" opacity=".55" />
          {[[-8,-1],[0,3],[8,-1]].map(([dx,dy],j) => (
            <ellipse key={j} cx={cx+dx} cy={tomatoY+8+dy} rx="2.4" ry="1.2" fill="#ffcdd2" opacity=".8"
              transform={`rotate(${j*50-50} ${cx+dx} ${tomatoY+8+dy})`} />
          ))}
          <ellipse cx={cx-7} cy={tomatoY+5} rx="6" ry="2.5" fill="rgba(255,255,255,.4)" />
        </g>
      ))}

      {onionY !== null && [54,100,146].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={onionY+6} rx={22} ry={8} fill="url(#food-onion)"
            stroke="#ce93d8" strokeWidth="1" />
          <ellipse cx={cx} cy={onionY+6} rx={15} ry={5.2} fill="none" stroke="#b687cc"
            strokeWidth="1.4" opacity=".7" />
          <ellipse cx={cx} cy={onionY+6} rx={8} ry={2.8} fill="none" stroke="#b687cc"
            strokeWidth="1.2" opacity=".6" />
        </g>
      ))}

      {bunTopY !== null && <g className="food-ing">
        <ellipse cx="100" cy={bunTopY+2} rx="68" ry="4.5" fill="#000" opacity=".08" />
        <path d={`M28,${bunTopY} Q28,${bunTopY-55} 100,${bunTopY-59} Q172,${bunTopY-55} 172,${bunTopY} Z`}
          fill="url(#food-bun)" />
        <path d={`M34,${bunTopY} Q34,${bunTopY-47} 100,${bunTopY-51} Q166,${bunTopY-47} 166,${bunTopY} Z`}
          fill={lighten('#f0b860', .12)} opacity=".55" />
        {[[82,16],[100,10],[118,15],[90,26],[110,24],[72,22],[128,20]].map(([bx,by],i) => (
          <g key={i}>
            <ellipse cx={bx} cy={bunTopY-by} rx={7} ry={3.5}
              fill="#fff8e1" opacity=".9" transform={`rotate(${i*25-30} ${bx} ${bunTopY-by})`} />
            <ellipse cx={bx-1.5} cy={bunTopY-by-1} rx={2.4} ry={1}
              fill="#fffdf4" transform={`rotate(${i*25-30} ${bx} ${bunTopY-by})`} />
          </g>
        ))}
        <ellipse cx="100" cy={bunTopY-46} rx="32" ry="8" fill="rgba(255,255,255,0.3)" />
      </g>}

      {/* celebration toothpick with a cherry tomato, served on the done screen */}
      {done && bunTopY !== null && <g className="food-ing" style={{ animationDelay: '.4s' }}>
        <line x1="100" y1={bunTopY-58} x2="100" y2={bunTopY-84} stroke="#8d6e63" strokeWidth="2.5"
          strokeLinecap="round" />
        <g className="food-wiggle">
          <circle cx="100" cy={bunTopY-89} r="7" fill="url(#food-btomato)" />
          <ellipse cx="97.5" cy={bunTopY-91.5} rx="2.6" ry="1.6" fill="rgba(255,255,255,.55)" />
        </g>
      </g>}

      {done && <Steam xs={[70,100,130]} y={52} />}
      {done && <Sparkles pts={[[16,70],[184,90],[22,180],[180,190]]} />}
    </svg>
  );
}

// Per-flavor surface texture, clipped to the scoop circle
function ScoopTexture({ id, cx, cy }) {
  switch (id) {
    case 'vanilla':
      return <>{[[-14,4],[6,-10],[-2,14],[12,8],[-20,-6],[16,-16],[2,-24],[-8,-2],[22,2]].map(([dx,dy],i) => (
        <circle key={i} cx={cx+dx} cy={cy+dy} r="1.1" fill="#6d4c41" opacity=".5" />
      ))}</>;
    case 'chocolate':
      return <>
        <path d={`M${cx-28},${cy-6} q10,-10 22,-2 q12,8 26,-2`} stroke="#4e342e" strokeWidth="3.5"
          fill="none" opacity=".5" strokeLinecap="round" />
        <path d={`M${cx-24},${cy+12} q10,-8 20,0 q10,8 24,0`} stroke="#3e2723" strokeWidth="3"
          fill="none" opacity=".45" strokeLinecap="round" />
      </>;
    case 'strawberry':
      return <>
        {[[-16,2],[8,-12],[-4,12],[14,10],[-22,-10],[18,-4],[0,-22]].map(([dx,dy],i) => (
          <ellipse key={i} cx={cx+dx} cy={cy+dy} rx="1.6" ry="2.4" fill="#fce4ec" opacity=".85"
            transform={`rotate(${i*40} ${cx+dx} ${cy+dy})`} />
        ))}
        <path d={`M${cx-20},${cy+4} q12,-9 24,-1`} stroke="#ec6f9c" strokeWidth="3"
          fill="none" opacity=".5" strokeLinecap="round" />
      </>;
    case 'mint':
      return <>{[[-14,-4],[8,-14],[-4,10],[14,6],[-22,8],[18,-8],[2,-24],[24,12]].map(([dx,dy],i) => (
        <rect key={i} x={cx+dx} y={cy+dy} width="4.5" height="3.5" rx="1" fill="#3e2723" opacity=".8"
          transform={`rotate(${i*47} ${cx+dx+2} ${cy+dy+1.5})`} />
      ))}</>;
    case 'cookie':
      return <>
        {[[-16,-2],[6,-14],[-6,12],[14,4],[-24,10]].map(([dx,dy],i) => (
          <rect key={i} x={cx+dx} y={cy+dy} width="7" height="5.5" rx="2" fill="#4e342e" opacity=".85"
            transform={`rotate(${i*52} ${cx+dx+3.5} ${cy+dy+2.7})`} />
        ))}
        {[[18,-10],[-2,-24],[22,14]].map(([dx,dy],i) => (
          <rect key={i} x={cx+dx} y={cy+dy} width="4" height="3" rx="1.2" fill="#3e2723" opacity=".7" />
        ))}
      </>;
    default:
      return null;
  }
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
        <Glossy id="food-cherry" c="#d8242f" hi={0.5} lo={0.4} />
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
          {[-3,-2,-1,0,1,2,3].map(i => (
            <line key={`e${i}`} x1={CX+i*15+46} y1={CONE_Y} x2={CX} y2={CONE_Y+82}
              stroke="#a06030" strokeWidth="1.2" opacity=".4" />
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
        <ellipse cx={CX-14} cy={CONE_Y-3} rx="14" ry="3.5" fill="rgba(255,255,255,.4)" />
      </g>}

      {/* Melt drips running down the cone once served */}
      {done && h('cone') && scoops.length > 0 && <>
        <path className="food-drip" style={{ animationDelay: '.5s' }}
          d={`M${CX-16},${CONE_Y+4} q1.5,14 -1.5,20`} stroke={darken(scoops[0].fill, .06)}
          strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="food-drip" style={{ animationDelay: '.75s' }}
          d={`M${CX+10},${CONE_Y+2} q1.5,18 -1.5,25`} stroke={darken(scoops[0].fill, .06)}
          strokeWidth="6" strokeLinecap="round" fill="none" />
      </>}

      {/* Scoops — keyed by flavor; cy transitions glide when a lower scoop toggles */}
      {scoops.map((s, i) => {
        const sy = CONE_Y - R * 0.4 - i * GAP;
        return (
          <g key={s.id} className="food-ing">
            <clipPath id={`food-sclip-${s.id}`}><circle cx={CX} cy={sy} r={R} /></clipPath>
            {/* melty overhang drooping below the scoop */}
            {[[-20,32],[0,36],[20,32]].map(([dx,dy],j) => (
              <ellipse key={j} cx={CX+dx} cy={sy+dy} rx="10" ry="6.5" fill={darken(s.fill, .07)} />
            ))}
            <circle cx={CX} cy={sy} r={R} fill={`url(#food-scoop-${s.id})`}
              stroke={s.stroke} strokeWidth="1.2" strokeOpacity=".55"
              style={{ transition: 'cy 0.45s ease' }} />
            <g clipPath={`url(#food-sclip-${s.id})`}>
              <ScoopTexture id={s.id} cx={CX} cy={sy} />
            </g>
            <ellipse cx={CX-13} cy={sy-14} rx="13" ry="9"
              fill="rgba(255,255,255,0.5)" transform={`rotate(-25 ${CX-13} ${sy-14})`}
              style={{ transition: 'cy 0.45s ease' }} />
            <ellipse cx={CX-18} cy={sy-19} rx="4" ry="2.6"
              fill="rgba(255,255,255,0.85)" transform={`rotate(-25 ${CX-18} ${sy-19})`} />
          </g>
        );
      })}

      {/* Toppings — always anchored to top scoop */}
      {scoops.length > 0 && <>
        {h('whip') && <g className="food-ing">
          {[[-14,-2],[-5,-12],[5,-12],[14,-2],[0,2]].map(([dx,dy],i) => (
            <ellipse key={i} cx={CX+dx} cy={topY-R+dy-5} rx="12" ry="9.5" fill="url(#food-whip)" />
          ))}
          {/* curled tip */}
          <path d={`M${CX-2},${topY-R-20} q4,-9 9,-5 q4,4 -3,8`} fill="#fbfafd" />
          <ellipse cx={CX-7} cy={topY-R-14} rx="6" ry="3.5" fill="rgba(255,255,255,.9)" />
        </g>}
        {h('choc') && <g className="food-ing">
          {[[-18,6],[6,15],[20,-3],[-4,-16],[16,-14]].map(([dx,dy],i) => (
            <path key={i} d={`M${CX+dx},${topY-R*0.5+dy} q${dx/3+5},${dy/2+10} ${dx/3+12},${dy/2+22}`}
              stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".85" />
          ))}
          {[[-10,-2],[10,4]].map(([dx,dy],i) => (
            <path key={i} d={`M${CX+dx},${topY-R*0.5+dy} q3,8 7,16`}
              stroke="#8d6e63" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
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
          <g className={done ? 'food-wiggle' : undefined}>
            <path d={`M${CX},${topY-R-22} q-14,-20 -8,-34`}
              stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${CX-8},${topY-R-50} q-9,2 -12,9 q9,3 12,-3 Z`} fill="#66bb6a" />
            <circle cx={CX} cy={topY-R-10} r="12" fill="url(#food-cherry)" />
            <ellipse cx={CX+4} cy={topY-R-15} rx="5" ry="3.5"
              fill="rgba(255,255,255,0.55)" transform={`rotate(-30 ${CX+4} ${topY-R-15})`} />
          </g>
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
  const lty = i => 256 - (i + 1) * LAYER_H;
  const candleColors = ['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8'];

  return (
    <svg viewBox="0 0 200 292" width={210} height={292} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <radialGradient id="food-frost" cx="40%" cy="30%" r="85%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f6f4f8" />
          <stop offset="100%" stopColor="#e4e0ec" />
        </radialGradient>
        <radialGradient id="food-glow">
          <stop offset="0%"   stopColor="#ffd54f" stopOpacity=".55" />
          <stop offset="60%"  stopColor="#ffd54f" stopOpacity=".2" />
          <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>
        <VGrad id="food-stand" c="#e6e2f0" hi={0.08} lo={0.16} />
        <Glossy id="food-star-gold" c="#ffc107" hi={0.4} lo={0.25} />
        {layerDefs.map(l => <VGrad key={l.id} id={`food-cake-${l.id}`} c={l.fill} />)}
        {candleColors.map((c, i) => <VGrad key={i} id={`food-candle-${i}`} c={c} hi={0.3} lo={0.15} />)}
      </defs>

      <ellipse cx="100" cy="284" rx="90" ry="8" fill="url(#food-shadow)" />

      {/* Cake stand */}
      <g>
        <path d="M90,264 L110,264 L114,277 L86,277 Z" fill="url(#food-stand)" />
        <ellipse cx="100" cy="278" rx="27" ry="5.5" fill="url(#food-stand)" stroke="#cfc8de" strokeWidth="1" />
        <ellipse cx="100" cy="258" rx="84" ry="10" fill="url(#food-stand)" stroke="#cfc8de" strokeWidth="1.2" />
        <ellipse cx="100" cy="256.5" rx="78" ry="8" fill="#f4f1fa" />
        <ellipse cx="74" cy="255" rx="26" ry="3" fill="rgba(255,255,255,.85)" />
      </g>

      {layers.map((layer, i) => {
        const ty = lty(i);
        return (
          <g key={layer.id} className="food-ing">
            <rect x={layer.x} y={ty} width={layer.rx*2} height={LAYER_H} rx={8} fill={`url(#food-cake-${layer.id})`} />
            <rect x={layer.x+4} y={ty+4} width={layer.rx*2-8} height={10} rx={5}
              fill={layer.hilite} opacity=".5" />
            {/* piped pearls along the layer base */}
            {[...Array(Math.floor((layer.rx*2-16)/13)+1)].map((_,j) => (
              <circle key={j} cx={layer.x+8+j*13} cy={ty+LAYER_H-3} r="3.2" fill={layer.hilite} opacity=".85" />
            ))}
            {/* Frosting cap with shine */}
            <ellipse cx={100} cy={ty} rx={layer.rx} ry={ERY} fill="url(#food-frost)" opacity=".97" />
            <ellipse cx={88} cy={ty-3} rx={layer.rx*0.36} ry={4} fill="rgba(255,255,255,0.7)" />
            {/* Frosting drips with a glossy bead at each tip */}
            {[...Array(5)].map((_,j) => {
              const dropX = layer.x + 14 + j * (layer.rx*2 - 28) / 4;
              const dropLen = 10 + [4,7,5,8,3][j];
              return (
                <g key={j}>
                  <path d={`M${dropX},${ty+ERY*0.7} q1,${dropLen} -1,${dropLen+6}`}
                    stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".9" />
                  <circle cx={dropX-0.5} cy={ty+ERY*0.7+dropLen+6} r="3.4" fill="#fff" />
                  <circle cx={dropX-1.8} cy={ty+ERY*0.7+dropLen+4.5} r="1.2" fill="#fff" opacity=".9" />
                </g>
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
            {/* candy stripes */}
            <rect x={cx-5} y={ty-26} width={10} height={3} rx={1.5} fill="rgba(255,255,255,.55)" />
            <rect x={cx-5} y={ty-18} width={10} height={3} rx={1.5} fill="rgba(255,255,255,.55)" />
            <line x1={cx} y1={ty-32} x2={cx} y2={ty-36} stroke="#5d4037" strokeWidth="1.5" />
            <g className="food-flame" style={{ animationDelay: `${i * 0.15}s` }}>
              <circle cx={cx} cy={ty-45} r="9" fill="url(#food-glow)" />
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
        return [[-32,-4],[0,-12],[32,-2]].map(([dx,dy],i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
            <g transform={`translate(${100+dx},${ty+dy}) scale(1.8) rotate(${i*16-16})`}>
              <path d={STAR} fill="url(#food-star-gold)" stroke={darken('#ffc107', .25)} strokeWidth=".6" />
              <circle cx="-1.5" cy="-1.8" r="1" fill="rgba(255,255,255,.8)" />
            </g>
          </g>
        ));
      })()}

      {done && <Sparkles pts={[[20,80],[180,100],[24,200],[176,220]]} />}
    </svg>
  );
}

function TacoSVG({ added, done }) {
  const h = id => added.has(id);
  // Point on the lettuce guide curve (quadratic bezier along the taco fold)
  const lq = t => [
    (1-t)*(1-t)*48 + 2*t*(1-t)*110 + t*t*172,
    (1-t)*(1-t)*142 + 2*t*(1-t)*44 + t*t*142,
  ];
  return (
    <svg viewBox="0 0 220 185" width={230} height={185} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        {/* inside of the shell is in shadow at the top, lighter near the fold */}
        <linearGradient id="food-shell-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={darken('#c8893a', .38)} />
          <stop offset="55%"  stopColor={darken('#c8893a', .2)} />
          <stop offset="100%" stopColor="#c8893a" />
        </linearGradient>
        <linearGradient id="food-shell-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten('#e8b050', .22)} />
          <stop offset="45%"  stopColor="#e8b050" />
          <stop offset="100%" stopColor={darken('#e8b050', .22)} />
        </linearGradient>
        <VGrad id="food-meat" c="#8d4c2a" hi={0.15} lo={0.28} />
        <VGrad id="food-tlettuce" c="#66bb6a" hi={0.25} lo={0.2} />
        <Glossy id="food-ttomato" c="#e53935" />
        <Glossy id="food-salsa" c="#ff5722" />
        <radialGradient id="food-whip2" cx="40%" cy="30%" r="85%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="80%"  stopColor="#f5f3f0" />
          <stop offset="100%" stopColor="#e3ded6" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="176" rx="88" ry="9" fill="url(#food-shadow)" />

      {/* Back shell half — fillings spill out in front of it */}
      {h('shell') && <g className="food-ing">
        <path d="M30,166 Q110,30 190,166 Z" fill="url(#food-shell-back)" />
        <path d="M30,166 Q110,30 190,166" fill="none" stroke={darken('#c8893a', .3)} strokeWidth="2.5" />
      </g>}

      {/* Fillings — bottoms hidden behind the front shell half */}
      {h('meat') && <g className="food-ing">
        <path d="M52,144 Q110,52 168,144" fill="none" stroke="url(#food-meat)"
          strokeWidth="24" strokeLinecap="round" />
        {/* crumbly silhouette along the top edge */}
        {[.14,.27,.4,.53,.66,.79,.9].map((t,i) => {
          const mx = (1-t)*(1-t)*52 + 2*t*(1-t)*110 + t*t*168;
          const my = (1-t)*(1-t)*144 + 2*t*(1-t)*52 + t*t*144;
          return <circle key={i} cx={mx} cy={my-9} r={5 + (i*5)%3} fill={darken('#8d4c2a', .05)} />;
        })}
        {[[70,112],[88,98],[110,92],[132,98],[150,112]].map(([mx,my],i) => (
          <circle key={i} cx={mx} cy={my} r={3.2 + (i*7)%3} fill={darken('#8d4c2a', .22)} opacity=".75" />
        ))}
        {[[79,104],[100,93],[121,94],[141,104]].map(([mx,my],i) => (
          <circle key={i} cx={mx} cy={my} r="2.2" fill={lighten('#8d4c2a', .28)} opacity=".8" />
        ))}
      </g>}

      {h('lettuce') && <g className="food-ing">
        <path d="M48,142 Q110,44 172,142" fill="none" stroke="url(#food-tlettuce)"
          strokeWidth="18" strokeLinecap="round" />
        {/* ruffled leaf bumps along the fold, two staggered rows */}
        {[.1,.24,.38,.52,.66,.8,.92].map((t,i) => {
          const [bx,by] = lq(t);
          return (
            <g key={i}>
              <circle cx={bx} cy={by-4} r={9 + i%2*2.5} fill="url(#food-tlettuce)" />
              <path d={`M${bx-5},${by-7} q5,-4 10,0`} fill="none" stroke={lighten('#66bb6a', .35)}
                strokeWidth="1.8" opacity=".8" strokeLinecap="round" />
            </g>
          );
        })}
        {[.17,.31,.45,.59,.73,.87].map((t,i) => {
          const [bx,by] = lq(t);
          return <circle key={i} cx={bx} cy={by+7} r="8.5" fill={darken('#66bb6a', .08)} />;
        })}
      </g>}

      {h('tomato') && [[76,104,-12],[100,92,8],[124,92,-8],[148,104,14]].map(([cx,cy,rot],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <g transform={`rotate(${rot} ${cx} ${cy})`}>
            <rect x={cx-7} y={cy-7} width="14" height="14" rx="3.5" fill="url(#food-ttomato)" />
            <rect x={cx-4} y={cy-4} width="8" height="8" rx="2" fill={lighten('#e53935', .18)} opacity=".75" />
            <ellipse cx={cx-3} cy={cy-4.5} rx="2.6" ry="1.5" fill="rgba(255,255,255,.5)" />
          </g>
        </g>
      ))}

      {/* Shredded cheese scattered over the fillings */}
      {h('cheese') && <g className="food-ing">
        {[[72,100,-28],[88,88,15],[106,82,-10],[124,84,28],[142,94,-18],[96,98,42],[116,94,-38],[134,102,12],[82,108,-45],[152,108,30]].map(([sx,sy,rot],i) => (
          <rect key={i} x={sx-7} y={sy-1.5} width="14" height="3.2" rx="1.6"
            fill={i%2 ? '#ffb300' : '#ffd740'} stroke={darken('#ffb300', .12)} strokeWidth=".4"
            transform={`rotate(${rot} ${sx} ${sy})`} />
        ))}
      </g>}

      {/* Sour cream dollop drizzled at the very top */}
      {h('sourcream') && <g className="food-ing">
        {[[98,82],[110,76],[122,82],[110,85]].map(([dx,dy],i) => (
          <ellipse key={i} cx={dx} cy={dy} rx="11" ry="7.5" fill="url(#food-whip2)" />
        ))}
        <path d="M92,88 q8,9 4,16" fill="none" stroke="#f5f3f0" strokeWidth="5" strokeLinecap="round" />
        <path d="M126,87 q-2,8 2,13" fill="none" stroke="#f5f3f0" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="105" cy="75" rx="6" ry="3" fill="rgba(255,255,255,.9)" />
      </g>}

      {h('salsa') && [[84,94],[112,88],[138,96]].map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <circle cx={cx} cy={cy} r="6.5" fill="url(#food-salsa)" opacity=".95" />
          <circle cx={cx+5.5} cy={cy+2.5} r="4" fill={darken('#ff5722', .12)} opacity=".9" />
          <circle cx={cx-5} cy={cy+3} r="3.2" fill={lighten('#ff5722', .12)} opacity=".9" />
          <rect x={cx+1} y={cy-5} width="4" height="2" rx="1" fill="#7cb342" opacity=".9"
            transform={`rotate(${i*40} ${cx+3} ${cy-4})`} />
        </g>
      ))}

      {h('jalapeno') && [[88,82,-15],[114,76,5],[140,84,18]].map(([cx,cy,rot],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <g className={done ? 'food-wiggle' : undefined}>
            <g transform={`rotate(${rot} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r="7.5" fill="#c8e6c9" stroke="#388e3c" strokeWidth="3" />
              <circle cx={cx} cy={cy} r="9" fill="none" stroke={darken('#388e3c', .2)} strokeWidth="1" opacity=".5" />
              {[[-2.5,1],[2.5,0],[0,-2.5]].map(([dx,dy],j) => (
                <circle key={j} cx={cx+dx} cy={cy+dy} r="1.2" fill="#fff9c4" stroke="#dce775" strokeWidth=".5" />
              ))}
              <path d={`M${cx-4.5},${cy-4} a6,6 0 0 1 4,-2`} fill="none"
                stroke="rgba(255,255,255,.7)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </g>
        </g>
      ))}

      {/* Front shell half — covers the filling bottoms */}
      {h('shell') && <g className="food-ing">
        <path d="M22,168 Q110,62 198,168 Z" fill="url(#food-shell-front)" />
        {/* corn ridges following the fold */}
        <path d="M34,166 Q110,76 186,166" fill="none" stroke={darken('#e8b050', .2)} strokeWidth="1.8" opacity=".45" />
        <path d="M46,166 Q110,92 174,166" fill="none" stroke="rgba(255,245,200,.5)" strokeWidth="1.6" />
        <path d="M58,166 Q110,108 162,166" fill="none" stroke={darken('#e8b050', .14)} strokeWidth="1.5" opacity=".4" />
        {/* toasted speckles */}
        {[[64,150],[88,134],[110,126],[134,134],[156,150],[78,156],[144,158],[100,142],[122,142],[112,158]].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r={i%3 ? 1.7 : 2.5} fill={darken('#c8893a', .25)} opacity=".4" />
        ))}
        {[[84,146],[118,134],[146,144]].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r="1.5" fill={lighten('#e8b050', .35)} opacity=".8" />
        ))}
        {/* crisp top edge + highlight just under it */}
        <path d="M22,168 Q110,62 198,168" fill="none" stroke="#a06820" strokeWidth="3" />
        <path d="M28,164 Q110,68 192,164" fill="none" stroke="rgba(255,243,210,.6)" strokeWidth="2" />
      </g>}

      {done && <Steam xs={[88,110,132]} y={50} />}
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
        <Glossy id="food-spick" c="#7cb342" hi={0.4} lo={0.25} />
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
        {/* airy crumb holes */}
        {[[58,10],[96,12],[134,9],[76,13]].map(([hx,hy],i) => (
          <circle key={i} cx={hx} cy={breadBotY+hy} r={1.6+i%2*0.6} fill={darken('#f6e2b3', .14)} opacity=".7" />
        ))}
      </g>}

      {hamY !== null && [62,100,138].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <g transform={`rotate(${(i-1)*4} ${cx} ${hamY+8})`}>
            <ellipse cx={cx} cy={hamY+8} rx={34} ry={8.5} fill="url(#food-ham)"
              stroke={darken('#ef8da0', .15)} strokeWidth="1" opacity=".95" />
            {/* ruffled folds */}
            <path d={`M${cx-22},${hamY+6} q8,5 16,0`} fill="none" stroke="#f8bbd0" strokeWidth="1.6" opacity=".7" />
            <path d={`M${cx+2},${hamY+10} q8,4 16,-1`} fill="none" stroke="#f8bbd0" strokeWidth="1.4" opacity=".6" />
          </g>
        </g>
      ))}

      {cheeseY !== null && <g className="food-ing">
        <rect x="30" y={cheeseY} width={140} height={10} rx={3} fill="url(#food-scheese)" />
        <rect x="30" y={cheeseY} width={140} height={4} rx={2} fill={lighten('#ffca28', .3)} opacity=".7" />
        {/* hanging corners */}
        <path d={`M58,${cheeseY+9} L70,${cheeseY+22} L82,${cheeseY+9} Z`} fill={darken('#ffca28', .06)} />
        <path d={`M120,${cheeseY+9} L132,${cheeseY+20} L144,${cheeseY+9} Z`} fill={darken('#ffca28', .06)} />
      </g>}

      {lettuceY !== null && <g className="food-ing">
        <path d={`M28,${lettuceY+17} q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 L172,${lettuceY+17} Z`}
          fill={darken('#7cb342', .18)} opacity=".85" />
        <path d={`M28,${lettuceY+14} q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 q12,-16 24,0 L172,${lettuceY+14} Z`}
          fill="url(#food-slettuce)" />
      </g>}

      {tomatoY !== null && [62,100,138].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={tomatoY+6} rx={26} ry={7} fill="url(#food-stomato)" opacity=".95" />
          <ellipse cx={cx} cy={tomatoY+6} rx={17} ry={4.2} fill="none" stroke="#ef9a9a"
            strokeWidth="1.3" opacity=".55" />
          <ellipse cx={cx-8} cy={tomatoY+4} rx={6} ry={2} fill="rgba(255,255,255,.4)" />
        </g>
      ))}

      {cucumberY !== null && [56,88,120,150].map((cx,i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 60}ms` }}>
          <ellipse cx={cx} cy={cucumberY+5} rx={13} ry={6} fill="url(#food-cucumber)"
            stroke="#7cb342" strokeWidth="2" />
          <ellipse cx={cx} cy={cucumberY+5} rx={7} ry={3} fill="none"
            stroke="#aed581" strokeWidth="1" opacity=".8" />
          {[[-3,0],[0,-1.5],[3,0.5],[1,1.5],[-1.5,1]].map(([dx,dy],j) => (
            <circle key={j} cx={cx+dx} cy={cucumberY+5+dy} r=".8" fill="#f0f4c3" opacity=".9" />
          ))}
        </g>
      ))}

      {mayoY !== null && <g className="food-ing">
        <path d={`M44,${mayoY+2} q14,-8 28,0 q14,-8 28,0 q14,-8 28,0 q14,-8 28,0 L156,${mayoY+8} q-14,8 -28,0 q-14,8 -28,0 q-14,8 -28,0 q-14,8 -28,0 Z`}
          fill="url(#food-mayo)" opacity=".95" />
        <ellipse cx="86" cy={mayoY+2.5} rx="10" ry="1.8" fill="rgba(255,255,255,.85)" />
      </g>}

      {breadTopY !== null && <g className="food-ing">
        <ellipse cx="100" cy={breadTopY+2} rx="64" ry="4" fill="#000" opacity=".07" />
        <path d={`M34,${breadTopY} Q34,${breadTopY-22} 100,${breadTopY-24} Q166,${breadTopY-22} 166,${breadTopY} Z`}
          fill="url(#food-crust)" />
        <path d={`M40,${breadTopY} Q40,${breadTopY-16} 100,${breadTopY-18} Q160,${breadTopY-16} 160,${breadTopY} Z`}
          fill="url(#food-crumb)" opacity=".9" />
        {/* flour dust + score line */}
        <ellipse cx="118" cy={breadTopY-12} rx="9" ry="3" fill="#fff" opacity=".3"
          transform={`rotate(-12 118 ${breadTopY-12})`} />
        <path d={`M74,${breadTopY-10} q26,-9 52,0`} fill="none" stroke={darken('#e0a35c', .15)}
          strokeWidth="1.6" opacity=".5" strokeLinecap="round" />
        <ellipse cx="86" cy={breadTopY-14} rx="26" ry="5" fill="rgba(255,255,255,.45)" />
      </g>}

      {/* club-sandwich pick with an olive, served on the done screen */}
      {done && breadTopY !== null && <g className="food-ing" style={{ animationDelay: '.4s' }}>
        <line x1="100" y1={breadTopY-22} x2="100" y2={breadTopY-46} stroke="#8d6e63" strokeWidth="2.5"
          strokeLinecap="round" />
        <g className="food-wiggle">
          <circle cx="100" cy={breadTopY-51} r="6.5" fill="url(#food-spick)" />
          <circle cx="100" cy={breadTopY-51} r="2.2" fill="#e53935" />
          <ellipse cx="97.6" cy={breadTopY-53.4} rx="2.2" ry="1.4" fill="rgba(255,255,255,.55)" />
        </g>
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
    w: 10 + (i % 3),
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

      {/* Carton back panel with paper liner */}
      {h('carton') && <g className="food-ing">
        <path d="M56,108 L144,108 L140,150 L60,150 Z" fill={darken('#e53935', .35)} />
        <rect x="60" y="108" width="80" height="7" rx="3" fill="#fff7ee" opacity=".85" />
      </g>}

      {/* Fries — render between carton back and front so bottoms sit inside */}
      {h('fries') && fries.map((f, i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
          <g transform={`rotate(${f.rot} ${f.x + f.w/2} 148)`}>
            <rect x={f.x} y={f.top} width={f.w} height={150 - f.top} rx="4"
              fill="url(#food-fry)" stroke={darken('#f5c842', .25)} strokeWidth="1" />
            {/* crispy fried tip */}
            <rect x={f.x} y={f.top} width={f.w} height="7" rx="3.5"
              fill={darken('#f5c842', .14)} opacity=".85" />
            <rect x={f.x + 2} y={f.top + 3} width="3" height={Math.max(20, 130 - f.top)} rx="1.5"
              fill="rgba(255,255,255,.45)" />
          </g>
        </g>
      ))}

      {/* Salt specks over the fry tops (twinkle once served) */}
      {h('salt') && h('fries') && <g className={done ? 'food-twinkle' : undefined}>
        {[[66,48],[82,40],[98,56],[112,42],[126,52],[90,68],[108,72],[74,62]].map(([sx,sy],i) => (
          <g key={i} className="food-ing" style={{ animationDelay: `${i * 40}ms` }}>
            <circle cx={sx} cy={sy} r="1.8" fill="#ffffff" opacity=".95" />
            <circle cx={sx+3} cy={sy+2.5} r="1" fill="#ffffff" opacity=".7" />
          </g>
        ))}
      </g>}

      {/* Cheese drizzle ribbons */}
      {h('cheese') && h('fries') && <g className="food-ing">
        <path d="M60,72 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 18,0"
          stroke="#ffa726" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".9" />
        <path d="M66,92 q10,-7 20,0 q10,7 20,0 q10,-7 20,0"
          stroke="#ffb74d" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".85" />
        <path className="food-drip" style={{ animationDelay: '.4s' }}
          d="M104,74 q1,9 -1,13" stroke="#ffa726" strokeWidth="4" fill="none" strokeLinecap="round" />
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
        <path d="M132,128 Q129,166 125,200" stroke="rgba(255,255,255,.18)" strokeWidth="4"
          fill="none" strokeLinecap="round" />
        <line x1="54" y1="122" x2="146" y2="122" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
        {/* friendly face */}
        <circle cx="88" cy="152" r="4" fill="rgba(255,255,255,.9)" />
        <circle cx="112" cy="152" r="4" fill="rgba(255,255,255,.9)" />
        <circle cx="89" cy="151" r="1.5" fill={darken('#e53935', .4)} />
        <circle cx="113" cy="151" r="1.5" fill={darken('#e53935', .4)} />
        <path d="M80,166 Q100,182 120,166" stroke="rgba(255,255,255,.9)" strokeWidth="5"
          fill="none" strokeLinecap="round" />
      </g>}

      {/* Ketchup dip cup */}
      {h('ketchup') && <g className="food-ing">
        <path d="M152,188 L196,188 L191,212 Q190,218 184,218 L164,218 Q158,218 157,212 Z"
          fill="url(#food-cup)" stroke="#d5d0c8" strokeWidth="1.5" />
        <ellipse cx="174" cy="190" rx="19" ry="6" fill="url(#food-ketchup)" />
        <path d="M166,189 q5,-3 10,0 q-4,2.5 -10,0" fill={lighten('#d32f2f', .2)} opacity=".85" />
        <ellipse cx="167" cy="188" rx="5" ry="1.8" fill="rgba(255,255,255,.5)" />
      </g>}

      {done && <Steam xs={[80,100,120]} y={50} />}
      {done && <Sparkles pts={[[20,60],[180,50],[30,170]]} />}
    </svg>
  );
}

function CookieSVG({ added, done }) {
  const h = id => added.has(id);

  // Deterministic topping positions — never Math.random() in render
  const chips     = [[72,74],[120,70],[86,102],[130,106],[64,116],[104,134],[142,92],[78,140],[110,94]];
  const mms       = [[92,80,'#e53935'],[122,126,'#43a047'],[70,96,'#fdd835'],[136,72,'#1e88e5'],[100,118,'#fb8c00'],[150,112,'#8e24aa']];
  const sprinkles = [[66,68],[140,78],[78,120],[126,134],[100,62],[150,100],[60,100],[114,150],[90,142],[134,104]];
  const sprColors = ['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800','#f06292','#26c6da'];
  const nuts      = [[84,88,-20],[126,96,15],[96,124,-8],[70,128,30],[138,124,-25],[110,76,10]];

  return (
    <svg viewBox="0 0 200 200" width={210} height={210} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <Shadow />
        <SheenGrad />
        <clipPath id="food-cookie-clip"><circle cx="100" cy="100" r="82" /></clipPath>
        <radialGradient id="food-cookie-base" cx="42%" cy="38%" r="70%">
          <stop offset="0%"   stopColor={lighten('#e0a854', .22)} />
          <stop offset="60%"  stopColor="#e0a854" />
          <stop offset="100%" stopColor={darken('#e0a854', .16)} />
        </radialGradient>
        <radialGradient id="food-cookie-edge" cx="50%" cy="45%" r="58%">
          <stop offset="0%"   stopColor="#c87f3a" />
          <stop offset="78%"  stopColor="#c87f3a" />
          <stop offset="100%" stopColor={darken('#c87f3a', .24)} />
        </radialGradient>
        <Glossy id="food-chip" c="#4a2c1a" hi={0.45} lo={0.3} />
      </defs>

      <ellipse cx="100" cy="190" rx="84" ry="9" fill="url(#food-shadow)" />

      {/* Cookie base */}
      {h('dough') && <g className="food-ing">
        {/* homemade wavy baked edge */}
        {[...Array(16)].map((_, i) => {
          const a = i / 16 * Math.PI * 2;
          const bx = 100 + 78 * Math.cos(a), by = 100 + 78 * Math.sin(a);
          return <circle key={i} cx={bx} cy={by} r={i % 2 ? 9 : 7} fill="url(#food-cookie-edge)" />;
        })}
        <circle cx="100" cy="100" r="80" fill="url(#food-cookie-edge)" />
        <circle cx="100" cy="100" r="74" fill="url(#food-cookie-base)" />
        {/* baked surface mottling */}
        {[[78,72,'l'],[120,84,'d'],[92,116,'l'],[128,114,'d'],[70,104,'d'],[112,132,'l']].map(([mx,my,t],i) => (
          <ellipse key={i} cx={mx} cy={my} rx={14+i%2*5} ry={10+i%2*3}
            fill={t === 'l' ? lighten('#e0a854', .14) : darken('#e0a854', .1)} opacity=".55"
            transform={`rotate(${i*36} ${mx} ${my})`} />
        ))}
        {/* toasted speckles */}
        {[[64,90],[132,98],[88,64],[116,136],[74,128],[140,118],[98,98],[108,70],[80,108]].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r={i%3 ? 1.6 : 2.4} fill={darken('#c87f3a', .15)} opacity=".5" />
        ))}
        {/* a couple of baked cracks */}
        <path d="M58,96 q20,-10 38,2 q18,10 40,-4" fill="none" stroke={darken('#c87f3a', .2)}
          strokeWidth="2" opacity=".4" strokeLinecap="round" />
        <path d="M74,126 q16,8 34,0" fill="none" stroke={darken('#c87f3a', .2)}
          strokeWidth="1.6" opacity=".35" strokeLinecap="round" />
        {/* sheen highlight */}
        <path d="M48,76 A66,66 0 0 1 108,38" stroke="rgba(255,255,255,.4)" strokeWidth="6"
          fill="none" strokeLinecap="round" />
      </g>}

      {/* Chocolate chips */}
      {h('chips') && h('dough') && chips.map(([cx,cy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
          <g transform={`rotate(${(i*47)%50-25} ${cx} ${cy})`}>
            <path d={`M${cx-8},${cy+5} Q${cx-9},${cy-6} ${cx},${cy-7} Q${cx+9},${cy-6} ${cx+8},${cy+5} Q${cx},${cy+8} ${cx-8},${cy+5} Z`}
              fill="url(#food-chip)" />
            <ellipse cx={cx-2.5} cy={cy-3} rx="3" ry="2" fill="rgba(255,255,255,.45)"
              transform={`rotate(-20 ${cx-2.5} ${cy-3})`} />
          </g>
        </g>
      ))}

      {/* Candy buttons (M&M style) */}
      {h('candy') && h('dough') && mms.map(([cx,cy,c],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
          <ellipse cx={cx} cy={cy} rx="9" ry="7.5" fill={c} />
          <path d={`M${cx-8},${cy+1} a9,7.5 0 0 0 16,0 a9,7.5 0 0 1 -16,0 Z`} fill={darken(c, .2)} opacity=".6" />
          <ellipse cx={cx-2.5} cy={cy-3} rx="3.5" ry="2" fill="rgba(255,255,255,.65)" />
        </g>
      ))}

      {/* Chopped nuts */}
      {h('nuts') && h('dough') && nuts.map(([cx,cy,rot],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 50}ms` }}>
          <g transform={`rotate(${rot} ${cx} ${cy})`}>
            <path d={`M${cx-6},${cy} Q${cx},${cy-6} ${cx+6},${cy} Q${cx},${cy+6} ${cx-6},${cy} Z`}
              fill="#e8c98f" stroke={darken('#e8c98f', .2)} strokeWidth=".8" />
            <line x1={cx-3} y1={cy} x2={cx+3} y2={cy} stroke={darken('#e8c98f', .25)} strokeWidth=".8" opacity=".6" />
          </g>
        </g>
      ))}

      {/* Rainbow sprinkles */}
      {h('sprinkles') && h('dough') && sprinkles.map(([sx,sy],i) => (
        <g key={i} className="food-ing" style={{ animationDelay: `${i * 40}ms` }}>
          <rect x={sx-5} y={sy-1.5} width="11" height="4" rx="2"
            fill={sprColors[i % sprColors.length]}
            transform={`rotate(${i*40} ${sx} ${sy})`} />
        </g>
      ))}

      {/* White icing drizzle */}
      {h('icing') && h('dough') && <g className="food-ing">
        <path d="M52,84 q14,-12 26,2 q14,14 26,2 q14,-12 26,2 q11,9 20,1"
          stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".92" />
        <path d="M58,124 q14,12 26,0 q14,-12 26,0 q14,12 24,0"
          stroke="#f6f1e8" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity=".88" />
        <path className="food-drip" style={{ animationDelay: '.4s' }}
          d="M150,90 q2,9 -1,14" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>}

      {/* glossy sheen sweeping over the finished cookie */}
      {done && h('dough') && (
        <g clipPath="url(#food-cookie-clip)">
          <g transform="rotate(-18 100 100)">
            <rect className="food-sheen" x="-70" y="-30" width="60" height="260" fill="url(#food-sheen-grad)" />
          </g>
        </g>
      )}

      {done && <Steam xs={[74,100,126]} y={56} />}
      {done && <Sparkles pts={[[16,46],[184,66],[22,150],[182,158]]} />}
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
  {
    id: 'cookie', name: 'Cookie', emoji: '🍪', cookWord: 'Bake', cookEmoji: '🔥',
    required: ['dough','chips'],
    optional: ['candy','nuts','sprinkles','icing'],
    ingredients: [
      { id:'dough',     label:'🍪 Cookie Dough',     req:true  },
      { id:'chips',     label:'🍫 Chocolate Chips',  req:true  },
      { id:'candy',     label:'🔴 Candy Buttons',    req:false },
      { id:'nuts',      label:'🥜 Chopped Nuts',     req:false },
      { id:'sprinkles', label:'🌈 Sprinkles',         req:false },
      { id:'icing',     label:'🤍 Icing Drizzle',    req:false },
    ],
    Viz: CookieSVG,
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
      track('game_complete', { game: 'food', dish: food.id });
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
            <div className="food-done-viz">
              <Viz added={added} done />
            </div>
          </div>
          <div className="food-done-card">
            <p className="food-done-name">Chef Samritha&apos;s {food.name} {food.emoji}</p>
            <p style={{ fontSize:'1.8rem', margin:'6px 0 0' }}>😋🤤👨‍🍳</p>
          </div>
          <span className="food-float" style={{ left:'12%', animationDelay:'0s'   }}>{food.emoji}</span>
          <span className="food-float" style={{ left:'30%', animationDelay:'2s'   }}>⭐</span>
          <span className="food-float" style={{ left:'48%', animationDelay:'1.2s' }}>✨</span>
          <span className="food-float" style={{ left:'66%', animationDelay:'3.1s' }}>💛</span>
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
        <div className="food-pick-grid">
          {FOODS.map((f, i) => (
            <button key={f.id} className="food-pick-btn" onClick={() => setFood(f)}
              style={{ animationDelay: `${i * 60}ms` }}>
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
              <span className="cook-emoji" style={{ fontSize:'3rem' }}>{food.cookEmoji}</span>
              <p>{food.cookWord}ing your {food.name}...</p>
              <span className="cook-rise" style={{ left:'18%', animationDelay:'0s'  }}>{food.cookEmoji}</span>
              <span className="cook-rise" style={{ left:'46%', animationDelay:'.45s' }}>✨</span>
              <span className="cook-rise" style={{ left:'72%', animationDelay:'.9s' }}>{food.cookEmoji}</span>
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
