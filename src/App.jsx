import { useState } from 'react';
import './App.css';
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
];

export default function App() {
  const [activeTab, setActiveTab] = useState('memory');

  const current = TABS.find(t => t.id === activeTab);

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
