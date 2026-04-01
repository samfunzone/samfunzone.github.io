import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

const JOKES = [
  { setup: "Why don't scientists trust atoms?",       punchline: "Because they make up everything! 😄" },
  { setup: "What do you call a sleeping dinosaur?",   punchline: "A dino-snore! 🦕💤" },
  { setup: "Why did the scarecrow win an award?",     punchline: "He was outstanding in his field! 🌾" },
  { setup: "What do elves learn in school?",          punchline: "The elf-abet! 🧝" },
  { setup: "Why can't Elsa have a balloon?",          punchline: "Because she'll let it go! ❄️🎈" },
  { setup: "What do you call a fish without eyes?",   punchline: "A fsh! 🐟" },
  { setup: "Why did the bicycle fall over?",          punchline: "It was two-tired! 🚲" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese! 🧀" },
  { setup: "How do you organize a space party?",      punchline: "You planet! 🪐" },
  { setup: "What did the ocean say to the beach?",    punchline: "Nothing, it just waved! 🌊" },
  { setup: "Why did the math book look so sad?",      punchline: "Because it had too many problems! 📚" },
  { setup: "What do you call a bear with no teeth?",  punchline: "A gummy bear! 🐻" },
];

export default function JokeMachine() {
  const [jokeIdx,   setJokeIdx]   = useState(-1);
  const [phase,     setPhase]     = useState(0);   // 0=initial, 1=setup shown, 2=punchline shown

  const btnLabel = phase === 1 ? 'Why? Tell me! 👀' : 'Tell me a joke! 🤣';

  const handle = () => {
    if (phase === 0 || phase === 2) {
      setJokeIdx(i => (i + 1) % JOKES.length);
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
