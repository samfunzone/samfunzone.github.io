import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

/* ─────────────────────────────
   Food SVG Components
───────────────────────────── */
function PizzaSVG({ added }) {
  const h = id => added.has(id);
  const tops = [
    [78,78],[116,72],[97,105],[68,108],[128,100],[108,128],[74,128],[115,125]
  ];
  return (
    <svg viewBox="0 0 200 200" width={210} height={210}>
      <circle cx="100" cy="100" r="95" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="2"/>
      {h('dough') && <>
        <circle cx="100" cy="100" r="86" fill="#d4a56a"/>
        <circle cx="100" cy="100" r="70" fill="#e8c89a"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <circle key={a} cx={100+79*Math.cos(a*Math.PI/180)} cy={100+79*Math.sin(a*Math.PI/180)} r="5" fill="#b8834a" opacity=".7"/>
        ))}
      </>}
      {h('sauce') && <circle cx="100" cy="100" r="68" fill="#e53935" opacity=".85"/>}
      {h('cheese') && <>
        <ellipse cx="100" cy="100" rx="63" ry="61" fill="#fff176" opacity=".9"/>
        <ellipse cx="84" cy="88" rx="20" ry="14" fill="#ffee58" transform="rotate(-15 84 88)"/>
        <ellipse cx="118" cy="112" rx="18" ry="13" fill="#ffee58" transform="rotate(20 118 112)"/>
      </>}
      {h('pepperoni') && tops.slice(0,7).map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r="10" fill="#c62828"/>)}
      {h('mushroom') && [[88,70],[120,90],[84,122],[112,126]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <ellipse cx="0" cy="-4" rx="9" ry="6" fill="#8d6e63"/>
          <rect x="-3" y="-2" width="6" height="8" rx="1" fill="#bcaaa4"/>
        </g>
      ))}
      {h('pepper') && [[74,96],[106,84],[94,116],[122,110]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="11" ry="5"
          fill={['#43a047','#ffee58','#e53935','#43a047'][i]} transform={`rotate(${i*50} ${cx} ${cy})`}/>
      ))}
      {h('olive') && [[90,92],[113,88],[100,120],[76,118]].map(([cx,cy],i) => (
        <g key={i}><circle cx={cx} cy={cy} r="7" fill="#33691e"/><circle cx={cx} cy={cy} r="3" fill="#7cb342"/></g>
      ))}
    </svg>
  );
}

function BurgerSVG({ added }) {
  const h = id => added.has(id);
  let y = 210; // stack from bottom
  const layer = (comp, height) => { y -= height; return comp; };

  return (
    <svg viewBox="0 0 200 260" width={200} height={260}>
      {/* Plate */}
      <ellipse cx="100" cy="230" rx="88" ry="14" fill="#e0e0e0"/>
      {/* Bottom bun */}
      {h('bun') && <><ellipse cx="100" cy="210" rx="72" ry="16" fill="#e8a44a"/>
        <ellipse cx="100" cy="204" rx="72" ry="10" fill="#f0b86a"/></>}
      {/* Patty */}
      {h('patty') && <><rect x="30" y="175" width="140" height="22" rx="10" fill="#6d3c1e"/>
        <rect x="35" y="178" width="130" height="10" rx="5" fill="#8b4e28" opacity=".5"/></>}
      {/* Cheese */}
      {h('cheese') && <rect x="22" y="165" width="156" height="18" rx="4" fill="#ffc107" opacity=".9"/>}
      {/* Lettuce */}
      {h('lettuce') && [0,1,2,3,4].map(i => (
        <ellipse key={i} cx={40+i*32} cy={163} rx={22} ry={10}
          fill="#66bb6a" transform={`rotate(${i*15-30} ${40+i*32} 163)`} opacity=".9"/>
      ))}
      {/* Tomato */}
      {h('tomato') && [48,80,112,140].map((cx,i) => (
        <ellipse key={i} cx={cx} cy={155} rx="20" ry="9" fill="#e53935" opacity=".85"/>
      ))}
      {/* Onion */}
      {h('onion') && [55,95,135].map((cx,i) => (
        <ellipse key={i} cx={cx} cy={147} rx="20" ry="7" fill="#ce93d8" opacity=".7"/>
      ))}
      {/* Top bun */}
      {h('bun') && <><ellipse cx="100" cy="138" rx="72" ry="30" fill="#e8a44a"/>
        <ellipse cx="100" cy="125" rx="68" ry="22" fill="#f0b86a"/>
        {[85,100,115].map((cx,i) => <circle key={i} cx={cx} cy={115} r="4" fill="#fff3e0" opacity=".8"/>)}
      </>}
    </svg>
  );
}

