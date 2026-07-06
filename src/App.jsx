import { useState, useEffect } from 'react';
import './App.css';
import { trackGameView } from './utils/analytics';
import MemoryMatch   from './components/MemoryMatch';
import JokeMachine   from './components/JokeMachine';
import DrawingCanvas  from './components/DrawingCanvas';
import SquishyStuff  from './components/SquishyStuff';
import MakingBoba      from './components/MakingBoba';
import MakingYummyFood from './components/MakingYummyFood';
import DressingDolls   from './components/DressingDolls';
import MakingYourRoom  from './components/MakingYourRoom';
import FamilyFeud      from './components/FamilyFeud';
import RiddleMachine      from './components/RiddleMachine';
import NumberDetective    from './components/NumberDetective';
import BubblePop          from './components/BubblePop';
import WordSearch         from './components/WordSearch';
import Unscramble         from './components/Unscramble';
import DoodleDance        from './components/DoodleDance';
import TamilLetters       from './components/TamilLetters';
import RunningRaces       from './components/RunningRaces';

const TABS = [
  { id: 'memory',   label: '🧠 Memory Match',     component: <MemoryMatch /> },
  { id: 'joke',     label: '😂 Joke Machine',     component: <JokeMachine /> },
  { id: 'draw',     label: '🎨 Drawing',           component: <DrawingCanvas /> },
  { id: 'squishy',  label: '🫧 Squishy Stuff',     component: <SquishyStuff /> },
  { id: 'boba',     label: '🧋 Making Boba',       component: <MakingBoba /> },
  { id: 'food',     label: '🍽️ Yummy Food',        component: <MakingYummyFood /> },
  { id: 'dolls',    label: '🪆 Dressing Dolls',    component: <DressingDolls /> },
  { id: 'room',     label: '🏠 My Room',            component: <MakingYourRoom /> },
  { id: 'feud',     label: '📺 Family Feud',         component: <FamilyFeud /> },
  { id: 'riddle',   label: '🧩 Riddle Machine',      component: <RiddleMachine /> },
  { id: 'numdet',   label: '🔍 Number Detective',    component: <NumberDetective /> },
  { id: 'bubbles',  label: '🐠 Bubble Pop',          component: <BubblePop /> },
  { id: 'wordsearch', label: '🔍 Word Search',       component: <WordSearch /> },
  { id: 'unscramble', label: '🔤 Unscramble',        component: <Unscramble /> },
  { id: 'doodle',     label: '✏️ Doodle Dance',       component: <DoodleDance /> },
  { id: 'tamil',      label: 'அ Tamil Tango',         component: <TamilLetters /> },
  { id: 'runrace',    label: '🏃 Running Races',      component: <RunningRaces /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('memory');

  const current = TABS.find(t => t.id === activeTab);

  // Send a per-game virtual pageview so Umami can report time spent on
  // each game (plus device/region, filterable per game). Fires on the
  // initial game and on every switch.
  useEffect(() => {
    trackGameView(activeTab, current?.label);
  }, [activeTab, current?.label]);

  return (
    <div className="app">
      <header className="header">
        <h1>🎉 Samritha's Fun Zone! 🎉</h1>
        <p>Games, Jokes, Drawing &amp; More!</p>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="container">
        {current?.component}
      </div>

      <footer className="footer">Made with ❤️ for awesome kids everywhere! 🌈</footer>
    </div>
  );
}
