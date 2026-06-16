// Tiny wrapper around the Web Speech API for Tamil letter pronunciation.
// No assets needed; quality depends on the device's installed voices.
let voice = null;

function pick() {
  const vs = window.speechSynthesis?.getVoices?.() || [];
  voice =
    vs.find(v => v.lang === 'ta-IN') ||
    vs.find(v => v.lang?.startsWith('ta')) ||
    null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  pick();
  // Voices load asynchronously in most browsers.
  window.speechSynthesis.addEventListener('voiceschanged', pick);
}

// Speak `text`. Always triggered by a user tap so browsers allow it.
export function speak(text, rate = 0.85) {
  const s = window.speechSynthesis;
  if (!s) return;
  s.cancel(); // stop any in-flight utterance so taps don't pile up
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ta-IN';
  if (voice) u.voice = voice;
  u.rate = rate;
  s.speak(u);
}

export const hasTamilVoice = () =>
  (window.speechSynthesis?.getVoices?.() || []).some(v => v.lang?.startsWith('ta'));

// Play a pre-recorded clip (accurate Tamil voice bundled as a static asset).
// Falls back to Web Speech `fallbackText` if the clip can't be played.
const clipCache = new Map();
let current = null;
export function playClip(url, fallbackText = '') {
  window.speechSynthesis?.cancel(); // stop any TTS fallback in flight
  if (current) { try { current.pause(); current.currentTime = 0; } catch { /* ignore */ } }
  let audio = clipCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    clipCache.set(url, audio);
  }
  current = audio;
  audio.currentTime = 0;
  const done = audio.play();
  const fail = () => { if (fallbackText) speak(fallbackText); };
  if (done && done.catch) done.catch(fail);
  audio.onerror = fail; // missing/blocked file → spoken fallback
}
