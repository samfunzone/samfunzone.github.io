# Plan: Per-Game Usage Metrics

Goal: know which games kids actually use (opens, unique visitors, optionally
"completed/won") for this static app hosted on GitHub Pages.

## Why this approach

GitHub Pages is plain static hosting — there are **no server logs you can
access**, so all metrics must be collected **client-side**: a small analytics
script in the browser sends events to a third-party (or self-hosted) collector,
which gives you a dashboard.

The app makes per-game tracking trivial because **every game switch flows
through one place**: the tab `onClick` in `src/App.jsx` (`setActiveTab`). One
tracking call there → per-game usage for all 16 games, keyed by `tab.id`.

## Provider decision (do this first)

This is a **kids' app**, so privacy/consent law matters (COPPA, GDPR-K). Pick one:

| Tool | Cost | Custom events | Notes |
|------|------|--------------|-------|
| **Umami (self-hosted)** | Free (you host) | ✅ | Cookieless → no consent banner. Best if you have somewhere to host it (Vercel/Fly/Railway free tiers + a DB). **Recommended if you don't mind hosting.** |
| **Plausible (hosted)** | ~$9/mo | ✅ | Cookieless → no consent banner. Zero ops. **Recommended if you want zero setup.** |
| Cloudflare Web Analytics | Free | ⚠️ weak/none | Privacy-friendly but poor at custom per-game events — only good for overall pageviews. |
| PostHog | Free tier (1M ev/mo) | ✅ excellent | Powerful but heavier; cookie/consent considerations. |
| Google Analytics 4 | Free | ✅ | Most powerful but cookies + consent banner + GA-on-children's-app is legally fiddly. Avoid for this app. |

**Default recommendation:** Plausible (hosted) for least effort, or Umami
(self-hosted) for free + privacy. Both are cookieless and support the one
custom event we need, so the implementation below is identical for both
(only the snippet + the `track()` body differ).

## Implementation steps

### 1. Add the analytics script — `index.html`
Add the provider's snippet inside `<head>`. Example (Plausible):
```html
<script defer data-domain="samfunzone.github.io"
        src="https://plausible.io/js/script.tagged-events.js"></script>
```
(Umami gives a similar single `<script defer src=... data-website-id=...>` tag.)

### 2. Create a tiny tracking helper — `src/utils/analytics.js`
Wrap the provider call so the rest of the app stays provider-agnostic and it's
safe when the script is blocked / not loaded:
```js
// Fire a named analytics event with optional props.
// No-ops safely if the analytics script didn't load (ad-blockers, offline).
export function track(event, props) {
  try {
    // Plausible:
    window.plausible?.(event, { props });
    // Umami (if using Umami instead): window.umami?.track(event, props);
  } catch {
    /* analytics must never break the app */
  }
}
```

### 3. Fire the event on game open — `src/App.jsx`
In the tab button `onClick` (around `src/App.jsx:56`):
```jsx
import { track } from './utils/analytics';
// ...
onClick={() => {
  setActiveTab(tab.id);
  track('game_open', { game: tab.id });
}}
```
`tab.id` (e.g. `bubbles`, `tamil`, `boba`) becomes the per-game dimension in
the dashboard.

### 4. (Optional) Richer events later
Add `track(...)` at meaningful moments inside individual games:
- `track('game_won', { game: 'numdet', stars: 3 })`
- `track('round_complete', { game: 'tamil', score })`
These need a per-game edit but give engagement/quality metrics, not just opens.

### 5. Verify
- `npm run dev`, open the app, click through a few games.
- Confirm events appear in the provider's live/real-time dashboard.
- Test with an ad-blocker on to confirm the app still works (the `try/catch`
  no-op handles it).

### 6. Deploy
- Commit + push to `main`; the existing GitHub Pages workflow
  (`.github/workflows/deploy.yml`) ships it.

## Effort estimate
- Provider signup/config: 10–20 min (Plausible) or ~1 hr (self-host Umami).
- Code: ~3 edits, ~10 lines total (steps 1–3). Step 4 optional/incremental.

## Privacy note / TODO
- Both recommended tools are cookieless and collect no personal data, so a
  consent banner is generally not required — but confirm against the rules for
  your audience/region before launch.
- Consider adding a short privacy line to the footer if you publish metrics.
