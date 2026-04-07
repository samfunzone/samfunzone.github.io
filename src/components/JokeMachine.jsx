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

const JOKES = [
  { setup: "Why don't scientists trust atoms?",            punchline: "Because they make up everything! 😄" },
  { setup: "What do you call a sleeping dinosaur?",        punchline: "A dino-snore! 🦕💤" },
  { setup: "Why did the scarecrow win an award?",          punchline: "He was outstanding in his field! 🌾" },
  { setup: "What do elves learn in school?",               punchline: "The elf-abet! 🧝" },
  { setup: "Why can't Elsa have a balloon?",               punchline: "Because she'll let it go! ❄️🎈" },
  { setup: "What do you call a fish without eyes?",        punchline: "A fsh! 🐟" },
  { setup: "Why did the bicycle fall over?",               punchline: "It was two-tired! 🚲" },
  { setup: "What do you call cheese that isn't yours?",    punchline: "Nacho cheese! 🧀" },
  { setup: "How do you organize a space party?",           punchline: "You planet! 🪐" },
  { setup: "What did the ocean say to the beach?",         punchline: "Nothing, it just waved! 🌊" },
  { setup: "Why did the math book look so sad?",           punchline: "Because it had too many problems! 📚" },
  { setup: "What do you call a bear with no teeth?",       punchline: "A gummy bear! 🐻" },
  { setup: "Why did the banana go to the doctor?",         punchline: "Because it wasn't peeling well! 🍌" },
  { setup: "What do you call a dog magician?",             punchline: "A labra-cadabra-dor! 🐶✨" },
  { setup: "What do you get when you cross a snowman and a vampire?", punchline: "Frostbite! ⛄🧛" },
  { setup: "Why did the teddy bear say no to dessert?",    punchline: "Because she was already stuffed! 🧸" },
  { setup: "What do you call a pig that does karate?",     punchline: "A pork chop! 🐷🥋" },
  { setup: "What do you call a cow that plays guitar?",    punchline: "A moo-sician! 🐮🎸" },
  { setup: "Why do cows wear bells?",                      punchline: "Because their horns don't work! 🐄🔔" },
  { setup: "What do you call a lazy kangaroo?",            punchline: "A pouch potato! 🦘" },
  { setup: "Why did the tomato turn red?",                 punchline: "Because it saw the salad dressing! 🍅" },
  { setup: "What do you call a dinosaur that crashes their car?", punchline: "Tyrannosaurus wrecks! 🦖💥" },
  { setup: "Why don't elephants use computers?",           punchline: "Because they're afraid of the mouse! 🐘🖱️" },
  { setup: "What do you call a sleeping bull?",            punchline: "A bull-dozer! 🐂😴" },
  { setup: "Why did the student eat his homework?",        punchline: "The teacher said it was a piece of cake! 📝🎂" },
  { setup: "What do you call a belt made of watches?",     punchline: "A waist of time! ⌚" },
  { setup: "Why did the computer go to the doctor?",       punchline: "Because it had a virus! 💻🤒" },
  { setup: "What did one wall say to the other?",          punchline: "I'll meet you at the corner! 🏠" },
  { setup: "What do you call a funny mountain?",           punchline: "Hill-arious! ⛰️😄" },
  { setup: "Why did the golfer bring extra pants?",        punchline: "In case he got a hole in one! ⛳👖" },
];

export default function JokeMachine() {
  const [jokeIdx, setJokeIdx] = useState(-1);
  const [phase,   setPhase]   = useState(0); // 0=initial, 1=setup shown, 2=punchline shown
  // Shuffled order deck; refilled and reshuffled when exhausted
  const deck = useRef(shuffle(JOKES.map((_, i) => i)));

  const btnLabel = phase === 1 ? 'Why? Tell me! 👀' : 'Tell me a joke! 🤣';

  const handle = () => {
    if (phase === 0 || phase === 2) {
      if (deck.current.length === 0) {
        // Reshuffle, but don't start with the joke we just showed
        const reshuffled = shuffle(JOKES.map((_, i) => i));
        if (reshuffled[0] === jokeIdx) reshuffled.push(reshuffled.shift());
        deck.current = reshuffled;
      }
      setJokeIdx(deck.current.shift());
      setPhase(1);
    } else {
      launchConfetti(window.innerWidth / 2, 300, 20);
      setPhase(2);
    }
  };

  const joke = jokeIdx >= 0 ? JOKES[jokeIdx] : null;

  return (
    <div className="card card-orange">
      <h2>😂 Joke Machine!</h2>
      <div className="joke-box">
        <div>{joke ? joke.setup : 'Press the button for a joke!'}</div>
        {phase === 2 && joke && (
          <div className="joke-punchline">{joke.punchline}</div>
        )}
      </div>
      <div className="btn-row">
        <button className="btn btn-orange" onClick={handle}>{btnLabel}</button>
      </div>
    </div>
  );
}
