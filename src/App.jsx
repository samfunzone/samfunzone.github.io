import { useState } from 'react';
import './App.css';
import WhackAMole    from './components/WhackAMole';
import BalloonPopper from './components/BalloonPopper';
import MemoryMatch   from './components/MemoryMatch';
import JokeMachine   from './components/JokeMachine';
import DrawingCanvas  from './components/DrawingCanvas';
import SquishyStuff  from './components/SquishyStuff';
import MakingBoba      from './components/MakingBoba';
import MakingYummyFood from './components/MakingYummyFood';
import DressingDolls   from './components/DressingDolls';

const TABS = [
  { id: 'whack',    label: '🦔 Whack-a-Mole',   component: <WhackAMole /> },
  { id: 'balloon',  label: '🎈 Balloon Pop',      component: <BalloonPopper /> },
  { id: 'memory',   label: '🧠 Memory Match',     component: <MemoryMatch /> },
  { id: 'joke',     label: '😂 Joke Machine',     component: <JokeMachine /> },
  { id: 'draw',     label: '🎨 Drawing',           component: <DrawingCanvas /> },
  { id: 'squishy',  label: '🫧 Squishy Stuff',     component: <SquishyStuff /> },
  { id: 'boba',     label: '🧋 Making Boba',       component: <MakingBoba /> },
  { id: 'food',     label: '🍽️ Yummy Food',        component: <MakingYummyFood /> },
  { id: 'dolls',    label: '🪆 Dressing Dolls',    component: <DressingDolls /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('whack');

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