function IceCreamSVG({ added }) {
  const h = id => added.has(id);
  const scoopColors = {
    vanilla: '#fffde7', chocolate: '#6d4c41', strawberry: '#f48fb1',
    mint: '#b2dfdb', cookie: '#795548'
  };
  const scoops = ['vanilla','chocolate','strawberry','mint','cookie'].filter(h);

  return (
    <svg viewBox="0 0 180 280" width={190} height={280}>
      {/* Cone */}
      {h('cone') && <>
        <path d="M60,180 L120,180 L90,270 Z" fill="#d4a56a"/>
        {[0,1,2,3,4].map(i => (
          <line key={i} x1={63+i*12} y1={183} x2={90} y2={267}
            stroke="#c8934a" strokeWidth="1.5" opacity=".6"/>
        ))}
        <ellipse cx="90" cy="182" rx="32" ry="10" fill="#e8c89a"/>
      </>}
      {/* Ice cream scoops */}
      {scoops.map((s, i) => (
        <g key={s}>
          <circle cx="90" cy={170 - i * 48} r="36" fill={scoopColors[s]}
            stroke={scoopColors[s]} strokeWidth="2"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))' }}/>
          {/* Shine */}
          <ellipse cx="76" cy={158 - i*48} rx="10" ry="7" fill="rgba(255,255,255,0.35)" transform={`rotate(-20 76 ${158-i*48})`}/>
        </g>
      ))}
      {/* Whipped cream */}
      {h('whip') && scoops.length > 0 && (
        <g transform={`translate(90, ${170 - scoops.length * 48 + 4})`}>
          {[0,1,2].map(i => (
            <ellipse key={i} cx={[-8,0,8][i]} cy={[-20,-30,-20][i]} rx="10" ry="8" fill="white"
              transform={`rotate(${[-15,0,15][i]})`}/>
          ))}
        </g>
      )}
      {/* Chocolate sauce */}
      {h('choc') && scoops.length > 0 && (
        [[-12,10],[8,20],[18,-5],[-5,-18]].map(([dx,dy],i) => (
          <path key={i} d={`M${90+dx},${170-scoops.length*48+dy} q${dx*2},${dy+10} ${dx+15},${dy+25}`}
            stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".8"/>
        ))
      )}
      {/* Sprinkles */}
      {h('sprinkles') && scoops.length > 0 && (
        [[70,145],[105,140],[85,155],[115,155],[75,162],[100,165],[90,135]].map(([x,y],i) => (
          <rect key={i} x={x} y={y-(scoops.length-1)*48} width="10" height="4" rx="2"
            fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8'][i%5]}
            transform={`rotate(${i*40} ${x+5} ${y-(scoops.length-1)*48+2})`}/>
        ))
      )}
      {/* Cherry */}
      {h('cherry') && scoops.length > 0 && (
        <>
          <circle cx="90" cy={132-scoops.length*48} r="10" fill="#e53935"/>
          <path d={`M90,${122-scoops.length*48} q-10,-15 -5,-25`}
            stroke="#388e3c" strokeWidth="2" fill="none"/>
        </>
      )}
    </svg>
  );
}

