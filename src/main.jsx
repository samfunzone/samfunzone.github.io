import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// After a redeploy the hashed chunk filenames change; a stale open tab
// that lazy-loads a game would 404 on the old chunk URL. Vite reports
// this as vite:preloadError — reload to pick up the new build.
window.addEventListener('vite:preloadError', () => window.location.reload())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
