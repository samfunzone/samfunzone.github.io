import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RIDDLES = [
  // ── Wordplay & Language ──
  {
    question: "What word is spelled incorrectly in every single dictionary in the world?",
    answer: "incorrectly",
    aliases: ["the word incorrectly"],
    hint: "The answer is hiding inside the question itself!",
    emoji: "📖",
  },
  {
    question: "What 5-letter word becomes shorter when you add 2 letters to it?",
    answer: "short",
    aliases: ["the word short"],
    hint: "Add 'er' to the end and read what you get.",
    emoji: "📏",
  },
  {
    question: "What begins with T, ends with T, and has T in it?",
    answer: "teapot",
    aliases: ["a teapot", "tea pot"],
    hint: "You pour hot water into me to make a warm drink.",
    emoji: "🫖",
  },
  {
    question: "What starts with E, ends with E, but only has one letter in it?",
    answer: "envelope",
    aliases: ["an envelope"],
    hint: "You seal a letter inside me before mailing it.",
    emoji: "✉️",
  },
  {
    question: "What word looks exactly the same upside down AND backwards?",
    answer: "swims",
    aliases: [],
    hint: "Try rotating the word 180° — it still reads the same!",
    emoji: "🔄",
  },
  {
    question: "How can you make the number 7 even — without adding, subtracting, multiplying, or dividing?",
    answer: "remove the s",
    aliases: ["take away the s", "delete the s", "drop the s", "remove s", "take the s off"],
    hint: "Think about the word 'seven' — what happens when you remove one letter?",
    emoji: "7️⃣",
  },
  {
    question: "What word contains all 26 letters of the alphabet?",
    answer: "alphabet",
    aliases: ["the alphabet"],
    hint: "It's a word that literally describes all the letters!",
    emoji: "🔡",
  },
  {
    question: "What do you call a bear with no ears?",
    answer: "b",
    aliases: ["the letter b", "letter b", "just b"],
    hint: "Take the word 'bear' and remove the letters E-A-R. What's left?",
    emoji: "🐻",
  },

  // ── Trick questions ──
  {
    question: "What month has 28 days?",
    answer: "all of them",
    aliases: ["every month", "all months", "they all do", "all 12"],
    hint: "Does only February have 28 days — or do ALL months have at least 28?",
    emoji: "📅",
  },
  {
    question: "A rooster laid an egg on top of a pointy roof. Which way did the egg roll?",
    answer: "roosters don't lay eggs",
    aliases: ["roosters cant lay eggs", "it didn't roll", "no egg", "it doesnt roll"],
    hint: "Wait — can a rooster actually lay an egg?",
    emoji: "🐓",
  },
  {
    question: "An electric train is heading north. The wind is blowing east. Which way does the smoke blow?",
    answer: "no smoke",
    aliases: ["there is no smoke", "electric trains dont make smoke", "electric trains don't produce smoke", "it doesn't make smoke", "none"],
    hint: "What kind of train is it? Does it burn fuel?",
    emoji: "🚂",
  },
  {
    question: "You have 10 fish in a tank. 2 drown, 4 swim away, and 3 die. How many fish are left?",
    answer: "10",
    aliases: ["ten", "all 10", "all of them", "10 fish"],
    hint: "Can fish really drown? Can they swim AWAY from a closed tank?",
    emoji: "🐠",
  },
  {
    question: "If you have 3 apples and you take away 2, how many apples do YOU have?",
    answer: "2",
    aliases: ["two", "2 apples", "two apples"],
    hint: "The question asks how many YOU have — not how many are left behind.",
    emoji: "🍎",
  },
  {
    question: "David's father has three sons: Snap, Crackle, and ___?",
    answer: "david",
    aliases: ["david!"],
    hint: "Read the very first word of the riddle!",
    emoji: "👦",
  },
  {
    question: "A cowboy rode into town on Friday, stayed exactly 3 days, and rode out on Friday. How is that possible?",
    answer: "friday is the horse",
    aliases: ["his horse is named friday", "the horse is called friday", "horse named friday", "the horse's name is friday", "friday is his horse"],
    hint: "Friday doesn't have to be a day of the week — it could be a name!",
    emoji: "🐴",
  },
  {
    question: "What is found at the very end of a rainbow?",
    answer: "w",
    aliases: ["the letter w", "letter w"],
    hint: "Look at the last letter of the word 'rainbow'.",
    emoji: "🌈",
  },
  {
    question: "How many bricks does it take to complete a house made entirely of bricks?",
    answer: "one",
    aliases: ["1", "just one", "the last one", "1 brick", "one brick"],
    hint: "Which brick actually completes it — the first or the last?",
    emoji: "🧱",
  },

  // ── Logic puzzles ──
  {
    question: "A farmer has 17 sheep. All but 9 run away. How many sheep does he have left?",
    answer: "9",
    aliases: ["nine", "9 sheep", "nine sheep"],
    hint: "'All but 9' means all of them except 9 — read that phrase carefully!",
    emoji: "🐑",
  },
  {
    question: "Two fathers and two sons went fishing. Each one caught exactly one fish. They came home with only 3 fish. How?",
    answer: "three people",
    aliases: ["grandfather father son", "3 people", "there were only 3 people", "grandfather father and son", "its three people"],
    hint: "Count the people — a grandfather, his son, and his grandson.",
    emoji: "🎣",
  },
  {
    question: "You're in a dark room with a candle, a wood stove, and an oil lamp. You only have one match. What do you light first?",
    answer: "the match",
    aliases: ["match", "the match first"],
    hint: "You can't light any of those things without lighting THIS first!",
    emoji: "🕯️",
  },
  {
    question: "A man looks at a painting and says: 'I have no brothers or sisters, but that man's father is my father's son.' Who is in the painting?",
    answer: "his son",
    aliases: ["the man's son", "son", "my son"],
    hint: "'My father's son' with no siblings = me. So 'that man's father' = me. So 'that man' = ...?",
    emoji: "🖼️",
  },
  {
    question: "How far can you walk into a forest?",
    answer: "halfway",
    aliases: ["half way", "half of the way", "to the middle"],
    hint: "After a certain point, you're no longer walking INTO the forest.",
    emoji: "🌲",
  },

  // ── Classic clever riddles ──
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    aliases: ["steps", "footprints", "foot steps"],
    hint: "You make me every time you walk on sand or mud.",
    emoji: "👣",
  },
  {
    question: "What is always in front of you but can never be seen?",
    answer: "future",
    aliases: ["the future"],
    hint: "Tomorrow is part of me, and yesterday is not.",
    emoji: "🔮",
  },
  {
    question: "I don't have lungs but I need air. Water kills me but I keep you warm. What am I?",
    answer: "fire",
    aliases: ["a fire", "flame", "a flame"],
    hint: "You blow me out on birthday candles.",
    emoji: "🔥",
  },
  {
    question: "What can fill a room but takes up no space?",
    answer: "light",
    aliases: ["sunlight", "light."],
    hint: "Flip a switch and I fill the entire room instantly.",
    emoji: "💡",
  },
  {
    question: "What has 13 hearts but no other organs?",
    answer: "deck of cards",
    aliases: ["a deck of cards", "cards", "playing cards", "a pack of cards"],
    hint: "You use me to play Go Fish, Snap, or Uno!",
    emoji: "🃏",
  },
  {
    question: "If I have it, I don't share it. If I share it, I no longer have it. What is it?",
    answer: "secret",
    aliases: ["a secret"],
    hint: "Shhh… once you tell someone, it's gone!",
    emoji: "🤫",
  },
  {
    question: "I have one head, one foot, and four legs. What am I?",
    answer: "bed",
    aliases: ["a bed"],
    hint: "You sleep on me every single night.",
    emoji: "🛏️",
  },
  {
    question: "What do you throw out when you want to use it, and pull back in when you don't need it?",
    answer: "anchor",
    aliases: ["an anchor"],
    hint: "Ships use me to stop drifting in the ocean.",
    emoji: "⚓",
  },
  {
    question: "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?",
    answer: "map",
    aliases: ["a map"],
    hint: "You look at me to find out where you are.",
    emoji: "🗺️",
  },
  {
    question: "What building has the most stories?",
    answer: "library",
    aliases: ["a library", "the library"],
    hint: "You borrow books here for free — and books are full of stories!",
    emoji: "🏛️",
  },
  {
    question: "I speak without a mouth. I hear without ears. I have no body, but I come alive with the wind. What am I?",
    answer: "echo",
    aliases: ["an echo"],
    hint: "Shout in a mountain valley and I shout right back at you!",
    emoji: "🏔️",
  },
  {
    question: "You throw away the outside and cook the inside. Then you eat the outside and throw away the inside. What am I?",
    answer: "corn",
    aliases: ["corn on the cob", "sweetcorn", "a corn cob"],
    hint: "You find me at a summer BBQ, covered in butter!",
    emoji: "🌽",
  },
  {
    question: "What has four legs in the morning, two at noon, and three in the evening?",
    answer: "human",
    aliases: ["a human", "a person", "humans", "person", "people", "man", "a man"],
    hint: "Morning = baby crawling, noon = adult walking, evening = elderly person with a cane.",
    emoji: "👶",
  },
  {
    question: "I'm light as a feather, yet even the strongest person in the world can't hold me for more than a few minutes. What am I?",
    answer: "breath",
    aliases: ["your breath", "air", "breathing"],
    hint: "You need to let me out regularly — or else!",
    emoji: "💨",
  },
  {
    question: "What has keys but no locks, and space but no room?",
    answer: "keyboard",
    aliases: ["a keyboard", "piano", "a piano", "computer keyboard"],
    hint: "You use me to type on a computer.",
    emoji: "⌨️",
  },
  {
    question: "The more of me there is, the less you can see. What am I?",
    answer: "darkness",
    aliases: ["dark", "the dark", "night"],
    hint: "Turn off all the lights and there is a lot of me.",
    emoji: "🌑",
  },
  {
    question: "I have a head and a tail but no body. What am I?",
    answer: "coin",
    aliases: ["a coin"],
    hint: "Flip me to decide who goes first in a game!",
    emoji: "🪙",
  },
  {
    question: "What disappears the very moment you say its name?",
    answer: "silence",
    aliases: ["silence."],
    hint: "There is a lot of me in a very quiet room — until someone opens their mouth.",
    emoji: "🤐",
  },
  {
    question: "What can you hold in your right hand but never in your left hand?",
    answer: "left hand",
    aliases: ["your left hand", "the left hand"],
    hint: "Think carefully — what can your right hand hold that your left hand physically cannot?",
    emoji: "✋",
  },

  // ── New hard ones ──
  {
    question: "I shrink a little every time I take a bath. What am I?",
    answer: "soap",
    aliases: ["a bar of soap", "bar of soap"],
    hint: "You use me to wash your hands and body.",
    emoji: "🧼",
  },
  {
    question: "I am taken from a mine and kept in a wooden case. Almost everyone uses me every single day. What am I?",
    answer: "pencil",
    aliases: ["a pencil"],
    hint: "You use me to write and draw at school. The graphite inside comes from underground.",
    emoji: "✏️",
  },
  {
    question: "The more you take from me, the bigger I get. What am I?",
    answer: "hole",
    aliases: ["a hole"],
    hint: "Dig in the ground — the more dirt you remove, the bigger I become.",
    emoji: "🕳️",
  },
  {
    question: "What is always coming but never actually arrives?",
    answer: "tomorrow",
    aliases: ["the future"],
    hint: "Every morning when you wake up, it is no longer this thing.",
    emoji: "⏳",
  },
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "m",
    aliases: ["the letter m", "letter m"],
    hint: "Don't think about time — look at the actual letters in those words.",
    emoji: "🔤",
  },
  {
    question: "A boy fell off a 30-metre ladder but didn't get hurt at all. How?",
    answer: "he fell off the bottom rung",
    aliases: ["he was on the bottom rung", "he fell from the bottom", "bottom rung", "he was at the bottom"],
    hint: "He fell off the ladder — but where on the ladder was he standing?",
    emoji: "🪜",
  },
  {
    question: "What has a golden head, a golden tail, but no golden body?",
    answer: "coin",
    aliases: ["a coin", "gold coin"],
    hint: "You can flip me — heads or tails!",
    emoji: "🥇",
  },
  {
    question: "I have a bed but never sleep. I have a mouth but never eat. I run but have no legs. What am I?",
    answer: "river",
    aliases: ["a river"],
    hint: "Fish swim in me and I flow toward the sea.",
    emoji: "🌊",
  },
  {
    question: "What goes up when rain comes down?",
    answer: "umbrella",
    aliases: ["an umbrella"],
    hint: "You carry me so you don't get wet.",
    emoji: "☂️",
  },
  {
    question: "I have no legs, but I race. I have no lungs, but I roar. I have no scales, but I leave a silver trail. What am I?",
    answer: "river",
    aliases: ["a river", "waterfall", "a waterfall", "stream", "a stream"],
    hint: "You can kayak or canoe on me!",
    emoji: "🏞️",
  },
  {
    question: "What goes up but never comes down?",
    answer: "age",
    aliases: ["your age", "how old you are"],
    hint: "Every birthday, this number gets one bigger — forever!",
    emoji: "🎂",
  },
];