function CakeSVG({ added }) {
  const h = id => added.has(id);
  const layerColors = ['#f48fb1','#ce93d8','#80cbc4'];
  const layers = ['layer1','layer2','layer3'].filter(h);

  return (
    <svg viewBox="0 0 200 260" width={210} height={260}>
      {/* Plate */}
      <ellipse cx="100" cy="238" rx="86" ry="13" fill="#e0e0e0"/>
      {/* Cake layers (bottom to top) */}
      {layers.map((l, i) => {
        const ii = layers.length - 1 - i;
        const yBase = 225 - ii * 48;
        return (
          <g key={l}>
            <rect x="28" y={yBase-36} width="144" height="36" rx="8" fill={layerColors[ii]}/>
            <ellipse cx="100" cy={yBase-36} rx="72" ry="12" fill="white" opacity=".35"/>
            {/* Frosting drips */}
            {[40,65,90,115,140,155].map((x,j) => (
              <path key={j} d={`M${x},${yBase-38} q2,12 0,20`}
                stroke="white" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".8"/>
            ))}
          </g>
        );
      })}
      {/* Top frosting */}
      {layers.length > 0 && (
        <ellipse cx="100" cy={225 - layers.length * 48 - 36} rx="72" ry="14" fill="white" opacity=".9"/>
      )}
      {/* Candles */}
      {h('candles') && layers.length > 0 && (
        [60,85,110,135].map((cx,i) => (
          <g key={i}>
            <rect x={cx-5} y={185-layers.length*48} width="10" height="24" rx="3"
              fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784'][i]}/>
            <ellipse cx={cx} cy={184-layers.length*48} rx="5" ry="3" fill="#fff176"/>
            <path d={`M${cx},${184-layers.length*48} q3,-8 0,-16`}
              stroke="#ff9800" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <ellipse cx={cx} cy={168-layers.length*48} rx="3" ry="4" fill="#ffee58" opacity=".8"/>
          </g>
        ))
      )}
      {/* Sprinkles on top */}
      {h('sprinkles') && layers.length > 0 && (
        [[75,10],[95,6],[110,12],[85,18],[105,20],[70,16]].map(([dx,dy],i) => (
          <rect key={i} x={40+dx} y={212-layers.length*48+dy} width="12" height="5" rx="2.5"
            fill={['#ff6b6b','#4fc3f7','#ffee58','#81c784','#ce93d8','#ff9800'][i]}
            transform={`rotate(${i*30} ${40+dx+6} ${212-layers.length*48+dy+2})`}/>
        ))
      )}
      {/* Stars decoration */}
      {h('stars') && layers.length > 0 && (
        [[55,8],[100,4],[140,10]].map(([cx,dy],i) => (
          <text key={i} x={cx} y={208-layers.length*48+dy} fontSize="18" textAnchor="middle">⭐</text>
        ))
      )}
    </svg>
  );
}

function TacoSVG({ added }) {
  const h = id => added.has(id);
  return (
    <svg viewBox="0 0 220 200" width={230} height={200}>
      {/* Shell */}
      {h('shell') && <>
        <path d="M20,160 Q110,40 200,160" fill="#f0c060" stroke="#c8934a" strokeWidth="3"/>
        <path d="M20,160 Q110,80 200,160" fill="#e8a840" opacity=".5"/>
      </>}
      {/* Meat */}
      {h('meat') && (
        <path d="M40,155 Q110,100 180,155" fill="#8d4c2a" stroke="#6d3c1e" strokeWidth="1"/>
      )}
      {/* Lettuce */}
      {h('lettuce') && [45,75,105,135,160].map((x,i) => (
        <ellipse key={i} cx={x} cy={138-i%2*8} rx="22" ry="12"
          fill="#66bb6a" transform={`rotate(${i*15-30} ${x} 140)`} opacity=".9"/>
      ))}
      {/* Tomato */}
      {h('tomato') && [55,90,125,158].map((cx,i) => (
        <circle key={i} cx={cx} cy={128} r="10" fill="#e53935" opacity=".9"/>
      ))}
      {/* Cheese */}
      {h('cheese') && (
        <path d="M35,143 Q110,115 185,143 L185,152 Q110,125 35,152 Z" fill="#ffc107" opacity=".9"/>
      )}
      {/* Sour cream */}
      {h('sourcream') && (
        <path d="M60,130 Q110,110 155,130" stroke="white" strokeWidth="12"
          fill="none" strokeLinecap="round" opacity=".9"/>
      )}
      {/* Salsa */}
      {h('salsa') && [65,95,125,145].map((cx,i) => (
        <circle key={i} cx={cx} cy={120} r="7" fill="#ff5722" opacity=".8"/>
      ))}
      {/* Jalapeños */}
      {h('jalapeno') && [70,105,140].map((cx,i) => (
        <ellipse key={i} cx={cx} cy={113} rx="12" ry="6" fill="#388e3c"
          transform={`rotate(${i*20-20} ${cx} 113)`}/>
      ))}
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
