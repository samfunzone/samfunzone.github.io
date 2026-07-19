import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { trackGameView } from './utils/analytics';

// Every game is lazy-loaded so the initial bundle is just the app shell —
// each game's chunk (notably Three.js inside Squishy Stuff) downloads on
// first open. Lazy components must be created at module scope, never
// inside App (that would remount the game on every render).
const MemoryMatch      = lazy(() => import('./components/MemoryMatch'));
const JokeMachine      = lazy(() => import('./components/JokeMachine'));
const DrawingCanvas    = lazy(() => import('./components/DrawingCanvas'));
const SquishyStuff     = lazy(() => import('./components/SquishyStuff'));
const MakingBoba       = lazy(() => import('./components/MakingBoba'));
const MakingYummyFood  = lazy(() => import('./components/MakingYummyFood'));
const DressingDolls    = lazy(() => import('./components/DressingDolls'));
const MakingYourRoom   = lazy(() => import('./components/MakingYourRoom'));
const FamilyFeud       = lazy(() => import('./components/FamilyFeud'));
const RiddleMachine    = lazy(() => import('./components/RiddleMachine'));
const NumberDetective  = lazy(() => import('./components/NumberDetective'));
const BubblePop        = lazy(() => import('./components/BubblePop'));
const WordSearch       = lazy(() => import('./components/WordSearch'));
const Unscramble       = lazy(() => import('./components/Unscramble'));
const DoodleDance      = lazy(() => import('./components/DoodleDance'));
const TamilLetters     = lazy(() => import('./components/TamilLetters'));
const RunningRaces     = lazy(() => import('./components/RunningRaces'));
const DrivingCars      = lazy(() => import('./components/DrivingCars'));
const LittleShop       = lazy(() => import('./components/LittleShop'));

const TABS = [
  { id: 'memory',   label: '🧠 Memory Match',     Component: MemoryMatch },
  { id: 'joke',     label: '😂 Joke Machine',     Component: JokeMachine },
  { id: 'draw',     label: '🎨 Drawing',           Component: DrawingCanvas },
  { id: 'squishy',  label: '🫧 Squishy Stuff',     Component: SquishyStuff },
  { id: 'boba',     label: '🧋 Making Boba',       Component: MakingBoba },
  { id: 'food',     label: '🍽️ Yummy Food',        Component: MakingYummyFood },
  { id: 'dolls',    label: '🪆 Dressing Dolls',    Component: DressingDolls },
  { id: 'room',     label: '🏠 My Room',            Component: MakingYourRoom },
  { id: 'feud',     label: '📺 Family Feud',         Component: FamilyFeud },
  { id: 'riddle',   label: '🧩 Riddle Machine',      Component: RiddleMachine },
  { id: 'numdet',   label: '🔍 Number Detective',    Component: NumberDetective },
  { id: 'bubbles',  label: '🐠 Bubble Pop',          Component: BubblePop },
  { id: 'wordsearch', label: '🔍 Word Search',       Component: WordSearch },
  { id: 'unscramble', label: '🔤 Unscramble',        Component: Unscramble },
  { id: 'doodle',     label: '✏️ Doodle Dance',       Component: DoodleDance },
  { id: 'tamil',      label: 'அ Tamil Tango',         Component: TamilLetters },
  { id: 'runrace',    label: '🏃 Running Races',      Component: RunningRaces },
  { id: 'drivecars',  label: '🚗 Driving Cars',       Component: DrivingCars },
  { id: 'shop',       label: '🛒 Little Shop',        Component: LittleShop },
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
        <Suspense fallback={<div className="game-loading">🎲 Loading…</div>}>
          {current && <current.Component />}
        </Suspense>
      </div>

      <footer className="footer">Made with ❤️ for awesome kids everywhere! 🌈</footer>
    </div>
  );
}