function norm(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function checkAnswer(input, riddle) {
  const n = norm(input);
  if (!n) return false;
  const targets = [riddle.answer, ...riddle.aliases].map(norm);
  return targets.some(t => n === t || t.includes(n) || n.includes(t));
}

export default function RiddleMachine() {
  // Deal the first riddle from state (refs can't be read during render);
  // the ref keeps the rest of the deck for event handlers to draw from.
  const [initialDeal] = useState(() => shuffle(RIDDLES.map((_, i) => i)));
  const deck = useRef(initialDeal.slice(1));
  const [riddleIdx, setRiddleIdx]   = useState(initialDeal[0]);
  const [phase, setPhase]           = useState('guessing'); // guessing | correct | wrong | revealed
  const [input, setInput]           = useState('');
  const [hintShown, setHintShown]   = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [score, setScore]           = useState({ right: 0, total: 0 });
  const [shake, setShake]           = useState(false);
  const [riddleCount, setRiddleCount] = useState(1);

  const riddle = RIDDLES[riddleIdx];

  const nextRiddle = () => {
    if (deck.current.length === 0) {
      const reshuffled = shuffle(RIDDLES.map((_, i) => i));
      if (reshuffled[0] === riddleIdx) reshuffled.push(reshuffled.shift());
      deck.current = reshuffled;
    }
    setRiddleIdx(deck.current.shift());
    setPhase('guessing');
    setInput('');
    setHintShown(false);
    setAttempts(0);
    setRiddleCount(c => c + 1);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    if (checkAnswer(input, riddle)) {
      setPhase('correct');
      setScore(s => ({ right: s.right + 1, total: s.total + 1 }));
      launchConfetti(window.innerWidth / 2, 300, 40);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      triggerShake();
      if (next >= 3) {
        setPhase('wrong');
        setScore(s => ({ ...s, total: s.total + 1 }));
      } else {
        setPhase('wrong-try');
      }
    }
  };

  const handleReveal = () => {
    if (phase !== 'correct') {
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
    setPhase('revealed');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && phase === 'guessing' || phase === 'wrong-try') handleSubmit();
  };

  const isGuessing = phase === 'guessing' || phase === 'wrong-try';

  return (
    <div className="card card-purple">
      <h2>🧩 Riddle Machine!</h2>

      <div className="riddle-scoreboard">
        <span>⭐ Score: {score.right} / {score.total}</span>
        <span className="riddle-count">Riddle #{riddleCount}</span>
      </div>

      <div className={`riddle-box${shake ? ' riddle-shake' : ''}`}>
        <div className="riddle-emoji">{riddle.emoji}</div>
        <p className="riddle-question">{riddle.question}</p>

        {hintShown && (
          <div className="riddle-hint">
            💡 Hint: {riddle.hint}
          </div>
        )}

        {phase === 'correct' && (
          <div className="riddle-feedback riddle-correct">
            🎉 Amazing! You got it! The answer is <strong>{riddle.answer}</strong>!
          </div>
        )}

        {phase === 'wrong' && (
          <div className="riddle-feedback riddle-wrong">
            😅 Not quite! The answer was <strong>{riddle.answer}</strong>.
          </div>
        )}

        {phase === 'revealed' && (
          <div className="riddle-feedback riddle-revealed">
            🔍 The answer is <strong>{riddle.answer}</strong>!
          </div>
        )}

        {phase === 'wrong-try' && (
          <div className="riddle-feedback riddle-wrong">
            ❌ Not quite — try again! ({3 - attempts} {3 - attempts === 1 ? 'guess' : 'guesses'} left)
          </div>
        )}
      </div>

      {isGuessing && (
        <div className="riddle-input-row">
          <input
            className="riddle-input"
            type="text"
            placeholder="Type your answer here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button className="btn btn-purple" onClick={handleSubmit}>
            Submit ✅
          </button>
        </div>
      )}

      <div className="btn-row">
        {isGuessing && !hintShown && (
          <button className="btn btn-outline" onClick={() => setHintShown(true)}>
            Show Hint 💡
          </button>
        )}
        {isGuessing && (
          <button className="btn btn-outline" onClick={handleReveal}>
            Give Up 🏳️
          </button>
        )}
        {(phase === 'correct' || phase === 'wrong' || phase === 'revealed') && (
          <button className="btn btn-purple" onClick={nextRiddle}>
            Next Riddle ➡️
          </button>
        )}
      </div>
    </div>
  );
}
